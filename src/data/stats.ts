import type { TeamStatsSummary } from "@/types";
import { matches } from "./matches";
import { players } from "./players";

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

export const teamStats: TeamStatsSummary = {
  games: finished.length,
  wins,
  draws,
  losses,
  goalsFor,
  goalsAgainst,
  winRate: finished.length > 0 ? Math.round(((wins * 3 + draws) / (finished.length * 3)) * 100) : 0,
  cleanSheets,
  goalsByMonth: [
    { month: "Jan", goals: 3 },
    { month: "Fev", goals: 4 },
    { month: "Mar", goals: 9 },
    { month: "Abr", goals: 4 },
    { month: "Mai", goals: 4 },
    { month: "Jun", goals: 2 },
  ],
  winRateByCompetition: [
    { competition: "Copa Amadora", rate: 75 },
    { competition: "Liga Regional", rate: 60 },
  ],
};

export const topScorers = [...players]
  .sort((a, b) => b.stats.goals - a.stats.goals)
  .slice(0, 5);

export const topAssists = [...players]
  .sort((a, b) => b.stats.assists - a.stats.assists)
  .slice(0, 5);

export const topGames = [...players]
  .sort((a, b) => b.stats.games - a.stats.games)
  .slice(0, 5);

export const topGoalParticipations = [...players]
  .sort(
    (a, b) =>
      b.stats.goals + b.stats.assists - (a.stats.goals + a.stats.assists)
  )
  .slice(0, 5);
