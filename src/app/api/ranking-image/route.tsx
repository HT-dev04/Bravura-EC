import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { isRankingArtStyle, type RankingArtStyle, type RankingShareItem } from "@/lib/ranking-share";
import { getObject, MEDIA_PREFIX } from "@/lib/storage";
import {
  ART_HEIGHT,
  ART_WIDTH,
  CardsArt,
  CoverArt,
  FrameOverlay,
  HeadlineArt,
  NeonArt,
  PodiumArt,
  ScoreboardArt,
  SpotlightArt,
  type ArtItem,
  type ArtProps,
  type FrameSiteBox,
} from "./layouts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type Payload = {
  title: string;
  subtitle: string;
  style: RankingArtStyle;
  site: string;
  items: RankingShareItem[];
};

const PUBLIC_DIR = path.join(process.cwd(), "public");
const PHOTO_TIMEOUT_MS = 6000;
const DEFAULT_SITE = "bravura.avontz.com.br";

// Molduras prontas: arquivo em public/, onde começa a área livre para a lista e
// onde fica o endereço do site estampado na arte (coberto com o domínio atual).
const FRAMES: Partial<Record<RankingArtStyle, { file: string; listTop: number; siteBox: FrameSiteBox }>> = {
  classica: {
    file: "moldura-ranking2.png",
    listTop: 735,
    siteBox: { left: 290, top: 1724, width: 500, height: 64, background: "#260503", color: "#d4af37", fontSize: 36, pill: true },
  },
  ouro: {
    file: "moldura-ranking3.png",
    listTop: 635,
    siteBox: { left: 200, top: 1688, width: 680, height: 86, background: "#070707", color: "#ffffff", fontSize: 56, pill: false },
  },
};

// Formato da foto que cada estilo usa por posição: círculo (padrão) ou retrato com cantos arredondados.
type PhotoSpec = { width: number; height: number; radius?: number; large?: boolean };

const CIRCLE_SMALL: PhotoSpec = { width: 220, height: 220 };
const CIRCLE_LARGE: PhotoSpec = { width: 360, height: 360, large: true };

const PHOTO_SPECS: Record<RankingArtStyle, (index: number) => PhotoSpec> = {
  podio: (index) => (index < 3 ? CIRCLE_LARGE : CIRCLE_SMALL),
  destaque: (index) => (index === 0 ? CIRCLE_LARGE : CIRCLE_SMALL),
  classica: () => CIRCLE_SMALL,
  ouro: () => CIRCLE_SMALL,
  capa: (index) => (index === 0 ? { width: 760, height: 1000, radius: 0, large: true } : CIRCLE_SMALL),
  figurinha: (index) => (index === 0 ? { width: 560, height: 540, radius: 22, large: true } : { width: 188, height: 230, radius: 14 }),
  placar: () => CIRCLE_SMALL,
  neon: (index) => (index === 0 ? CIRCLE_LARGE : CIRCLE_SMALL),
  manchete: (index) => (index === 0 ? { width: 460, height: 580, radius: 0, large: true } : CIRCLE_SMALL),
};

// Caches do processo — molduras, fontes e escudo não mudam; fotos e artes prontas têm limite de itens.
const fontCache = new Map<string, Buffer>();
const frameCache = new Map<string, Buffer>();
const photoCache = new Map<string, string | undefined>();
const artCache = new Map<string, { image: Buffer; at: number }>();
const artInFlight = new Map<string, Promise<Buffer>>();
let logoCache: string | undefined;

const PHOTO_CACHE_LIMIT = 120;
const ART_CACHE_LIMIT = 40;
const ART_CACHE_TTL_MS = 60 * 60 * 1000;

function remember<V>(cache: Map<string, V>, key: string, value: V, limit: number) {
  cache.delete(key);
  cache.set(key, value);
  if (cache.size > limit) cache.delete(cache.keys().next().value as string);
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function decodePayload(d: string): Payload {
  const normalized = d.replace(/-/g, "+").replace(/_/g, "/");
  const raw = JSON.parse(Buffer.from(normalized, "base64").toString("utf8")) as Record<string, unknown>;

  // Links antigos mandavam `variant` (1 ou 2) no lugar de `style`.
  const style = isRankingArtStyle(raw.style) ? raw.style : raw.variant === 2 ? "ouro" : "classica";
  const items = (Array.isArray(raw.items) ? raw.items : [])
    .map((item: Record<string, unknown>): RankingShareItem => ({
      id: text(item?.id, 80),
      name: text(item?.name, 28),
      photo: text(item?.photo, 600) || undefined,
      value: Number(item?.value),
      label: text(item?.label, 16),
      number: Number.isInteger(item?.number) && (item.number as number) > 0 ? (item.number as number) : undefined,
    }))
    .filter((item) => item.name && Number.isFinite(item.value))
    .slice(0, 5);

  return {
    title: text(raw.title, 40),
    subtitle: text(raw.subtitle, 40),
    style,
    site: text(raw.site, 60) || DEFAULT_SITE,
    items,
  };
}

async function loadFont(file: string) {
  const cached = fontCache.get(file);
  if (cached) return cached;
  const buffer = await readFile(path.join(PUBLIC_DIR, "fonts", file));
  fontCache.set(file, buffer);
  return buffer;
}

async function loadFonts() {
  const [medium, semibold, bold] = await Promise.all([loadFont("Oswald-500.ttf"), loadFont("Oswald-600.ttf"), loadFont("Oswald-700.ttf")]);
  return [
    { name: "Oswald", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Oswald", data: semibold, weight: 600 as const, style: "normal" as const },
    { name: "Oswald", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}

// Moldura já no tamanho final e sem compressão: a lista é só colada por cima a cada requisição.
async function loadFrame(file: string) {
  const cached = frameCache.get(file);
  if (cached) return cached;
  const raw = await sharp(await readFile(path.join(PUBLIC_DIR, file)))
    .resize(ART_WIDTH, ART_HEIGHT, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer();
  frameCache.set(file, raw);
  return raw;
}

async function loadLogo() {
  if (logoCache) return logoCache;
  try {
    const buffer = await readFile(path.join(PUBLIC_DIR, "bravura-escudo.png"));
    logoCache = `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    return undefined;
  }
  return logoCache;
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

async function readPhotoSource(src: string) {
  if (/^https?:\/\//i.test(src)) return fetchWithTimeout(src, PHOTO_TIMEOUT_MS);
  if (src.startsWith(MEDIA_PREFIX)) return (await getObject(src.slice(MEDIA_PREFIX.length)).catch(() => null))?.body ?? null;
  if (src.startsWith("/")) {
    // Só arquivos de dentro de public/.
    const filePath = path.resolve(PUBLIC_DIR, src.replace(/^\/+/, ""));
    if (!filePath.startsWith(PUBLIC_DIR + path.sep)) return null;
    return readFile(filePath).catch(() => null);
  }
  return null;
}

// Recorta a foto no formato pedido (círculo ou retrato com cantos) e devolve como data URL.
// Qualquer falha (timeout, formato inválido, host fora do ar) cai no fallback (inicial).
async function loadPhoto(src: string | undefined, spec: PhotoSpec): Promise<string | undefined> {
  if (!src) return undefined;
  if (src.startsWith("data:")) return src;

  const { width, height } = spec;
  const radius = spec.radius ?? Math.min(width, height) / 2;
  const key = `${width}x${height}r${radius}:${src}`;
  if (photoCache.has(key)) return photoCache.get(key);

  let photo: string | undefined;
  try {
    const source = await readPhotoSource(src);
    if (source) {
      // Máscara aplicada aqui: a foto já sai recortada (cantos transparentes),
      // garantindo o recorte perfeito independente do renderizador.
      // Retratos ancoram no topo para não cortar o rosto; círculos ficam centralizados como antes.
      const mask = Buffer.from(`<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`);
      const out = await sharp(source)
        .rotate()
        .resize(width, height, { fit: "cover", position: width === height ? "centre" : "top" })
        .composite([{ input: mask, blend: "dest-in" }])
        .png({ compressionLevel: 3 })
        .toBuffer();
      photo = `data:image/png;base64,${out.toString("base64")}`;
    }
  } catch {
    photo = undefined;
  }

  // Falhas não ficam em cache: a próxima requisição tenta de novo.
  if (photo) remember(photoCache, key, photo, PHOTO_CACHE_LIMIT);
  return photo;
}

async function renderPng(element: ReactElement, fonts: Awaited<ReturnType<typeof loadFonts>>) {
  const response = new ImageResponse(element, { width: ART_WIDTH, height: ART_HEIGHT, fonts });
  return Buffer.from(await response.arrayBuffer());
}

function toJpeg(image: sharp.Sharp) {
  // 4:4:4 mantém as letras vermelhas e douradas nítidas sobre o fundo escuro.
  return image.jpeg({ quality: 88, chromaSubsampling: "4:4:4" }).toBuffer();
}

const LAYOUTS: Partial<Record<RankingArtStyle, (props: ArtProps) => ReactElement>> = {
  podio: PodiumArt,
  destaque: SpotlightArt,
  capa: CoverArt,
  figurinha: CardsArt,
  placar: ScoreboardArt,
  neon: NeonArt,
  manchete: HeadlineArt,
};

async function renderArt(payload: Payload) {
  const photoSpec = PHOTO_SPECS[payload.style];
  const frame = FRAMES[payload.style];

  const [fonts, logo, photos, frameRaw] = await Promise.all([
    loadFonts(),
    frame ? undefined : loadLogo(),
    Promise.all(
      payload.items.map(async (item, index): Promise<Pick<ArtItem, "photoSmall" | "photoLarge">> => {
        const spec = photoSpec(index);
        const photo = await loadPhoto(item.photo, spec);
        return spec.large ? { photoLarge: photo } : { photoSmall: photo };
      })
    ),
    frame ? loadFrame(frame.file) : undefined,
  ]);

  const props: ArtProps = {
    title: payload.title,
    subtitle: payload.subtitle,
    site: payload.site,
    logo,
    items: payload.items.map((item, index) => ({ ...item, ...photos[index] })),
  };

  if (frame && frameRaw) {
    const overlay = await renderPng(<FrameOverlay {...props} listTop={frame.listTop} siteBox={frame.siteBox} />, fonts);
    return toJpeg(sharp(frameRaw, { raw: { width: ART_WIDTH, height: ART_HEIGHT, channels: 3 } }).composite([{ input: overlay }]));
  }

  const Layout = LAYOUTS[payload.style] || PodiumArt;
  const art = <Layout {...props} />;
  return toJpeg(sharp(await renderPng(art, fonts)).flatten({ background: "#0a0a0a" }));
}

// Mesma arte pedida duas vezes (pré-carregamento + prévia, ou vários torcedores) é gerada uma vez só.
async function getArt(payload: Payload) {
  const key = JSON.stringify(payload);
  const cached = artCache.get(key);
  if (cached && Date.now() - cached.at < ART_CACHE_TTL_MS) return cached.image;

  let pending = artInFlight.get(key);
  if (!pending) {
    pending = renderArt(payload)
      .then((image) => {
        remember(artCache, key, { image, at: Date.now() }, ART_CACHE_LIMIT);
        return image;
      })
      .finally(() => artInFlight.delete(key));
    artInFlight.set(key, pending);
  }
  return pending;
}

export async function GET(request: Request) {
  const d = new URL(request.url).searchParams.get("d");
  if (!d) return new Response("Parâmetro 'd' obrigatório", { status: 400 });

  let payload: Payload;
  try {
    payload = decodePayload(d);
  } catch {
    return new Response("Payload inválido", { status: 400 });
  }

  try {
    const image = await getArt(payload);
    return new Response(new Uint8Array(image), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(image.length),
        // A URL carrega todos os dados da arte: mudou um número, mudou a URL.
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Falha ao gerar a arte do ranking", error);
    return new Response("Falha ao montar a imagem", { status: 500 });
  }
}
