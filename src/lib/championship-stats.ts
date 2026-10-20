import { normalizePlayerName } from "@/lib/cms-stats";
import type {
  Championship,
  ChampionshipGroup,
  ChampionshipMatch,
  ChampionshipPlayer,
  ChampionshipStandingStats,
  ChampionshipStatKey,
  ChampionshipTeam,
  MatchEvent,
  MatchResult,
} from "@/types";

// Tudo aqui lê só o próprio campeonato: nada soma nas estatísticas dos amistosos.

export const CHAMPIONSHIP_STAT_KEYS: ChampionshipStatKey[] = ["games", "goals", "assists", "yellowCards", "redCards"];

export const CHAMPIONSHIP_STAT_LABELS: Record<ChampionshipStatKey, string> = {
  games: "Jogos",
  goals: "Gols",
  assists: "Assistências",
  yellowCards: "Amarelos",
  redCards: "Vermelhos",
};

export const CHAMPIONSHIP_STATUS_LABELS = {
  planejado: "Em breve",
  em_andamento: "Em andamento",
  encerrado: "Encerrado",
} as const;

export type ChampionshipPlayerStats = Record<ChampionshipStatKey, number>;

const EVENT_STAT_BY_TYPE: Partial<Record<MatchEvent["type"], ChampionshipStatKey>> = {
  gol: "goals",
  assistencia: "assists",
  cartao_amarelo: "yellowCards",
  cartao_vermelho: "redCards",
};

function emptyStats(): ChampionshipPlayerStats {
  return { games: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
}

export function isPlayedChampionshipMatch(match: ChampionshipMatch) {
  return match.status === "encerrada" && match.scoreHome !== null && match.scoreAway !== null;
}

export function championshipMatchResult(match: ChampionshipMatch): MatchResult | null {
  if (match.scoreHome === null || match.scoreAway === null) return null;
  if (match.scoreHome > match.scoreAway) return "V";
  if (match.scoreHome < match.scoreAway) return "D";
  return "E";
}

/** Eventos digitados à mão podem vir sem playerId: nesses casos o jogador é achado pelo nome/apelido. */
function createPlayerResolver(players: ChampionshipPlayer[]) {
  const ids = new Set(players.map((player) => player.id));
  const nameToId = new Map<string, string>();
  for (const player of players) {
    nameToId.set(normalizePlayerName(player.name), player.id);
    if (player.nickname) nameToId.set(normalizePlayerName(player.nickname), player.id);
  }
  return (event: Pick<MatchEvent, "playerId" | "playerName">) => {
    if (event.playerId && ids.has(event.playerId)) return event.playerId;
    return nameToId.get(normalizePlayerName(event.playerName)) || "";
  };
}

function adjustValue(player: ChampionshipPlayer, key: ChampionshipStatKey) {
  const value = Number(player.adjust?.[key]);
  return Number.isFinite(value) ? Math.trunc(value) : 0;
}

/** Guarda só os ajustes diferentes de zero, já como inteiros. */
export function sanitizeChampionshipAdjust(player: ChampionshipPlayer): ChampionshipPlayer["adjust"] {
  const adjust: NonNullable<ChampionshipPlayer["adjust"]> = {};
  for (const key of CHAMPIONSHIP_STAT_KEYS) {
    const value = adjustValue(player, key);
    if (value !== 0) adjust[key] = value;
  }
  return Object.keys(adjust).length > 0 ? adjust : undefined;
}

/** Totais de cada inscrito: partidas encerradas do campeonato + ajuste manual. */
export function getChampionshipPlayerStats(championship: Championship) {
  const stats = new Map<string, ChampionshipPlayerStats>(championship.players.map((player) => [player.id, emptyStats()]));
  const resolvePlayerId = createPlayerResolver(championship.players);

  for (const match of championship.matches.filter(isPlayedChampionshipMatch)) {
    // Quem marcou, deu assistência ou levou cartão também entrou em campo, mesmo fora da lista.
    const playedIds = new Set(match.lineup);
    for (const event of match.events) {
      if (event.team !== "bravura") continue;
      const playerId = resolvePlayerId(event);
      const row = stats.get(playerId);
      if (!row) continue;
      playedIds.add(playerId);
      const key = EVENT_STAT_BY_TYPE[event.type];
      if (key) row[key] += 1;
    }
    for (const playerId of playedIds) {
      const row = stats.get(playerId);
      if (row) row.games += 1;
    }
  }

  for (const player of championship.players) {
    const row = stats.get(player.id)!;
    for (const key of CHAMPIONSHIP_STAT_KEYS) row[key] = Math.max(0, row[key] + adjustValue(player, key));
  }

  return stats;
}

export interface ChampionshipSummary {
  games: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  points: number;
  /** Aproveitamento de pontos, de 0 a 100. */
  winRate: number;
}

export function getChampionshipSummary(championship: Championship): ChampionshipSummary {
  const played = championship.matches.filter(isPlayedChampionshipMatch);
  const results = played.map(championshipMatchResult);
  const wins = results.filter((result) => result === "V").length;
  const draws = results.filter((result) => result === "E").length;
  const losses = results.filter((result) => result === "D").length;
  const points = wins * 3 + draws;

  return {
    games: played.length,
    wins,
    draws,
    losses,
    goalsFor: played.reduce((sum, match) => sum + (match.scoreHome || 0), 0),
    goalsAgainst: played.reduce((sum, match) => sum + (match.scoreAway || 0), 0),
    cleanSheets: played.filter((match) => match.scoreAway === 0).length,
    points,
    winRate: played.length > 0 ? Math.round((points / (played.length * 3)) * 100) : 0,
  };
}

export function getChampionshipRanking(championship: Championship, key: ChampionshipStatKey, limit = 5) {
  const stats = getChampionshipPlayerStats(championship);
  return championship.players
    .map((player) => ({ player, value: stats.get(player.id)?.[key] || 0 }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value || a.player.number - b.player.number)
    .slice(0, limit);
}

export interface ChampionshipTimelineEntry {
  match: ChampionshipMatch;
  result: MatchResult | null;
  played: boolean;
  /** Minuto de cada lance (0 quando o minuto não foi informado). */
  goals: number[];
  assists: number[];
  yellowCards: number[];
  redCards: number[];
  isHighlight: boolean;
}

/** Partidas encerradas do campeonato em que o jogador entrou em campo — da mais recente à mais antiga. */
export function getChampionshipPlayerTimeline(championship: Championship, playerId: string): ChampionshipTimelineEntry[] {
  const resolvePlayerId = createPlayerResolver(championship.players);
  const entries: ChampionshipTimelineEntry[] = [];

  for (const match of championship.matches.filter(isPlayedChampionshipMatch)) {
    const entry: ChampionshipTimelineEntry = {
      match,
      result: championshipMatchResult(match),
      played: match.lineup.includes(playerId),
      goals: [],
      assists: [],
      yellowCards: [],
      redCards: [],
      isHighlight: match.highlightPlayerId === playerId,
    };

    for (const event of match.events) {
      if (event.team !== "bravura" || resolvePlayerId(event) !== playerId) continue;
      const key = EVENT_STAT_BY_TYPE[event.type];
      if (key && key !== "games") {
        entry[key].push(event.minute || 0);
        entry.played = true;
      }
    }

    if (!entry.played && !entry.isHighlight) continue;
    for (const key of ["goals", "assists", "yellowCards", "redCards"] as const) entry[key].sort((a, b) => a - b);
    entries.push(entry);
  }

  return entries.sort((a, b) => +new Date(b.match.date) - +new Date(a.match.date));
}

export const STANDING_STAT_KEYS: (keyof ChampionshipStandingStats)[] = ["wins", "draws", "losses", "goalsFor", "goalsAgainst"];

export interface ChampionshipStandingRow extends ChampionshipStandingStats {
  team: ChampionshipTeam;
  played: number;
  points: number;
  goalDiff: number;
}

export function getBravuraTeam(championship: Championship) {
  return championship.teams.find((team) => team.isBravura);
}

function emptyStanding(): ChampionshipStandingStats {
  return { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
}

function standingValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : 0;
}

/**
 * Classificação do grupo: jogos do Bravura (partidas encerradas marcadas para o grupo) entram
 * sozinhos para os dois lados; jogos entre outros times vêm do lançamento manual.
 */
export function getGroupStandings(championship: Championship, group: ChampionshipGroup): ChampionshipStandingRow[] {
  const teamsById = new Map(championship.teams.map((team) => [team.id, team]));
  const totals = new Map<string, ChampionshipStandingStats>();

  for (const teamId of group.teamIds) {
    if (!teamsById.has(teamId)) continue;
    const manual = group.manual[teamId] || {};
    const row = emptyStanding();
    for (const key of STANDING_STAT_KEYS) row[key] = standingValue(manual[key]);
    totals.set(teamId, row);
  }

  const bravura = getBravuraTeam(championship);
  if (bravura && totals.has(bravura.id)) {
    for (const match of championship.matches) {
      if (match.groupId !== group.id || !isPlayedChampionshipMatch(match)) continue;
      const opponent = match.opponentTeamId ? totals.get(match.opponentTeamId) : undefined;
      const own = totals.get(bravura.id)!;
      const result = championshipMatchResult(match);
      const goalsFor = match.scoreHome || 0;
      const goalsAgainst = match.scoreAway || 0;

      own.goalsFor += goalsFor;
      own.goalsAgainst += goalsAgainst;
      if (result === "V") own.wins += 1;
      if (result === "E") own.draws += 1;
      if (result === "D") own.losses += 1;

      if (opponent) {
        opponent.goalsFor += goalsAgainst;
        opponent.goalsAgainst += goalsFor;
        if (result === "D") opponent.wins += 1;
        if (result === "E") opponent.draws += 1;
        if (result === "V") opponent.losses += 1;
      }
    }
  }

  const order = new Map(group.teamIds.map((teamId, index) => [teamId, index]));
  return Array.from(totals.entries())
    .map(([teamId, stats]) => ({
      team: teamsById.get(teamId)!,
      ...stats,
      played: stats.wins + stats.draws + stats.losses,
      points: stats.wins * 3 + stats.draws,
      goalDiff: stats.goalsFor - stats.goalsAgainst,
    }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.wins - a.wins ||
        b.goalDiff - a.goalDiff ||
        b.goalsFor - a.goalsFor ||
        (order.get(a.team.id) ?? 0) - (order.get(b.team.id) ?? 0)
    );
}

export function getTeamGroup(championship: Championship, teamId: string) {
  return championship.groups.find((group) => group.teamIds.includes(teamId));
}

/** Menor número de camisa livre no campeonato (começando em 1). */
export function nextFreeChampionshipNumber(players: ChampionshipPlayer[], preferred?: number) {
  const used = new Set(players.map((player) => player.number).filter((number) => number > 0));
  if (preferred && preferred > 0 && !used.has(preferred)) return preferred;
  let number = 1;
  while (used.has(number)) number += 1;
  return number;
}

/** Dá número aos inscritos sem número ou com número repetido, mantendo quem já tem número único. */
export function assignChampionshipNumbers(players: ChampionshipPlayer[]) {
  const kept: ChampionshipPlayer[] = [];
  const pending: ChampionshipPlayer[] = [];
  const seen = new Set<number>();

  for (const player of players) {
    if (player.number > 0 && !seen.has(player.number)) {
      seen.add(player.number);
      kept.push(player);
    } else {
      pending.push(player);
    }
  }

  const assigned = new Map<string, number>();
  const taken = [...kept];
  for (const player of pending) {
    const number = nextFreeChampionshipNumber(taken);
    assigned.set(player.id, number);
    taken.push({ ...player, number });
  }

  return players.map((player) => (assigned.has(player.id) ? { ...player, number: assigned.get(player.id)! } : player));
}

export function duplicatedChampionshipNumbers(players: ChampionshipPlayer[]) {
  const counts = new Map<number, number>();
  for (const player of players) if (player.number > 0) counts.set(player.number, (counts.get(player.number) || 0) + 1);
  return new Set(Array.from(counts.entries()).filter(([, count]) => count > 1).map(([number]) => number));
}
