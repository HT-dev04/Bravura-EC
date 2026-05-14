import type { Match, Player, PlayerStats, TeamStatsSummary } from "@/types";

const emptyPlayerStats: PlayerStats = {
  games: 0,
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  minutes: 0,
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

function normalizePlayerName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function monthLabel(date: string) {
  const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(date)).replace(".", "");
  return label ? label[0].toUpperCase() + label.slice(1) : "";
}

export function getPlayersWithMatchStats(players: Player[], matches: Match[]): Player[] {
  const statsByPlayer = new Map<string, PlayerStats>();
  const monthlyGoalsByPlayer = new Map<string, Map<string, number>>();
  const nameToId = new Map<string, string>();

  for (const player of players) {
    statsByPlayer.set(player.id, { ...emptyPlayerStats, games: player.stats.games || 0, minutes: player.stats.minutes || 0 });
    monthlyGoalsByPlayer.set(player.id, new Map());
    nameToId.set(normalizePlayerName(player.name), player.id);
    if (player.nickname) nameToId.set(normalizePlayerName(player.nickname), player.id);
  }

  function eventPlayerId(playerId: string, playerName: string) {
    if (playerId && statsByPlayer.has(playerId)) return playerId;
    return nameToId.get(normalizePlayerName(playerName)) || "";
  }

  for (const match of matches.filter(isStatEligibleMatch)) {
    for (const event of match.events) {
      if (event.team !== "bravura") continue;
      const playerId = eventPlayerId(event.playerId, event.playerName);
      const stats = statsByPlayer.get(playerId);
      if (!stats) continue;

      if (event.type === "gol") {
        stats.goals += 1;
        const month = monthLabel(match.date);
        const monthlyGoals = monthlyGoalsByPlayer.get(playerId);
        if (monthlyGoals && month) monthlyGoals.set(month, (monthlyGoals.get(month) || 0) + 1);
      }
      if (event.type === "assistencia") stats.assists += 1;
      if (event.type === "cartao_amarelo") stats.yellowCards += 1;
      if (event.type === "cartao_vermelho") stats.redCards += 1;
    }
  }

  return players.map((player) => {
    const monthlyGoals = monthlyGoalsByPlayer.get(player.id);
    return {
      ...player,
      stats: statsByPlayer.get(player.id) || { ...emptyPlayerStats },
      monthlyGoals: monthlyGoals
        ? Array.from(monthlyGoals.entries()).map(([month, goals]) => ({ month, goals }))
        : [],
    };
  });
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
