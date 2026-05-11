import type { Match, Player, TeamStatsSummary } from "@/types";

export function getTeamStats(matches: Match[]): TeamStatsSummary {
  const finished = matches.filter((m) => m.status === "encerrada");
  const wins = finished.filter((m) => m.result === "V").length;
  const draws = finished.filter((m) => m.result === "E").length;
  const losses = finished.filter((m) => m.result === "D").length;
  const goalsFor = finished.reduce((sum, m) => {
    if (m.scoreHome === null || m.scoreAway === null) return sum;
    return sum + (m.homeAway === "casa" ? m.scoreHome : m.scoreAway);
  }, 0);
  const goalsAgainst = finished.reduce((sum, m) => {
    if (m.scoreHome === null || m.scoreAway === null) return sum;
    return sum + (m.homeAway === "casa" ? m.scoreAway : m.scoreHome);
  }, 0);
  const cleanSheets = finished.filter((m) => {
    if (m.scoreHome === null || m.scoreAway === null) return false;
    return (m.homeAway === "casa" ? m.scoreAway : m.scoreHome) === 0;
  }).length;

  const goalsByMonth = finished.reduce<Array<{ month: string; goals: number }>>((acc, m) => {
    if (m.scoreHome === null || m.scoreAway === null) return acc;
    const month = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(m.date)).replace(".", "");
    const row = acc.find((x) => x.month === month);
    const goals = m.homeAway === "casa" ? m.scoreHome : m.scoreAway;
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
    games: finished.length,
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
