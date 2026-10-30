// Contrato entre o modal de compartilhamento e a rota /api/ranking-image.

export const RANKING_ART_STYLES = [
  { id: "podio", label: "Pódio" },
  { id: "destaque", label: "Destaque" },
  { id: "classica", label: "Clássica" },
  { id: "ouro", label: "Ouro" },
  { id: "capa", label: "Capa" },
  { id: "figurinha", label: "Figurinha" },
  { id: "placar", label: "Placar" },
  { id: "neon", label: "Neon" },
  { id: "manchete", label: "Manchete" },
] as const;

export type RankingArtStyle = (typeof RANKING_ART_STYLES)[number]["id"];

/** Estilo sorteado ao abrir o compartilhamento — nunca repete o atual quando há outro para escolher. */
export function randomRankingArtStyle(except?: RankingArtStyle | null): RankingArtStyle {
  const options = RANKING_ART_STYLES.filter((style) => style.id !== except);
  return options[Math.floor(Math.random() * options.length)].id;
}

export type RankingShareItem = {
  id: string;
  name: string;
  photo?: string;
  value: number;
  label: string;
  /** Número da camisa, mostrado nas artes que têm espaço para ele. */
  number?: number;
};

export type RankingSharePayload = {
  title: string;
  subtitle: string;
  style: RankingArtStyle;
  /** Domínio exibido no rodapé das artes desenhadas em código. */
  site?: string;
  items: RankingShareItem[];
};

export function isRankingArtStyle(value: unknown): value is RankingArtStyle {
  return RANKING_ART_STYLES.some((style) => style.id === value);
}

// base64url com suporte a UTF-8 (acentos nos nomes), usado no parâmetro ?d= da rota.
export function encodeRankingPayload(payload: RankingSharePayload) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
