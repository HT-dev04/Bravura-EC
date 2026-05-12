"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { saveAdminCollection } from "@/lib/admin-client";
import type { Player, TeamStatsSummary } from "@/types";

type Tab = "geral" | "jogadores";

const emptyTeamStats: TeamStatsSummary = {
  games: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  winRate: 0,
  cleanSheets: 0,
  goalsByMonth: [],
  winRateByCompetition: [],
};

function calculateWinRate(games: number, wins: number, draws: number) {
  if (games <= 0) return 0;
  return Math.round(((wins * 3 + draws) / (games * 3)) * 100);
}

export default function AdminEstatisticasPage() {
  const [tab, setTab] = useState<Tab>("geral");
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStatsSummary>(emptyTeamStats);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [savingTeam, setSavingTeam] = useState(false);
  const [savingPlayers, setSavingPlayers] = useState(false);

  useEffect(() => {
    fetch("/api/admin/cms", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.players) {
          setPlayers(data.players);
          setSelectedPlayerId(data.players[0]?.id || "");
        }
        if (data?.teamStats) setTeamStats(data.teamStats);
      });
  }, []);

  const selectedPlayer = players.find((player) => player.id === selectedPlayerId) || players[0];
  const balance = teamStats.goalsFor - teamStats.goalsAgainst;
  const calculatedWinRate = calculateWinRate(teamStats.games, teamStats.wins, teamStats.draws);

  async function saveTeamStats() {
    setSavingTeam(true);
    const nextStats = { ...teamStats, winRate: calculatedWinRate };
    setTeamStats(nextStats);
    await saveAdminCollection("teamStats", nextStats);
    setSavingTeam(false);
  }

  async function savePlayers(nextPlayers = players) {
    setSavingPlayers(true);
    setPlayers(nextPlayers);
    await saveAdminCollection("players", nextPlayers);
    setSavingPlayers(false);
  }

  function updatePlayer(playerId: string, next: Player) {
    setPlayers(players.map((player) => (player.id === playerId ? next : player)));
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">Admin</p>
          <h1 className="font-display text-2xl md:text-4xl uppercase">Estatísticas</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("geral")}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold border ${tab === "geral" ? "border-brand-red text-white" : "border-brand-border text-brand-gray"}`}
          >
            Geral
          </button>
          <button
            type="button"
            onClick={() => setTab("jogadores")}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold border ${tab === "jogadores" ? "border-brand-red text-white" : "border-brand-border text-brand-gray"}`}
          >
            Jogadores
          </button>
        </div>
      </div>

      {tab === "geral" && (
        <section className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard label="Jogos" value={teamStats.games} />
            <SummaryCard label="Aproveitamento" value={`${calculatedWinRate}%`} />
            <SummaryCard label="Saldo" value={balance} />
            <SummaryCard label="Gols marcados" value={teamStats.goalsFor} />
          </div>

          <div className="bg-brand-black-2 border border-brand-border rounded-sm p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display uppercase text-lg text-brand-gold">Números gerais</h2>
              <Button variant="primary" onClick={saveTeamStats} disabled={savingTeam}>{savingTeam ? "Salvando..." : "Salvar geral"}</Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <NumberField label="Jogos" value={teamStats.games} onChange={(games) => setTeamStats({ ...teamStats, games })} />
              <NumberField label="Vitórias" value={teamStats.wins} onChange={(wins) => setTeamStats({ ...teamStats, wins })} />
              <NumberField label="Empates" value={teamStats.draws} onChange={(draws) => setTeamStats({ ...teamStats, draws })} />
              <NumberField label="Derrotas" value={teamStats.losses} onChange={(losses) => setTeamStats({ ...teamStats, losses })} />
              <NumberField label="Gols pró" value={teamStats.goalsFor} onChange={(goalsFor) => setTeamStats({ ...teamStats, goalsFor })} />
              <NumberField label="Gols contra" value={teamStats.goalsAgainst} onChange={(goalsAgainst) => setTeamStats({ ...teamStats, goalsAgainst })} />
              <NumberField label="Clean sheets" value={teamStats.cleanSheets} onChange={(cleanSheets) => setTeamStats({ ...teamStats, cleanSheets })} />
              <div>
                <Label>Aproveitamento automático</Label>
                <div className="mt-1 bg-brand-black border border-brand-border rounded-sm px-3 py-2 text-sm text-white">
                  {calculatedWinRate}%
                </div>
              </div>
            </div>
          </div>

          <EditableGoalsByMonth teamStats={teamStats} setTeamStats={setTeamStats} />
          <EditableCompetitionRates teamStats={teamStats} setTeamStats={setTeamStats} />
        </section>
      )}

      {tab === "jogadores" && (
        <section className="space-y-5">
          <div className="bg-brand-black-2 border border-brand-border rounded-sm p-4 flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
            <div>
              <h2 className="font-display uppercase text-lg text-brand-gold">Estatísticas dos jogadores</h2>
              <p className="text-sm text-brand-gray">Altere jogos, gols, assistências, cartões, minutos e gols por mês.</p>
            </div>
            <Button variant="primary" onClick={() => savePlayers()} disabled={savingPlayers}>{savingPlayers ? "Salvando..." : "Salvar jogadores"}</Button>
          </div>

          <div className="border border-brand-border rounded-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[980px]">
              <thead className="bg-white/5 text-brand-gray uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Jogador</th>
                  <th className="text-left px-4 py-3">Jogos</th>
                  <th className="text-left px-4 py-3">Gols</th>
                  <th className="text-left px-4 py-3">Assistências</th>
                  <th className="text-left px-4 py-3">Amarelos</th>
                  <th className="text-left px-4 py-3">Vermelhos</th>
                  <th className="text-left px-4 py-3">Minutos</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id} className="border-t border-brand-border">
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">{player.nickname || player.name}</td>
                    <td className="px-4 py-3"><InlineNumber value={player.stats.games} onChange={(games) => updatePlayer(player.id, { ...player, stats: { ...player.stats, games } })} /></td>
                    <td className="px-4 py-3"><InlineNumber value={player.stats.goals} onChange={(goals) => updatePlayer(player.id, { ...player, stats: { ...player.stats, goals } })} /></td>
                    <td className="px-4 py-3"><InlineNumber value={player.stats.assists} onChange={(assists) => updatePlayer(player.id, { ...player, stats: { ...player.stats, assists } })} /></td>
                    <td className="px-4 py-3"><InlineNumber value={player.stats.yellowCards} onChange={(yellowCards) => updatePlayer(player.id, { ...player, stats: { ...player.stats, yellowCards } })} /></td>
                    <td className="px-4 py-3"><InlineNumber value={player.stats.redCards} onChange={(redCards) => updatePlayer(player.id, { ...player, stats: { ...player.stats, redCards } })} /></td>
                    <td className="px-4 py-3"><InlineNumber value={player.stats.minutes} onChange={(minutes) => updatePlayer(player.id, { ...player, stats: { ...player.stats, minutes } })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedPlayer && (
            <PlayerMonthlyGoals
              players={players}
              selectedPlayer={selectedPlayer}
              selectedPlayerId={selectedPlayerId}
              setSelectedPlayerId={setSelectedPlayerId}
              updatePlayer={updatePlayer}
            />
          )}
        </section>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return <div className="bg-brand-black-2 border border-brand-border rounded-sm p-4"><p className="text-[10px] uppercase tracking-wider text-brand-gray">{label}</p><p className="font-display text-2xl text-white mt-2">{value}</p></div>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <div><Label>{label}</Label><Input className="mt-1" type="number" min="0" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} /></div>;
}

function InlineNumber({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <Input className="w-24" type="number" min="0" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />;
}

function EditableGoalsByMonth({ teamStats, setTeamStats }: { teamStats: TeamStatsSummary; setTeamStats: (value: TeamStatsSummary) => void }) {
  return <div className="bg-brand-black-2 border border-brand-border rounded-sm p-4 space-y-4"><div className="flex items-center justify-between gap-3"><h2 className="font-display uppercase text-lg text-brand-gold">Gols por mês</h2><Button variant="outline" onClick={() => setTeamStats({ ...teamStats, goalsByMonth: [...teamStats.goalsByMonth, { month: "", goals: 0 }] })}><Plus className="w-4 h-4" /> Adicionar</Button></div><div className="space-y-3">{teamStats.goalsByMonth.map((row, index) => <div key={index} className="grid grid-cols-[1fr_120px_auto] gap-3 items-end"><div><Label>Mês</Label><Input className="mt-1" value={row.month} onChange={(e) => setTeamStats({ ...teamStats, goalsByMonth: teamStats.goalsByMonth.map((item, i) => i === index ? { ...item, month: e.target.value } : item) })} /></div><div><Label>Gols</Label><Input className="mt-1" type="number" min="0" value={row.goals} onChange={(e) => setTeamStats({ ...teamStats, goalsByMonth: teamStats.goalsByMonth.map((item, i) => i === index ? { ...item, goals: Number(e.target.value) || 0 } : item) })} /></div><button type="button" className="pb-2 text-xs uppercase text-brand-red hover:underline" onClick={() => setTeamStats({ ...teamStats, goalsByMonth: teamStats.goalsByMonth.filter((_, i) => i !== index) })}>Excluir</button></div>)}{teamStats.goalsByMonth.length === 0 && <p className="text-sm text-brand-gray">Nenhum mês cadastrado.</p>}</div></div>;
}

function EditableCompetitionRates({ teamStats, setTeamStats }: { teamStats: TeamStatsSummary; setTeamStats: (value: TeamStatsSummary) => void }) {
  return <div className="bg-brand-black-2 border border-brand-border rounded-sm p-4 space-y-4"><div className="flex items-center justify-between gap-3"><h2 className="font-display uppercase text-lg text-brand-gold">Aproveitamento por competição</h2><Button variant="outline" onClick={() => setTeamStats({ ...teamStats, winRateByCompetition: [...teamStats.winRateByCompetition, { competition: "", rate: 0 }] })}><Plus className="w-4 h-4" /> Adicionar</Button></div><div className="space-y-3">{teamStats.winRateByCompetition.map((row, index) => <div key={index} className="grid grid-cols-[1fr_120px_auto] gap-3 items-end"><div><Label>Competição</Label><Input className="mt-1" value={row.competition} onChange={(e) => setTeamStats({ ...teamStats, winRateByCompetition: teamStats.winRateByCompetition.map((item, i) => i === index ? { ...item, competition: e.target.value } : item) })} /></div><div><Label>%</Label><Input className="mt-1" type="number" min="0" max="100" value={row.rate} onChange={(e) => setTeamStats({ ...teamStats, winRateByCompetition: teamStats.winRateByCompetition.map((item, i) => i === index ? { ...item, rate: Number(e.target.value) || 0 } : item) })} /></div><button type="button" className="pb-2 text-xs uppercase text-brand-red hover:underline" onClick={() => setTeamStats({ ...teamStats, winRateByCompetition: teamStats.winRateByCompetition.filter((_, i) => i !== index) })}>Excluir</button></div>)}{teamStats.winRateByCompetition.length === 0 && <p className="text-sm text-brand-gray">Nenhuma competição cadastrada.</p>}</div></div>;
}

function PlayerMonthlyGoals({ players, selectedPlayer, selectedPlayerId, setSelectedPlayerId, updatePlayer }: { players: Player[]; selectedPlayer: Player; selectedPlayerId: string; setSelectedPlayerId: (value: string) => void; updatePlayer: (playerId: string, next: Player) => void }) {
  return <div className="bg-brand-black-2 border border-brand-border rounded-sm p-4 space-y-4"><div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"><div><h2 className="font-display uppercase text-lg text-brand-gold">Gols por mês do jogador</h2><p className="text-sm text-brand-gray">Esses dados alimentam os gráficos individuais do elenco.</p></div><div className="w-full md:w-72"><Label>Jogador</Label><Select className="mt-1" value={selectedPlayerId} onChange={(e) => setSelectedPlayerId(e.target.value)}>{players.map((player) => <option key={player.id} value={player.id}>{player.nickname || player.name}</option>)}</Select></div></div><div className="space-y-3">{selectedPlayer.monthlyGoals.map((row, index) => <div key={index} className="grid grid-cols-[1fr_120px_auto] gap-3 items-end"><div><Label>Mês</Label><Input className="mt-1" value={row.month} onChange={(e) => updatePlayer(selectedPlayer.id, { ...selectedPlayer, monthlyGoals: selectedPlayer.monthlyGoals.map((item, i) => i === index ? { ...item, month: e.target.value } : item) })} /></div><div><Label>Gols</Label><Input className="mt-1" type="number" min="0" value={row.goals} onChange={(e) => updatePlayer(selectedPlayer.id, { ...selectedPlayer, monthlyGoals: selectedPlayer.monthlyGoals.map((item, i) => i === index ? { ...item, goals: Number(e.target.value) || 0 } : item) })} /></div><button type="button" className="pb-2 text-xs uppercase text-brand-red hover:underline" onClick={() => updatePlayer(selectedPlayer.id, { ...selectedPlayer, monthlyGoals: selectedPlayer.monthlyGoals.filter((_, i) => i !== index) })}>Excluir</button></div>)}{selectedPlayer.monthlyGoals.length === 0 && <p className="text-sm text-brand-gray">Nenhum mês cadastrado para este jogador.</p>}<Button variant="outline" onClick={() => updatePlayer(selectedPlayer.id, { ...selectedPlayer, monthlyGoals: [...selectedPlayer.monthlyGoals, { month: "", goals: 0 }] })}><Plus className="w-4 h-4" /> Adicionar mês</Button></div><p className="text-xs text-brand-gray">Total de gols do jogador: {selectedPlayer.stats.goals}</p></div>;
}
