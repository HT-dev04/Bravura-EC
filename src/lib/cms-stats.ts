import type { Match, MatchEvent, Player, PlayerEventStatKey, PlayerStats, TeamStatsSummary } from "@/types";

const emptyPlayerStats: PlayerStats = {
  games: 0,
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  minutes: 0,
};

export const PLAYER_EVENT_STAT_KEYS: PlayerEventStatKey[] = ["goals", "assists", "yellowCards", "redCards"];

export type PlayerEventStats = Record<PlayerEventStatKey, number>;

const EVENT_STAT_BY_TYPE: Partial<Record<MatchEvent["type"], PlayerEventStatKey>> = {
  gol: "goals",
  assistencia: "assists",
  cartao_amarelo: "yellowCards",
  cartao_vermelho: "redCards",
};

function isPastMatch(match: Match) {
  return new Date(match.date).getTime() <= Date.now();
}

function matchResult(match: Match) {
  if (match.scoreHome === null || match.scoreAway === null) return null;
  if (match.scoreHome > match.scoreAway) return "V";
  if (match.scoreHome < match.scoreAway) return "D";
  return "E";
}

function isStatEligibleMatch(match: Match) {
  return isPastMatch(match) && match.scoreHome !== null && match.scoreAway !== null && (match.status === "encerrada" || match.result !== null);
}

export function normalizePlayerName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function monthLabel(date: string) {
  const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(date)).replace(".", "");
  return label ? label[0].toUpperCase() + label.slice(1) : "";
}

// Eventos antigos ou digitados à mão podem vir sem playerId: nesses casos o jogador é achado pelo nome/apelido.
function createEventPlayerResolver(players: Player[]) {
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

function emptyEventStats(): PlayerEventStats {
  return { goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
}

/** Gols, assistências e cartões de cada jogador contados só pelos eventos das partidas. */
export function getPlayerEventStats(players: Player[], matches: Match[]) {
  const statsByPlayer = new Map<string, PlayerEventStats>(players.map((player) => [player.id, emptyEventStats()]));
  const resolvePlayerId = createEventPlayerResolver(players);

  for (const match of matches.filter(isStatEligibleMatch)) {
    for (const event of match.events) {
      if (event.team !== "bravura") continue;
      const key = EVENT_STAT_BY_TYPE[event.type];
      const stats = statsByPlayer.get(resolvePlayerId(event));
      if (key && stats) stats[key] += 1;
    }
  }

  return statsByPlayer;
}

function adjustValue(stats: PlayerStats | undefined, key: PlayerEventStatKey) {
  const value = Number(stats?.adjust?.[key]);
  return Number.isFinite(value) ? Math.trunc(value) : 0;
}

/** Guarda só os ajustes diferentes de zero, já como inteiros. */
export function sanitizeStatAdjust(stats: PlayerStats | undefined): PlayerStats["adjust"] {
  const adjust: NonNullable<PlayerStats["adjust"]> = {};
  for (const key of PLAYER_EVENT_STAT_KEYS) {
    const value = adjustValue(stats, key);
    if (value !== 0) adjust[key] = value;
  }
  return Object.keys(adjust).length > 0 ? adjust : undefined;
}

/**
 * Define o total que o admin quer ver para o jogador. A diferença para o que as partidas
 * já contam vira o ajuste manual, então novos eventos continuam somando por cima.
 */
export function setPlayerStatTotal(stats: PlayerStats, key: PlayerEventStatKey, total: number, fromMatches: number): PlayerStats {
  const safeTotal = Math.max(0, Math.trunc(Number.isFinite(total) ? total : 0));
  const next: PlayerStats = { ...stats, [key]: safeTotal, adjust: { ...stats.adjust, [key]: safeTotal - fromMatches } };
  next.adjust = sanitizeStatAdjust(next);
  return next;
}

export function getPlayersWithMatchStats(players: Player[], matches: Match[]): Player[] {
  const eventStats = getPlayerEventStats(players, matches);
  const monthlyGoalsByPlayer = new Map<string, Map<string, number>>(players.map((player) => [player.id, new Map()]));
  const resolvePlayerId = createEventPlayerResolver(players);

  // Em ordem cronológica para o gráfico de gols por mês sair de janeiro a dezembro.
  const chronological = matches.filter(isStatEligibleMatch).sort((a, b) => +new Date(a.date) - +new Date(b.date));
  for (const match of chronological) {
    const month = monthLabel(match.date);
    if (!month) continue;
    for (const event of match.events) {
      if (event.team !== "bravura" || event.type !== "gol") continue;
      const monthlyGoals = monthlyGoalsByPlayer.get(resolvePlayerId(event));
      if (monthlyGoals) monthlyGoals.set(month, (monthlyGoals.get(month) || 0) + 1);
    }
  }

  return players.map((player) => {
    const fromMatches = eventStats.get(player.id) || emptyEventStats();
    const stats: PlayerStats = { ...emptyPlayerStats, games: player.stats.games || 0, minutes: player.stats.minutes || 0 };
    for (const key of PLAYER_EVENT_STAT_KEYS) {
      stats[key] = Math.max(0, fromMatches[key] + adjustValue(player.stats, key));
    }
    const adjust = sanitizeStatAdjust(player.stats);
    if (adjust) stats.adjust = adjust;

    const monthlyGoals = monthlyGoalsByPlayer.get(player.id);
    return {
      ...player,
      stats,
      monthlyGoals: monthlyGoals
        ? Array.from(monthlyGoals.entries()).map(([month, goals]) => ({ month, goals }))
        : [],
    };
  });
}

export interface PlayerTimelineEntry {
  match: Match;
  result: "V" | "E" | "D" | null;
  /** Minuto de cada lance (0 quando o minuto não foi informado). */
  goals: number[];
  assists: number[];
  yellowCards: number[];
  redCards: number[];
  isHighlight: boolean;
}

/** Jogos em que o jogador marcou, deu assistência, levou cartão ou foi o craque — do mais recente ao mais antigo. */
export function getPlayerTimeline(player: Player, players: Player[], matches: Match[]): PlayerTimelineEntry[] {
  const resolvePlayerId = createEventPlayerResolver(players);
  const entries: PlayerTimelineEntry[] = [];

  for (const match of matches.filter(isStatEligibleMatch)) {
    const entry: PlayerTimelineEntry = {
      match,
      result: match.result ?? matchResult(match),
      goals: [],
      assists: [],
      yellowCards: [],
      redCards: [],
      isHighlight: match.highlightPlayerId === player.id,
    };

    for (const event of match.events) {
      if (event.team !== "bravura" || resolvePlayerId(event) !== player.id) continue;
      const key = EVENT_STAT_BY_TYPE[event.type];
      if (key) entry[key].push(event.minute || 0);
    }

    const hasEvents = PLAYER_EVENT_STAT_KEYS.some((key) => entry[key].length > 0);
    if (!hasEvents && !entry.isHighlight) continue;
    for (const key of PLAYER_EVENT_STAT_KEYS) entry[key].sort((a, b) => a - b);
    entries.push(entry);
  }

  return entries.sort((a, b) => +new Date(b.match.date) - +new Date(a.match.date));
}
export function getTeamStats(matches: Match[], month?: string): TeamStatsSummary {
  const finished = matches.filter((m) => isStatEligibleMatch(m) && (!month || m.date.startsWith(month)));
  const wins = finished.filter((m) => (m.result ?? matchResult(m)) === "V").length;
  const draws = finished.filter((m) => (m.result ?? matchResult(m)) === "E").length;
  const losses = finished.filter((m) => (m.result ?? matchResult(m)) === "D").length;
  const goalsFor = finished.reduce((sum, m) => {
    if (m.scoreHome === null || m.scoreAway === null) return sum;
    return sum + m.scoreHome;
  }, 0);
  const goalsAgainst = finished.reduce((sum, m) => {
    if (m.scoreHome === null || m.scoreAway === null) return sum;
    return sum + m.scoreAway;
  }, 0);
  const cleanSheets = finished.filter((m) => {
    if (m.scoreHome === null || m.scoreAway === null) return false;
    return m.scoreAway === 0;
  }).length;

  const goalsByMonth = finished.reduce<Array<{ month: string; goals: number }>>((acc, m) => {
    if (m.scoreHome === null || m.scoreAway === null) return acc;
    const month = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(m.date)).replace(".", "");
    const row = acc.find((x) => x.month === month);
    const goals = m.scoreHome;
    if (row) row.goals += goals;
    else acc.push({ month, goals });
    return acc;
  }, []);

  const competitions = Array.from(new Set(finished.map((m) => m.competition)));
  const winRateByCompetition = competitions.map((competition) => {
    const games = finished.filter((m) => m.competition === competition);
    const compWins = games.filter((m) => m.result === "V").length;
    return { competition, rate: games.length ? Math.round((compWins / games.length) * 100) : 0 };
  });

  return {
    games: wins + draws + losses,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    winRate: finished.length > 0 ? Math.round(((wins * 3 + draws) / (finished.length * 3)) * 100) : 0,
    cleanSheets,
    goalsByMonth,
    winRateByCompetition,
  };
}

export function getPlayerRankings(players: Player[]) {
  return {
    topScorers: [...players].sort((a, b) => b.stats.goals - a.stats.goals).slice(0, 5),
    topAssists: [...players].sort((a, b) => b.stats.assists - a.stats.assists).slice(0, 5),
    topGames: [...players].sort((a, b) => b.stats.games - a.stats.games).slice(0, 5),
    topGoalParticipations: [...players]
      .sort((a, b) => b.stats.goals + b.stats.assists - (a.stats.goals + a.stats.assists))
      .slice(0, 5),
  };
}
