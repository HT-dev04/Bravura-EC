import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type ShareItem = {
  id: string;
  name: string;
  photo?: string;
  value: number;
  label: string;
};

type Payload = {
  title: string;
  subtitle: string;
  variant: 1 | 2;
  items: ShareItem[];
};

const GOLD = "#d4af37";
const RED = "#c8102e";
const WHITE = "#ffffff";
const PUBLIC_DIR = path.join(process.cwd(), "public");
const PHOTO_SIZE = 220;
const PHOTO_TIMEOUT_MS = 6000;

// Caches por lambda “quente” — moldura e fontes não mudam entre requisições.
const fontCache = new Map<string, Buffer>();
const frameCache = new Map<number, string>();

function decodePayload(d: string): Payload {
  const normalized = d.replace(/-/g, "+").replace(/_/g, "/");
  const json = Buffer.from(normalized, "base64").toString("utf8");
  return JSON.parse(json) as Payload;
}

async function loadFont(file: string) {
  const cached = fontCache.get(file);
  if (cached) return cached;
  const buffer = await readFile(path.join(PUBLIC_DIR, "fonts", file));
  fontCache.set(file, buffer);
  return buffer;
}

// Redimensiona a moldura para 1080x1920 exatos — reduz o trabalho do renderizador.
async function loadFrame(variant: 1 | 2) {
  const cached = frameCache.get(variant);
  if (cached) return cached;
  const file = variant === 2 ? "moldura-ranking3.png" : "moldura-ranking2.png";
  const buffer = await readFile(path.join(PUBLIC_DIR, file));
  const resized = await sharp(buffer).resize(1080, 1920, { fit: "cover" }).jpeg({ quality: 88 }).toBuffer();
  const dataUrl = `data:image/jpeg;base64,${resized.toString("base64")}`;
  frameCache.set(variant, dataUrl);
  return dataUrl;
}

async function fetchWithTimeout(url: string, ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Baixa a foto, recorta num quadrado pequeno e devolve como data URL.
// Qualquer falha (timeout, formato inválido, host fora do ar) cai no fallback (inicial).
async function loadPhoto(src?: string): Promise<string | undefined> {
  if (!src) return undefined;
  if (src.startsWith("data:")) return src;

  let source: Buffer | null = null;
  if (/^https?:\/\//i.test(src)) {
    source = await fetchWithTimeout(src, PHOTO_TIMEOUT_MS);
  } else if (src.startsWith("/")) {
    try {
      source = await readFile(path.join(PUBLIC_DIR, src.replace(/^\/+/, "")));
    } catch {
      source = null;
    }
  }
  if (!source) return undefined;

  try {
    // Máscara circular: a foto já sai redonda (cantos transparentes),
    // garantindo o recorte perfeito independente do renderizador.
    const mask = Buffer.from(
      `<svg width="${PHOTO_SIZE}" height="${PHOTO_SIZE}"><circle cx="${PHOTO_SIZE / 2}" cy="${PHOTO_SIZE / 2}" r="${PHOTO_SIZE / 2}" fill="#fff"/></svg>`
    );
    const out = await sharp(source)
      .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: "cover", position: "centre" })
      .composite([{ input: mask, blend: "dest-in" }])
      .png()
      .toBuffer();
    return `data:image/png;base64,${out.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const d = url.searchParams.get("d");
  if (!d) return new Response("Parâmetro 'd' obrigatório", { status: 400 });

  let payload: Payload;
  try {
    payload = decodePayload(d);
  } catch {
    return new Response("Payload inválido", { status: 400 });
  }

  const { title, subtitle } = payload;
  const variant: 1 | 2 = payload.variant === 2 ? 2 : 1;
  const listTop = variant === 2 ? 635 : 735;
  const rawItems = (payload.items || [])
    .filter((item) => item && item.name && Number.isFinite(item.value))
    .slice(0, 5);

  let frameSrc: string;
  let fonts;
  let items: Array<ShareItem & { resolvedPhoto?: string }>;
  try {
    const [frame, medium, semibold, bold, photos] = await Promise.all([
      loadFrame(variant),
      loadFont("Oswald-500.ttf"),
      loadFont("Oswald-600.ttf"),
      loadFont("Oswald-700.ttf"),
      Promise.all(rawItems.map((item) => loadPhoto(item.photo))),
    ]);
    frameSrc = frame;
    fonts = [
      { name: "Oswald", data: medium, weight: 500 as const, style: "normal" as const },
      { name: "Oswald", data: semibold, weight: 600 as const, style: "normal" as const },
      { name: "Oswald", data: bold, weight: 700 as const, style: "normal" as const },
    ];
    items = rawItems.map((item, index) => ({ ...item, resolvedPhoto: photos[index] }));
  } catch {
    return new Response("Falha ao montar a imagem", { status: 500 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "1080px",
          height: "1920px",
          backgroundColor: "#0a0a0a",
          fontFamily: "Oswald",
          color: WHITE,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={frameSrc}
          alt=""
          width={1080}
          height={1920}
          style={{ position: "absolute", top: 0, left: 0, width: "1080px", height: "1920px", objectFit: "cover" }}
        />

        <div
          style={{
            position: "absolute",
            left: "122px",
            top: `${listTop}px`,
            width: "836px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div
              style={{
                display: "flex",
                color: RED,
                fontSize: "30px",
                fontWeight: 700,
                letterSpacing: "8px",
                textTransform: "uppercase",
              }}
            >
              {subtitle}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: "12px",
                color: WHITE,
                fontSize: "66px",
                fontWeight: 700,
                lineHeight: 1,
                textTransform: "uppercase",
                textShadow: "0 3px 8px rgba(0,0,0,0.95)",
              }}
            >
              {title}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: "48px", gap: "20px" }}>
            {items.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "208px",
                  borderRadius: "24px",
                  border: `1px solid ${GOLD}`,
                  backgroundColor: "rgba(0,0,0,0.45)",
                  padding: "0 40px",
                }}
              >
                <div style={{ display: "flex", fontSize: "44px", fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>
                  Sem dados para este filtro
                </div>
              </div>
            ) : (
              items.map((item, index) => {
                const isLeader = index === 0;
                const badge = isLeader ? 96 : 72;
                const photo = item.resolvedPhoto;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "24px",
                      borderRadius: "22px",
                      padding: "0 28px",
                      minHeight: isLeader ? "160px" : "128px",
                      border: isLeader ? `1px solid ${GOLD}` : "1px solid rgba(212,175,55,0.35)",
                      background: isLeader
                        ? "linear-gradient(135deg, rgba(212,175,55,0.34), rgba(120,0,0,0.44), rgba(0,0,0,0.72))"
                        : "rgba(0,0,0,0.52)",
                      boxShadow: "0 18px 38px rgba(0,0,0,0.48)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        width: `${badge}px`,
                        height: `${badge}px`,
                        borderRadius: "16px",
                        backgroundColor: isLeader ? GOLD : RED,
                        color: isLeader ? "#0a0a0a" : WHITE,
                        fontSize: isLeader ? "44px" : "30px",
                        fontWeight: 700,
                      }}
                    >
                      {`${index + 1}º`}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        width: `${badge}px`,
                        height: `${badge}px`,
                        borderRadius: "9999px",
                        border: `2px solid ${GOLD}`,
                        backgroundColor: "#0a0a0a",
                        overflow: "hidden",
                      }}
                    >
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photo}
                          alt=""
                          width={badge}
                          height={badge}
                          style={{ width: `${badge}px`, height: `${badge}px`, objectFit: "cover", borderRadius: "9999px" }}
                        />
                      ) : (
                        <div style={{ display: "flex", fontSize: "32px", fontWeight: 700, color: GOLD, textTransform: "uppercase" }}>
                          {item.name.slice(0, 1)}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          fontSize: isLeader ? "46px" : "36px",
                          fontWeight: 700,
                          color: WHITE,
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          marginTop: "6px",
                          fontSize: "20px",
                          textTransform: "uppercase",
                          letterSpacing: "4px",
                          color: "rgba(212,175,55,0.75)",
                        }}
                      >
                        Bravura Futebol Clube
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          fontSize: isLeader ? "60px" : "48px",
                          fontWeight: 700,
                          lineHeight: 1,
                          color: isLeader ? GOLD : RED,
                        }}
                      >
                        {`${item.value}`}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          marginTop: "6px",
                          fontSize: "20px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "3px",
                          color: "rgba(255,255,255,0.65)",
                        }}
                      >
                        {item.label}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
