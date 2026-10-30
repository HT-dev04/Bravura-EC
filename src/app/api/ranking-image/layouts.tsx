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
  /**
   * Foto já recortada (data URL) no formato que o layout pediu em PHOTO_SPECS da rota:
   * círculo na maioria, retrato retangular na Capa, Figurinha e Manchete. `photoLarge` é a de destaque.
   */
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

// Mesmo cálculo para textos com letter-spacing (o espaçamento soma em cada letra).
function fitSpaced(text: string, max: number, width: number, spacing: number, min = 18) {
  const length = Math.max(text.length, 1);
  const size = Math.floor((width - length * spacing) / (length * 0.52));
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
          <div style={{ display: "flex", color: RED, fontSize: `${fitSpaced(subtitle, 30, width, 8)}px`, fontWeight: 700, letterSpacing: "8px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{subtitle}</div>
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
      <div style={{ display: "flex", marginTop: "2px", fontSize: `${fitSpaced(subtitle, 30, 960, 8)}px`, fontWeight: 700, letterSpacing: "8px", textTransform: "uppercase", whiteSpace: "nowrap", color: RED }}>{subtitle}</div>
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

// ---------------------------------------------------------------------------------------------
// Estilos extras: cada um com identidade própria, para a arte sorteada não parecer sempre a mesma.
// ---------------------------------------------------------------------------------------------

/** Foto retangular (já recortada com cantos pela rota) ou, sem foto, a inicial num bloco escuro. */
function Portrait({ src, name, width, height, radius = 0, border }: { src?: string; name: string; width: number; height: number; radius?: number; border?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: `${radius}px`,
        border: border || "0",
        background: "linear-gradient(180deg, #2a0509, #0a0a0a)",
        overflow: "hidden",
      }}
    >
      {src ? (
        <img src={src} alt="" width={width} height={height} style={{ width: `${width}px`, height: `${height}px`, objectFit: "cover" }} />
      ) : (
        <div style={{ display: "flex", fontSize: `${Math.round(Math.min(width, height) * 0.42)}px`, fontWeight: 700, color: GOLD, textTransform: "uppercase" }}>
          {name.slice(0, 1)}
        </div>
      )}
    </div>
  );
}

function PositionBadge({ position, size, background = RED, color = WHITE }: { position: number; size: number; background?: string; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.22)}px`,
        backgroundColor: background,
        color,
        fontSize: `${Math.round(size * 0.44)}px`,
        fontWeight: 700,
      }}
    >
      {`${position}º`}
    </div>
  );
}

/** Lista compacta do 2º ao 5º, comum à Capa. */
function RestList({ items, top, left, width, start = 2 }: { items: ArtItem[]; top: number; left: number; width: number; start?: number }) {
  if (items.length === 0) return null;
  return (
    <div style={{ position: "absolute", display: "flex", flexDirection: "column", gap: "16px", top: `${top}px`, left: `${left}px`, width: `${width}px` }}>
      {items.map((item, index) => (
        <RankRow key={item.id} item={item} position={index + start} size={ROW_COMPACT} width={width} />
      ))}
    </div>
  );
}

/** Capa: foto do líder em destaque como arte de apresentação, faixa diagonal com nome e número. */
export function CoverArt(props: ArtProps): ReactElement {
  const { title, subtitle, logo, items, site } = props;
  const [leader, ...rest] = items;

  return (
    <Canvas>
      {leader && (
        <div style={{ position: "absolute", display: "flex", top: 0, right: 0, width: "760px", height: "1000px" }}>
          <Portrait src={leader.photoLarge} name={leader.name} width={760} height={1000} />
          <div
            style={{
              position: "absolute",
              display: "flex",
              top: 0,
              left: 0,
              width: "760px",
              height: "1000px",
              background: "linear-gradient(90deg, #0a0a0a 0%, rgba(10,10,10,0.55) 30%, rgba(10,10,10,0) 60%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              display: "flex",
              bottom: 0,
              left: 0,
              width: "760px",
              height: "420px",
              background: "linear-gradient(180deg, rgba(10,10,10,0), #0a0a0a)",
            }}
          />
        </div>
      )}

      <div style={{ position: "absolute", display: "flex", flexDirection: "column", top: "70px", left: "64px", width: "560px" }}>
        {logo ? <img src={logo} alt="" width={132} height={160} style={{ width: "132px", height: "160px" }} /> : <div style={{ display: "flex", height: "160px" }} />}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "34px" }}>
          <Star size={22} />
          <div style={{ display: "flex", fontSize: "30px", fontWeight: 500, letterSpacing: "14px", color: GOLD }}>RANKING</div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: "10px",
            width: "560px",
            fontSize: `${fitFont(title, 104, 1000, 52)}px`,
            fontWeight: 700,
            lineHeight: 0.98,
            textTransform: "uppercase",
            color: WHITE,
            textShadow: "0 6px 18px rgba(0,0,0,0.9)",
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", width: "120px", height: "8px", marginTop: "26px", backgroundColor: RED }} />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: "20px",
            width: "520px",
            fontSize: `${fitSpaced(subtitle, 30, 1000, 5)}px`,
            fontWeight: 600,
            letterSpacing: "5px",
            lineHeight: 1.3,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          {subtitle}
        </div>
      </div>

      {!leader ? (
        <EmptyBlock />
      ) : (
        <div style={{ position: "absolute", display: "flex", top: "860px", left: "-40px", width: "1160px", height: "230px", transform: "rotate(-4deg)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "1160px",
              height: "230px",
              padding: "0 100px 0 104px",
              gap: "34px",
              background: `linear-gradient(90deg, ${RED}, #8a0a1f)`,
              borderTop: `6px solid ${GOLD}`,
              borderBottom: `6px solid ${GOLD}`,
              boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
            }}
          >
            <PositionBadge position={1} size={120} background={GOLD} color={BLACK} />
            <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 }}>
              <div style={{ display: "flex", fontSize: "24px", fontWeight: 600, letterSpacing: "8px", color: "rgba(255,255,255,0.8)" }}>
                {leader.number ? `CAMISA ${leader.number} · LÍDER` : "LÍDER DO RANKING"}
              </div>
              <div style={{ display: "flex", marginTop: "14px", fontSize: `${fitFont(leader.name, 84, 520)}px`, fontWeight: 700, lineHeight: 1.05, whiteSpace: "nowrap", textTransform: "uppercase", color: WHITE }}>
                {leader.name}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{ display: "flex", fontSize: "150px", fontWeight: 700, lineHeight: 1, color: GOLD, textShadow: "0 6px 16px rgba(0,0,0,0.6)" }}>{`${leader.value}`}</div>
              <div style={{ display: "flex", fontSize: "24px", fontWeight: 700, letterSpacing: "6px", textTransform: "uppercase", color: WHITE }}>{leader.label}</div>
            </div>
          </div>
        </div>
      )}

      <RestList items={rest} top={1150} left={80} width={920} />
      <Footer site={site} />
    </Canvas>
  );
}

function CompactHeader({ logo, title, subtitle, kicker = "RANKING" }: Pick<ArtProps, "logo" | "title" | "subtitle"> & { kicker?: string }) {
  return (
    <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", top: "44px", left: 0, width: `${ART_WIDTH}px` }}>
      {logo ? <img src={logo} alt="" width={140} height={170} style={{ width: "140px", height: "170px" }} /> : <div style={{ display: "flex", height: "170px" }} />}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "14px" }}>
        <Star size={20} />
        <div style={{ display: "flex", fontSize: "26px", fontWeight: 500, letterSpacing: "14px", color: GOLD, paddingLeft: "14px" }}>{kicker}</div>
        <Star size={20} />
      </div>
      <div
        style={{
          display: "flex",
          fontSize: `${fitFont(title, 78, 960)}px`,
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
      <div style={{ display: "flex", fontSize: `${fitSpaced(subtitle, 28, 960, 8)}px`, fontWeight: 700, letterSpacing: "8px", textTransform: "uppercase", whiteSpace: "nowrap", color: RED }}>{subtitle}</div>
    </div>
  );
}

function CardValue({ value, label, size, color }: { value: number; label: string; size: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
      <div style={{ display: "flex", fontSize: `${size}px`, fontWeight: 700, lineHeight: 0.9, color }}>{`${value}`}</div>
      <div style={{ display: "flex", marginBottom: `${Math.round(size * 0.08)}px`, fontSize: `${Math.max(16, Math.round(size * 0.24))}px`, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
        {label}
      </div>
    </div>
  );
}

/** Figurinha: o líder vira uma carta de colecionador e o 2º ao 5º, cartas menores lado a lado. */
export function CardsArt(props: ArtProps): ReactElement {
  const [leader, ...rest] = props.items;
  const smallWidth = 222;

  return (
    <Canvas>
      <CompactHeader {...props} />
      {!leader ? (
        <EmptyBlock />
      ) : (
        <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", top: "440px", left: 0, width: `${ART_WIDTH}px` }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "620px",
              padding: "24px",
              borderRadius: "34px",
              border: `6px solid ${GOLD}`,
              background: "linear-gradient(160deg, #f3d77a 0%, #d4af37 18%, #8a0a1f 55%, #1a0306 100%)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
            }}
          >
            <div style={{ position: "relative", display: "flex" }}>
              <Portrait src={leader.photoLarge} name={leader.name} width={560} height={540} radius={22} />
              <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", top: "18px", left: "18px", padding: "10px 18px", borderRadius: "18px", backgroundColor: "rgba(10,10,10,0.82)", border: `2px solid ${GOLD}` }}>
                <div style={{ display: "flex", fontSize: "92px", fontWeight: 700, lineHeight: 1, color: GOLD }}>{`${leader.value}`}</div>
                <div style={{ display: "flex", fontSize: "20px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: WHITE }}>{leader.label}</div>
              </div>
              {leader.number ? (
                <div style={{ position: "absolute", display: "flex", top: "18px", right: "22px", fontSize: "70px", fontWeight: 700, color: WHITE, textShadow: "0 4px 14px rgba(0,0,0,0.9)" }}>{`${leader.number}`}</div>
              ) : null}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "18px", gap: "16px" }}>
              <div style={{ display: "flex", fontSize: `${fitFont(leader.name, 76, 420)}px`, fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap", textTransform: "uppercase", color: WHITE }}>{leader.name}</div>
              <PositionBadge position={1} size={84} background={GOLD} color={BLACK} />
            </div>
          </div>

          {rest.length > 0 && (
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: "18px", marginTop: "40px", width: "960px" }}>
              {rest.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: `${smallWidth}px`,
                    padding: "14px",
                    borderRadius: "22px",
                    border: `3px solid ${index === 0 ? MEDALS[1] : index === 1 ? MEDALS[2] : "rgba(212,175,55,0.45)"}`,
                    background: "linear-gradient(170deg, rgba(200,16,46,0.55), rgba(20,4,7,0.95) 60%)",
                    boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
                  }}
                >
                  <div style={{ position: "relative", display: "flex" }}>
                    <Portrait src={item.photoSmall} name={item.name} width={smallWidth - 34} height={230} radius={14} />
                    <div style={{ position: "absolute", display: "flex", top: "8px", left: "8px" }}>
                      <PositionBadge position={index + 2} size={52} />
                    </div>
                  </div>
                  <div style={{ display: "flex", marginTop: "12px", fontSize: `${fitFont(item.name, 34, smallWidth - 34, 18)}px`, fontWeight: 700, whiteSpace: "nowrap", textTransform: "uppercase", color: WHITE }}>
                    {item.name}
                  </div>
                  <CardValue value={item.value} label={item.label} size={52} color={GOLD} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <Footer site={props.site} />
    </Canvas>
  );
}

const LED_RED = "#ff3b3b";
const LED_AMBER = "#ffb400";

function LedDigits({ value, color, width, height, fontSize }: { value: string; color: string; width: number; height: number; fontSize: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: "12px",
        backgroundColor: "#140202",
        border: "2px solid #2e0808",
        color,
        fontSize: `${fontSize}px`,
        fontWeight: 700,
        letterSpacing: "4px",
        textShadow: `0 0 14px ${color}, 0 0 30px ${color}`,
      }}
    >
      {value}
    </div>
  );
}

/** Placar: o ranking num painel de estádio, com números em LED. */
export function ScoreboardArt(props: ArtProps): ReactElement {
  const { items } = props;
  const rowHeight = items.length <= 3 ? 190 : 164;

  return (
    <Canvas>
      <Header {...props} />
      {items.length === 0 ? (
        <EmptyBlock />
      ) : (
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            top: "560px",
            left: "60px",
            width: "960px",
            padding: "26px 34px 30px",
            borderRadius: "30px",
            backgroundColor: "#070707",
            border: "10px solid #1d1d1d",
            boxShadow: `0 0 0 3px ${GOLD}, 0 40px 90px rgba(0,0,0,0.75)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "16px", borderBottom: "2px dashed rgba(255,59,59,0.35)" }}>
            <div style={{ display: "flex", fontSize: "26px", fontWeight: 600, letterSpacing: "8px", color: LED_AMBER, textShadow: `0 0 12px ${LED_AMBER}` }}>POS · JOGADOR</div>
            <div style={{ display: "flex", fontSize: "26px", fontWeight: 600, letterSpacing: "8px", textTransform: "uppercase", color: LED_AMBER, textShadow: `0 0 12px ${LED_AMBER}` }}>
              {items[0].label}
            </div>
          </div>
          {items.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "22px",
                height: `${rowHeight}px`,
                borderBottom: index < items.length - 1 ? "2px dashed rgba(255,59,59,0.25)" : "0",
              }}
            >
              <LedDigits value={`${index + 1}`} color={index === 0 ? LED_AMBER : LED_RED} width={96} height={96} fontSize={64} />
              <Avatar src={item.photoSmall} name={item.name} size={104} ring={index === 0 ? LED_AMBER : "#3a0a0a"} ringWidth={4} />
              <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 }}>
                <div style={{ display: "flex", fontSize: `${fitFont(item.name, 54, 420)}px`, fontWeight: 700, whiteSpace: "nowrap", textTransform: "uppercase", color: WHITE }}>{item.name}</div>
                {item.number ? (
                  <div style={{ display: "flex", fontSize: "22px", letterSpacing: "5px", color: "rgba(255,255,255,0.5)" }}>{`CAMISA ${item.number}`}</div>
                ) : null}
              </div>
              <LedDigits value={`${item.value}`.padStart(2, "0")} color={index === 0 ? LED_AMBER : LED_RED} width={170} height={110} fontSize={84} />
            </div>
          ))}
        </div>
      )}
      <Footer site={props.site} />
    </Canvas>
  );
}

const NEON_RED = "#ff2a4a";
const NEON_GOLD = "#ffd76a";

function neonText(color: string) {
  return `0 0 8px ${color}, 0 0 22px ${color}, 0 0 48px ${color}`;
}

/** Neon: fundo preto com letreiros e molduras brilhando em vermelho e dourado. */
export function NeonArt(props: ArtProps): ReactElement {
  const { items, title, subtitle, logo, site } = props;

  return (
    <div style={{ position: "relative", display: "flex", width: `${ART_WIDTH}px`, height: `${ART_HEIGHT}px`, backgroundColor: "#030303", fontFamily: "Oswald", color: WHITE }}>
      <div
        style={{
          position: "absolute",
          display: "flex",
          top: 0,
          left: 0,
          width: `${ART_WIDTH}px`,
          height: `${ART_HEIGHT}px`,
          background: "radial-gradient(circle at 50% 18%, rgba(255,42,74,0.32), rgba(3,3,3,0) 45%), radial-gradient(circle at 50% 100%, rgba(255,42,74,0.22), rgba(3,3,3,0) 40%)",
        }}
      />
      <div style={{ position: "absolute", display: "flex", top: "34px", left: "34px", width: "1012px", height: "1852px", borderRadius: "40px", border: `3px solid ${NEON_RED}`, boxShadow: `0 0 26px ${NEON_RED}, inset 0 0 26px rgba(255,42,74,0.5)` }} />

      <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", top: "90px", left: 0, width: `${ART_WIDTH}px` }}>
        {logo ? <img src={logo} alt="" width={150} height={182} style={{ width: "150px", height: "182px" }} /> : <div style={{ display: "flex", height: "182px" }} />}
        <div style={{ display: "flex", marginTop: "26px", fontSize: "30px", fontWeight: 500, letterSpacing: "18px", paddingLeft: "18px", color: NEON_GOLD, textShadow: neonText("rgba(255,215,106,0.8)") }}>RANKING</div>
        <div style={{ display: "flex", marginTop: "4px", fontSize: `${fitFont(title, 92, 900)}px`, fontWeight: 700, lineHeight: 1.1, whiteSpace: "nowrap", textTransform: "uppercase", color: "#ffe9ec", textShadow: neonText(NEON_RED) }}>
          {title}
        </div>
        <div style={{ display: "flex", marginTop: "6px", fontSize: `${fitSpaced(subtitle, 28, 900, 8)}px`, fontWeight: 600, letterSpacing: "8px", whiteSpace: "nowrap", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>{subtitle}</div>
      </div>

      {items.length === 0 ? (
        <EmptyBlock />
      ) : (
        // Com menos de 5 jogadores a lista desce para ficar centrada no espaço livre.
        <div style={{ position: "absolute", display: "flex", flexDirection: "column", gap: "26px", top: `${600 + (5 - items.length) * 93}px`, left: "100px", width: "880px" }}>
          {items.map((item, index) => {
            const glow = index === 0 ? NEON_GOLD : NEON_RED;
            const leader = index === 0;
            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "26px",
                  height: leader ? "240px" : "160px",
                  padding: "0 34px",
                  borderRadius: "26px",
                  border: `3px solid ${glow}`,
                  backgroundColor: "rgba(10,2,4,0.85)",
                  boxShadow: `0 0 22px ${glow}, inset 0 0 18px ${leader ? "rgba(255,215,106,0.35)" : "rgba(255,42,74,0.3)"}`,
                }}
              >
                <div style={{ display: "flex", width: "86px", justifyContent: "center", fontSize: leader ? "76px" : "56px", fontWeight: 700, color: glow, textShadow: neonText(glow) }}>{`${index + 1}`}</div>
                <Avatar src={leader ? item.photoLarge : item.photoSmall} name={item.name} size={leader ? 176 : 112} ring={glow} ringWidth={4} />
                <div style={{ display: "flex", flexGrow: 1, minWidth: 0, fontSize: `${fitFont(item.name, leader ? 64 : 46, leader ? 340 : 400)}px`, fontWeight: 700, whiteSpace: "nowrap", textTransform: "uppercase", color: WHITE }}>
                  {item.name}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                  <div style={{ display: "flex", fontSize: leader ? "110px" : "68px", fontWeight: 700, lineHeight: 1, color: glow, textShadow: neonText(glow) }}>{`${item.value}`}</div>
                  <div style={{ display: "flex", fontSize: "20px", fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>{item.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", top: "1700px", left: 0, width: `${ART_WIDTH}px` }}>
        <div style={{ display: "flex", fontSize: "24px", fontWeight: 500, letterSpacing: "5px", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>Ranking completo no site oficial</div>
        <div style={{ display: "flex", marginTop: "12px", fontSize: `${fitFont(site, 44, 760)}px`, fontWeight: 600, letterSpacing: "2px", color: NEON_GOLD, textShadow: neonText("rgba(255,215,106,0.7)") }}>{site}</div>
      </div>
    </div>
  );
}

const PAPER = "#f1ebde";
const INK = "#111111";

/** Manchete: capa de jornal esportivo, com o líder na foto principal e o resto na tabela. */
export function HeadlineArt(props: ArtProps): ReactElement {
  const { items, title, subtitle, logo, site } = props;
  const [leader, ...rest] = items;
  const headline = leader ? `${leader.name} lidera` : title;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", width: `${ART_WIDTH}px`, height: `${ART_HEIGHT}px`, backgroundColor: PAPER, fontFamily: "Oswald", color: INK, padding: "64px 70px 0" }}>
      <div style={{ display: "flex", width: "940px", height: "8px", backgroundColor: INK }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "26px", marginTop: "18px" }}>
        {logo ? <img src={logo} alt="" width={92} height={112} style={{ width: "92px", height: "112px" }} /> : null}
        <div style={{ display: "flex", fontSize: "100px", fontWeight: 700, letterSpacing: "4px", lineHeight: 1 }}>DIÁRIO DO LEÃO</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "18px", padding: "10px 0", borderTop: `3px solid ${INK}`, borderBottom: `3px solid ${INK}`, fontSize: "22px", fontWeight: 600, letterSpacing: "4px", textTransform: "uppercase" }}>
        <div style={{ display: "flex" }}>Edição especial</div>
        <div style={{ display: "flex", color: RED, fontSize: `${fitSpaced(subtitle, 22, 520, 4, 14)}px`, whiteSpace: "nowrap" }}>{subtitle}</div>
        <div style={{ display: "flex" }}>Ranking</div>
      </div>

      <div style={{ display: "flex", marginTop: "34px", fontSize: `${fitFont(headline, 150, 940, 60)}px`, fontWeight: 700, lineHeight: 1, letterSpacing: "-1px", whiteSpace: "nowrap", textTransform: "uppercase" }}>{headline}</div>
      <div style={{ display: "flex", marginTop: "10px", fontSize: `${fitFont(title, 56, 940)}px`, fontWeight: 600, whiteSpace: "nowrap", textTransform: "uppercase", color: RED }}>{title}</div>

      {!leader ? (
        <div style={{ display: "flex", marginTop: "120px", fontSize: "48px", fontWeight: 700, textTransform: "uppercase", color: "rgba(17,17,17,0.6)" }}>Sem dados para este filtro</div>
      ) : (
        <div style={{ display: "flex", gap: "40px", marginTop: "34px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Portrait src={leader.photoLarge} name={leader.name} width={460} height={580} border={`5px solid ${INK}`} />
            <div style={{ display: "flex", marginTop: "10px", fontSize: "20px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(17,17,17,0.65)" }}>
              {leader.number ? `${leader.name}, camisa ${leader.number}, no topo` : `${leader.name} no topo do ranking`}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flexGrow: 1 }}>
            <div style={{ display: "flex", fontSize: "34px", fontWeight: 700, letterSpacing: "6px", color: RED }}>1º LUGAR</div>
            <div style={{ display: "flex", fontSize: "260px", fontWeight: 700, lineHeight: 0.95, color: RED }}>{`${leader.value}`}</div>
            <div style={{ display: "flex", fontSize: "54px", fontWeight: 700, textTransform: "uppercase", lineHeight: 1 }}>{leader.label}</div>
            <div style={{ display: "flex", width: "120px", height: "8px", marginTop: "26px", backgroundColor: INK }} />
            <div style={{ display: "flex", marginTop: "18px", fontSize: "28px", lineHeight: 1.3, color: "rgba(17,17,17,0.8)" }}>Bravura Futebol Clube</div>
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", marginTop: "36px", borderTop: `4px solid ${INK}` }}>
          {rest.map((item, index) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "22px", height: "112px", borderBottom: "2px solid rgba(17,17,17,0.25)" }}>
              <div style={{ display: "flex", width: "70px", fontSize: "44px", fontWeight: 700, color: RED }}>{`${index + 2}º`}</div>
              <div style={{ display: "flex", flexGrow: 1, fontSize: `${fitFont(item.name, 46, 600)}px`, fontWeight: 700, whiteSpace: "nowrap", textTransform: "uppercase" }}>{item.name}</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
                <div style={{ display: "flex", fontSize: "52px", fontWeight: 700, lineHeight: 1 }}>{`${item.value}`}</div>
                <div style={{ display: "flex", fontSize: "20px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(17,17,17,0.6)", marginBottom: "6px" }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "space-between", left: 0, bottom: 0, width: `${ART_WIDTH}px`, height: "150px", padding: "0 70px", backgroundColor: INK }}>
        <div style={{ display: "flex", fontSize: "24px", fontWeight: 500, letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.8)" }}>Ranking completo em</div>
        <div style={{ display: "flex", fontSize: `${fitFont(site, 44, 520)}px`, fontWeight: 600, letterSpacing: "2px", color: GOLD }}>{site}</div>
      </div>
    </div>
  );
}
