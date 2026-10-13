/* eslint-disable @next/next/no-img-element */
// Layouts das artes de ranking, renderizados pelo next/og (Satori): só flexbox e CSS inline.
import type { CSSProperties, ReactElement } from "react";
import type { RankingShareItem } from "@/lib/ranking-share";

export const ART_WIDTH = 1080;
export const ART_HEIGHT = 1920;

const GOLD = "#d4af37";
const RED = "#c8102e";
const WHITE = "#ffffff";
const BLACK = "#0a0a0a";
const MEDALS = [GOLD, "#c7ccd1", "#c0773a"];

export type ArtItem = RankingShareItem & {
  /** Foto já recortada em círculo (data URL). `photoLarge` só vem para quem aparece em destaque. */
  photoSmall?: string;
  photoLarge?: string;
};

export type ArtProps = {
  title: string;
  subtitle: string;
  site: string;
  logo?: string;
  items: ArtItem[];
};

// A Oswald em caixa alta ocupa ~0,52em por letra: reduz a fonte para o texto caber na largura.
function fitFont(text: string, max: number, width: number, min = 24) {
  const size = Math.floor(width / (Math.max(text.length, 1) * 0.52));
  return Math.max(min, Math.min(max, size));
}

function Avatar({ src, name, size, ring = GOLD, ringWidth = 3 }: { src?: string; name: string; size: number; ring?: string; ringWidth?: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "9999px",
        border: `${ringWidth}px solid ${ring}`,
        backgroundColor: BLACK,
        overflow: "hidden",
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          style={{ width: `${size}px`, height: `${size}px`, objectFit: "cover", borderRadius: "9999px" }}
        />
      ) : (
        <div style={{ display: "flex", fontSize: `${Math.round(size * 0.42)}px`, fontWeight: 700, color: GOLD, textTransform: "uppercase" }}>
          {name.slice(0, 1)}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
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
  );
}

type RowSize = { height: number; badge: number; rank: number; name: number; value: number; label: number; caption: boolean };

const ROW_LEADER: RowSize = { height: 160, badge: 96, rank: 44, name: 46, value: 60, label: 20, caption: true };
const ROW_REGULAR: RowSize = { height: 128, badge: 72, rank: 30, name: 36, value: 48, label: 20, caption: true };
const ROW_COMPACT: RowSize = { height: 104, badge: 68, rank: 30, name: 36, value: 48, label: 18, caption: false };

function RankRow({ item, position, size, leader = false, width }: { item: ArtItem; position: number; size: RowSize; leader?: boolean; width: number }) {
  // Largura que sobra para o nome depois do selo, da foto, do valor e dos espaçamentos.
  const nameWidth = width - size.badge * 2 - 24 * 3 - 28 * 2 - 150;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "24px",
        borderRadius: "22px",
        padding: "0 28px",
        minHeight: `${size.height}px`,
        border: leader ? `1px solid ${GOLD}` : "1px solid rgba(212,175,55,0.35)",
        background: leader
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
          width: `${size.badge}px`,
          height: `${size.badge}px`,
          borderRadius: "16px",
          backgroundColor: leader ? GOLD : RED,
          color: leader ? BLACK : WHITE,
          fontSize: `${size.rank}px`,
          fontWeight: 700,
        }}
      >
        {`${position}º`}
      </div>

      <Avatar src={item.photoSmall} name={item.name} size={size.badge} ringWidth={2} />

      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            fontSize: `${fitFont(item.name, size.name, nameWidth)}px`,
            fontWeight: 700,
            color: WHITE,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {item.name}
        </div>
        {size.caption && (
          <div style={{ display: "flex", marginTop: "6px", fontSize: "20px", textTransform: "uppercase", letterSpacing: "4px", color: "rgba(212,175,55,0.75)" }}>
            Bravura Futebol Clube
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
        <div style={{ display: "flex", fontSize: `${size.value}px`, fontWeight: 700, lineHeight: 1, color: leader ? GOLD : RED }}>
          {`${item.value}`}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "6px",
            fontSize: `${size.label}px`,
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
}

/** Onde a moldura traz o endereço do site estampado: a caixa cobre o texto antigo com o domínio atual. */
export type FrameSiteBox = {
  left: number;
  top: number;
  width: number;
  height: number;
  background: string;
  color: string;
  fontSize: number;
  pill: boolean;
};

/**
 * Camada transparente com título e lista, aplicada por cima das molduras prontas
 * (public/moldura-ranking*.png). `listTop` acompanha a área livre de cada moldura.
 */
export function FrameOverlay({ title, subtitle, site, items, listTop, siteBox }: ArtProps & { listTop: number; siteBox: FrameSiteBox }): ReactElement {
  const width = 836;

  return (
    <div style={{ position: "relative", display: "flex", width: `${ART_WIDTH}px`, height: `${ART_HEIGHT}px`, fontFamily: "Oswald", color: WHITE }}>
      <div
        style={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          left: `${siteBox.left}px`,
          top: `${siteBox.top}px`,
          width: `${siteBox.width}px`,
          height: `${siteBox.height}px`,
          backgroundColor: siteBox.background,
          borderRadius: siteBox.pill ? "9999px" : "0",
          border: siteBox.pill ? `2px solid ${GOLD}` : "0",
          color: siteBox.color,
          fontSize: `${fitFont(site, siteBox.fontSize, siteBox.width - 60)}px`,
          fontWeight: 600,
          letterSpacing: "2px",
        }}
      >
        {site}
      </div>
      <div style={{ position: "absolute", left: "122px", top: `${listTop}px`, width: `${width}px`, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", color: RED, fontSize: "30px", fontWeight: 700, letterSpacing: "8px", textTransform: "uppercase" }}>{subtitle}</div>
          <div
            style={{
              display: "flex",
              marginTop: "12px",
              color: WHITE,
              fontSize: `${fitFont(title, 66, width)}px`,
              fontWeight: 700,
              lineHeight: 1,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              textShadow: "0 3px 8px rgba(0,0,0,0.95)",
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: "48px", gap: "20px" }}>
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            items.map((item, index) => (
              <RankRow key={item.id} item={item} position={index + 1} size={index === 0 ? ROW_LEADER : ROW_REGULAR} leader={index === 0} width={width} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Star({ size, color = GOLD }: { size: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M12 1.6l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.7l-6.4 3.5 1.4-7.1-5.3-5 7.2-.9z" fill={color} />
    </svg>
  );
}

function Stripe({ top, left, width, height, rotate, background }: { top: number; left: number; width: number; height: number; rotate: number; background: string }) {
  const style: CSSProperties = {
    position: "absolute",
    display: "flex",
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
    transform: `rotate(${rotate}deg)`,
    background,
  };
  return <div style={style} />;
}

// Fundo desenhado em código (sem arquivo de moldura): preto com rasgos vermelhos e filetes dourados.
function Backdrop() {
  const redFade = "linear-gradient(90deg, rgba(200,16,46,0), rgba(200,16,46,0.55) 45%, rgba(138,10,31,0))";
  const goldLine = "linear-gradient(90deg, rgba(212,175,55,0), rgba(212,175,55,0.7) 50%, rgba(212,175,55,0))";

  return (
    <div style={{ position: "absolute", display: "flex", top: 0, left: 0, width: `${ART_WIDTH}px`, height: `${ART_HEIGHT}px`, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          display: "flex",
          top: 0,
          left: 0,
          width: `${ART_WIDTH}px`,
          height: `${ART_HEIGHT}px`,
          background: "linear-gradient(180deg, #230609 0%, #0d0d0d 30%, #0a0a0a 68%, #2a0509 100%)",
        }}
      />
      <Stripe top={250} left={-420} width={1200} height={150} rotate={-34} background={redFade} />
      <Stripe top={470} left={-520} width={1200} height={46} rotate={-34} background={redFade} />
      <Stripe top={1500} left={320} width={1300} height={170} rotate={-34} background={redFade} />
      <Stripe top={1740} left={260} width={1300} height={50} rotate={-34} background={redFade} />
      <Stripe top={170} left={-360} width={1100} height={3} rotate={-34} background={goldLine} />
      <Stripe top={1690} left={380} width={1200} height={3} rotate={-34} background={goldLine} />

      {/* Faixa central atrás do escudo */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          top: 0,
          left: "445px",
          width: "190px",
          height: "290px",
          background: "linear-gradient(180deg, rgba(200,16,46,0.95), rgba(138,10,31,0.55) 70%, rgba(138,10,31,0))",
          borderLeft: "3px solid rgba(212,175,55,0.8)",
          borderRight: "3px solid rgba(212,175,55,0.8)",
        }}
      />
    </div>
  );
}

function Header({ logo, title, subtitle }: Pick<ArtProps, "logo" | "title" | "subtitle">) {
  return (
    <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", top: "40px", left: 0, width: `${ART_WIDTH}px` }}>
      {logo ? <img src={logo} alt="" width={198} height={240} style={{ width: "198px", height: "240px" }} /> : <div style={{ display: "flex", height: "240px" }} />}
      <div style={{ display: "flex", alignItems: "center", gap: "18px", marginTop: "18px" }}>
        <Star size={22} />
        <div style={{ display: "flex", fontSize: "30px", fontWeight: 500, letterSpacing: "16px", color: GOLD, paddingLeft: "16px" }}>RANKING</div>
        <Star size={22} />
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "6px",
          fontSize: `${fitFont(title, 84, 960)}px`,
          fontWeight: 700,
          lineHeight: 1.1,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          color: WHITE,
          textShadow: "0 4px 14px rgba(0,0,0,0.9)",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", marginTop: "2px", fontSize: "30px", fontWeight: 700, letterSpacing: "8px", textTransform: "uppercase", color: RED }}>{subtitle}</div>
    </div>
  );
}

function Footer({ site }: { site: string }) {
  return (
    <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", top: "1672px", left: 0, width: `${ART_WIDTH}px` }}>
      <div style={{ display: "flex", width: "620px", height: "2px", background: "linear-gradient(90deg, rgba(212,175,55,0), rgba(212,175,55,0.8) 50%, rgba(212,175,55,0))" }} />
      <div style={{ display: "flex", marginTop: "22px", fontSize: "26px", fontWeight: 500, letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>
        Veja o ranking completo no site oficial
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "16px",
          padding: "10px 44px",
          borderRadius: "9999px",
          border: `2px solid ${GOLD}`,
          backgroundColor: "rgba(0,0,0,0.55)",
          fontSize: `${fitFont(site, 42, 700)}px`,
          fontWeight: 600,
          letterSpacing: "2px",
          color: GOLD,
        }}
      >
        {site}
      </div>
      <div style={{ display: "flex", marginTop: "20px", fontSize: "22px", fontWeight: 500, letterSpacing: "12px", color: "rgba(212,175,55,0.7)" }}>HONRA • GARRA • UNIÃO</div>
    </div>
  );
}

function Canvas({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", display: "flex", width: `${ART_WIDTH}px`, height: `${ART_HEIGHT}px`, backgroundColor: BLACK, fontFamily: "Oswald", color: WHITE }}>
      <Backdrop />
      {children}
    </div>
  );
}

function EmptyBlock() {
  return (
    <div style={{ position: "absolute", display: "flex", flexDirection: "column", top: "860px", left: "122px", width: "836px" }}>
      <EmptyState />
    </div>
  );
}

const PODIUM = [
  { photo: 236, name: 50, value: 92, step: 250, rank: 110 },
  { photo: 180, name: 40, value: 68, step: 176, rank: 84 },
  { photo: 180, name: 40, value: 68, step: 126, rank: 72 },
];

function PodiumColumn({ item, place }: { item: ArtItem; place: number }) {
  const size = PODIUM[place];
  const medal = MEDALS[place];
  const isLeader = place === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "300px" }}>
      <Avatar src={item.photoLarge || item.photoSmall} name={item.name} size={size.photo} ring={medal} ringWidth={isLeader ? 6 : 4} />
      <div
        style={{
          display: "flex",
          marginTop: "16px",
          fontSize: `${fitFont(item.name, size.name, 290)}px`,
          fontWeight: 700,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          color: WHITE,
          textShadow: "0 3px 10px rgba(0,0,0,0.9)",
        }}
      >
        {item.name}
      </div>
      <div style={{ display: "flex", fontSize: `${size.value}px`, fontWeight: 700, lineHeight: 1.05, color: isLeader ? GOLD : WHITE }}>{`${item.value}`}</div>
      <div style={{ display: "flex", fontSize: "22px", fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.65)" }}>{item.label}</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "18px",
          width: "300px",
          height: `${size.step}px`,
          borderRadius: "20px 20px 0 0",
          borderTop: `5px solid ${medal}`,
          background: isLeader
            ? "linear-gradient(180deg, rgba(212,175,55,0.5), rgba(138,10,31,0.6) 55%, rgba(10,10,10,0.2))"
            : "linear-gradient(180deg, rgba(200,16,46,0.55), rgba(60,6,14,0.5) 60%, rgba(10,10,10,0.2))",
          fontSize: `${size.rank}px`,
          fontWeight: 700,
          color: medal,
          textShadow: "0 4px 12px rgba(0,0,0,0.7)",
        }}
      >
        {`${place + 1}º`}
      </div>
    </div>
  );
}

/** Top 3 em pódio com fotos grandes; 4º e 5º em lista logo abaixo. */
export function PodiumArt(props: ArtProps): ReactElement {
  const { items } = props;
  // 2º à esquerda, líder no centro, 3º à direita.
  const places = items.length >= 3 ? [1, 0, 2] : items.length === 2 ? [1, 0] : [0];
  const rest = items.slice(3);
  const top = rest.length === 0 ? 680 : rest.length === 1 ? 620 : 556;

  return (
    <Canvas>
      <Header {...props} />
      {items.length === 0 ? (
        <EmptyBlock />
      ) : (
        <div style={{ position: "absolute", display: "flex", flexDirection: "column", top: `${top}px`, left: 0, width: `${ART_WIDTH}px`, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: "24px", height: "730px" }}>
            {places.map((place) => (
              <PodiumColumn key={items[place].id} item={items[place]} place={place} />
            ))}
          </div>
          <div style={{ display: "flex", width: "948px", height: "4px", backgroundColor: GOLD }} />
          {rest.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "36px", width: "948px" }}>
              {rest.map((item, index) => (
                <RankRow key={item.id} item={item} position={index + 4} size={ROW_COMPACT} width={948} />
              ))}
            </div>
          )}
        </div>
      )}
      <Footer site={props.site} />
    </Canvas>
  );
}

/** Líder em um cartão grande com foto e número gigante; do 2º ao 5º em lista compacta. */
export function SpotlightArt(props: ArtProps): ReactElement {
  const [leader, ...rest] = props.items;
  const top = rest.length <= 1 ? 690 : rest.length === 2 ? 630 : rest.length === 3 ? 590 : 548;

  return (
    <Canvas>
      <Header {...props} />
      {!leader ? (
        <EmptyBlock />
      ) : (
        <div style={{ position: "absolute", display: "flex", flexDirection: "column", top: `${top}px`, left: "80px", width: "920px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              height: "560px",
              padding: "0 44px",
              gap: "40px",
              borderRadius: "36px",
              border: `2px solid ${GOLD}`,
              background: "linear-gradient(135deg, rgba(212,175,55,0.38), rgba(138,10,31,0.62) 48%, rgba(0,0,0,0.85))",
              boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
            }}
          >
            <Avatar src={leader.photoLarge || leader.photoSmall} name={leader.name} size={340} ringWidth={6} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", flexGrow: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "6px 22px",
                  borderRadius: "12px",
                  backgroundColor: GOLD,
                  color: BLACK,
                  fontSize: "30px",
                  fontWeight: 700,
                  letterSpacing: "6px",
                }}
              >
                <Star size={24} color={BLACK} />
                1º LUGAR
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: "18px",
                  fontSize: `${fitFont(leader.name, 84, 440)}px`,
                  fontWeight: 700,
                  lineHeight: 1.05,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  color: WHITE,
                  textShadow: "0 4px 12px rgba(0,0,0,0.8)",
                }}
              >
                {leader.name}
              </div>
              <div style={{ display: "flex", fontSize: "230px", fontWeight: 700, lineHeight: 1, color: GOLD, textShadow: "0 8px 24px rgba(0,0,0,0.6)" }}>{`${leader.value}`}</div>
              <div style={{ display: "flex", fontSize: "34px", fontWeight: 700, letterSpacing: "8px", textTransform: "uppercase", color: "rgba(255,255,255,0.8)" }}>{leader.label}</div>
            </div>
          </div>

          {rest.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "30px" }}>
              {rest.map((item, index) => (
                <RankRow key={item.id} item={item} position={index + 2} size={ROW_COMPACT} width={920} />
              ))}
            </div>
          )}
        </div>
      )}
      <Footer site={props.site} />
    </Canvas>
  );
}
