import { getChampionshipPlayerStats, isPlayedChampionshipMatch, type ChampionshipPlayerStats } from "@/lib/championship-stats";
import type { Championship, ChampionshipPlayer } from "@/types";

// Rankings individuais de um campeonato: só contam partidas e ajustes do próprio campeonato.

export type RankingIcon = "goals" | "assists" | "games" | "stars" | "participations" | "yellowCards" | "redCards";
export type RankingAccent = "red" | "gold" | "yellow";

export interface ChampionshipRankingConfig {
  slug: string;
  title: string;
  /** Título que vai na arte compartilhada. */
  shareTitle: string;
  /** Rótulo curto ao lado do número no painel e na arte. */
  unit: string;
  /** Rótulo por extenso na página do ranking completo. */
  valueLabel: string;
  description: string;
  icon: RankingIcon;
  accent: RankingAccent;
  getValue: (stats: ChampionshipPlayerStats, highlights: number) => number;
}

export const CHAMPIONSHIP_RANKINGS: ChampionshipRankingConfig[] = [
  {
    slug: "artilheiros",
    title: "Artilheiros",
    shareTitle: "Top Artilheiros",
    unit: "gols",
    valueLabel: "gols",
    description: "Jogadores do Bravura que mais marcaram gols no campeonato.",
    icon: "goals",
    accent: "red",
    getValue: (stats) => stats.goals,
  },
  {
    slug: "participacoes",
    title: "Part. em gols",
    shareTitle: "Top Participações em Gol",
    unit: "part.",
    valueLabel: "participações",
    description: "Participações em gol (gols + assistências) de cada jogador no campeonato.",
    icon: "participations",
    accent: "red",
    getValue: (stats) => stats.goals + stats.assists,
  },
  {
    slug: "assistencias",
    title: "Assistências",
    shareTitle: "Top Assistências",
    unit: "assist.",
    valueLabel: "assistências",
    description: "Jogadores do Bravura que mais deram assistências no campeonato.",
    icon: "assists",
    accent: "gold",
    getValue: (stats) => stats.assists,
  },
  {
    slug: "craques",
    title: "Craques da partida",
    shareTitle: "Craques da Partida",
    unit: "vezes",
    valueLabel: "vezes craque",
    description: "Jogadores mais vezes eleitos craque da partida no campeonato.",
    icon: "stars",
    accent: "gold",
    getValue: (_stats, highlights) => highlights,
  },
  {
    slug: "amarelos",
    title: "Cartões amarelos",
    shareTitle: "Cartões Amarelos",
    unit: "amarelos",
    valueLabel: "cartões amarelos",
    description: "Cartões amarelos recebidos por jogador no campeonato.",
    icon: "yellowCards",
    accent: "yellow",
    getValue: (stats) => stats.yellowCards,
  },
  {
    slug: "vermelhos",
    title: "Cartões vermelhos",
    shareTitle: "Cartões Vermelhos",
    unit: "vermelhos",
    valueLabel: "cartões vermelhos",
    description: "Cartões vermelhos recebidos por jogador no campeonato.",
    icon: "redCards",
    accent: "red",
    getValue: (stats) => stats.redCards,
  },
];

export function getChampionshipRankingConfig(slug: string) {
  return CHAMPIONSHIP_RANKINGS.find((ranking) => ranking.slug === slug);
}

/** Quantas vezes cada inscrito foi eleito craque da partida (só partidas encerradas). */
export function getChampionshipHighlightCounts(championship: Championship) {
  const counts = new Map<string, number>();
  for (const match of championship.matches) {
    if (!isPlayedChampionshipMatch(match) || !match.highlightPlayerId) continue;
    counts.set(match.highlightPlayerId, (counts.get(match.highlightPlayerId) || 0) + 1);
  }
  return counts;
}

export interface ChampionshipRankingRow {
  player: ChampionshipPlayer;
  value: number;
}

/** Todos os rankings de uma vez, calculando as estatísticas do campeonato uma única vez. */
export function getChampionshipRankings(championship: Championship) {
  const stats = getChampionshipPlayerStats(championship);
  const highlights = getChampionshipHighlightCounts(championship);

  return new Map<string, ChampionshipRankingRow[]>(
    CHAMPIONSHIP_RANKINGS.map((config) => [
      config.slug,
      championship.players
        .map((player) => {
          const playerStats = stats.get(player.id);
          return { player, value: playerStats ? config.getValue(playerStats, highlights.get(player.id) || 0) : 0 };
        })
        .filter((row) => row.value > 0)
        .sort((a, b) => b.value - a.value || (a.player.number || 999) - (b.player.number || 999)),
    ])
  );
}

/** Subtítulo das artes: nome do campeonato e temporada, sem emojis (a fonte da arte não tem). */
export function championshipShareSubtitle(championship: Championship) {
  const name = championship.name.replace(/[^\p{L}\p{N}\s\-–—.ºª]/gu, "").replace(/\s+/g, " ").trim();
  const season = String(championship.season || "").trim();
  const full = season && !name.includes(season) ? `${name} ${season}` : name;
  return full.length <= 40 ? full : full.slice(0, 40).trim();
}
