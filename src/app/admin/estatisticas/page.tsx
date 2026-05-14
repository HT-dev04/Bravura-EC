"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { saveAdminCollection } from "@/lib/admin-client";
import { getTeamStats } from "@/lib/cms-stats";
import type { Match, Player, TeamStatsSummary } from "@/types";

type Tab = "geral" | "jogadores";
type StatsMode = "automatico" | "manual";

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

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function calculateWinRate(games: number, wins: number, draws: number) {
  if (games <= 0) return 0;
  return Math.round(((wins * 3 + draws) / (games * 3)) * 100);
}

function formatMonth(value: string) {
  const [year, month] = value.split("-");
  const monthIndex = Number(month) - 1;
  return `${monthNames[monthIndex] || month}/${year}`;
}

function getMatchMonths(matches: Match[]) {
  return Array.from(new Set(matches.map((match) => match.date.slice(0, 7)).filter(Boolean))).sort((a, b) => b.localeCompare(a));
}

export default function AdminEstatisticasPage() {
  const [tab, setTab] = useState<Tab>("geral");
  const [statsMode, setStatsMode] = useState<StatsMode>("automatico");
  const [monthFilter, setMonthFilter] = useState("todos");
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStatsSummary>(emptyTeamStats);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [savingTeam, setSavingTeam] = useState(false);
  const [savingPlayers, setSavingPlayers] = useState(false);

  useEffect(() => {
    fetch("/api/admin/cms", { cache: "no-store", credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const cms = data?.data || data;
        if (cms?.players) {
          setPlayers(cms.players);
          setSelectedPlayerId(cms.players[0]?.id || "");
        }
        if (cms?.matches) setMatches(cms.matches);
        if (cms?.teamStats) setTeamStats(cms.teamStats);
      });
  }, []);

  const selectedPlayer = players.find((player) => player.id === selectedPlayerId) || players[0];
  const availableMonths = getMatchMonths(matches);
  const selectedMonth = monthFilter === "todos" ? undefined : monthFilter;
  const automaticStats = getTeamStats(matches, selectedMonth);
  const savedAutomaticStats = getTeamStats(matches);
  const visibleStats = statsMode === "automatico" ? automaticStats : teamStats;
  const balance = visibleStats.goalsFor - visibleStats.goalsAgainst;
  const visibleWinRate = statsMode === "automatico"
    ? visibleStats.winRate
    : calculateWinRate(teamStats.games, teamStats.wins, teamStats.draws);

  async function saveTeamStats() {
    setSavingTeam(true);
    try {
      const nextStats = statsMode === "automatico"
        ? savedAutomaticStats
        : { ...teamStats, winRate: calculateWinRate(teamStats.games, teamStats.wins, teamStats.draws) };

      setTeamStats(nextStats);
      await saveAdminCollection("teamStats", nextStats);
    } finally {
      setSavingTeam(false);
    }
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
    <div className="p-4 md:p-10 space-y-6">
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
          <div className="grid gap-3 rounded-sm border border-brand-border bg-brand-black-2 p-4 md:grid-cols-[1fr_220px_220px] md:items-end">
            <div>
              <h2 className="font-display uppercase text-lg text-brand-gold">Modo das estatísticas</h2>
              <p className="text-sm text-brand-gray">
                No automático, só contam partidas com placar cadastrado e data já passada. Jogos agendados/futuros não entram nos números.
              </p>
            </div>
            <div>
              <Label>Preenchimento</Label>
              <Select className="mt-1" value={statsMode} onChange={(e) => setStatsMode(e.target.value as StatsMode)}>
                <option value="automatico">Automático pelos jogos</option>
                <option value="manual">Manual</option>
              </Select>
            </div>
            <div>
              <Label>Filtrar mês</Label>
              <Select className="mt-1" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} disabled={statsMode === "manual"}>
                <option value="todos">Todos os meses</option>
                {availableMonths.map((month) => <option key={month} value={month}>{formatMonth(month)}</option>)}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard label="Jogos" value={visibleStats.games} />
            <SummaryCard label="Aproveitamento" value={`${visibleWinRate}%`} />
            <SummaryCard label="Saldo" value={balance} />
            <SummaryCard label="Gols marcados" value={visibleStats.goalsFor} />
          </div>

          <div className="bg-brand-black-2 border border-brand-border rounded-sm p-4 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-display uppercase text-lg text-brand-gold">Números gerais</h2>
                <p className="text-sm text-brand-gray">
                  {statsMode === "automatico"
                    ? "Valores calculados automaticamente a partir das partidas cadastradas. O botão salva o total geral, sem o filtro mensal."
                    : "Edite os campos manualmente e salve para substituir os números gerais."}
                </p>
              </div>
              <Button variant="primary" onClick={saveTeamStats} disabled={savingTeam}>
                {savingTeam ? "Salvando..." : statsMode === "automatico" ? "Salvar automático" : "Salvar manual"}
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <NumberField label="Jogos" value={visibleStats.games} disabled={statsMode === "automatico"} onChange={(games) => setTeamStats({ ...teamStats, games })} />
              <NumberField label="Vitórias" value={visibleStats.wins} disabled={statsMode === "automatico"} onChange={(wins) => setTeamStats({ ...teamStats, wins })} />
              <NumberField label="Empates" value={visibleStats.draws} disabled={statsMode === "automatico"} onChange={(draws) => setTeamStats({ ...teamStats, draws })} />
              <NumberField label="Derrotas" value={visibleStats.losses} disabled={statsMode === "automatico"} onChange={(losses) => setTeamStats({ ...teamStats, losses })} />
              <NumberField label="Gols pró" value={visibleStats.goalsFor} disabled={statsMode === "automatico"} onChange={(goalsFor) => setTeamStats({ ...teamStats, goalsFor })} />
              <NumberField label="Gols contra" value={visibleStats.goalsAgainst} disabled={statsMode === "automatico"} onChange={(goalsAgainst) => setTeamStats({ ...teamStats, goalsAgainst })} />
              <NumberField label="Clean sheets" value={visibleStats.cleanSheets} disabled={statsMode === "automatico"} onChange={(cleanSheets) => setTeamStats({ ...teamStats, cleanSheets })} />
              <div>
                <Label>Aproveitamento</Label>
                <div className="mt-1 bg-brand-black border border-brand-border rounded-sm px-3 py-2 text-sm text-white">
                  {visibleWinRate}%
                </div>
              </div>
            </div>
          </div>

          {statsMode === "manual" ? (
            <>
              <EditableGoalsByMonth teamStats={teamStats} setTeamStats={setTeamStats} />
              <EditableCompetitionRates teamStats={teamStats} setTeamStats={setTeamStats} />
            </>
          ) : (
            <div className="rounded-sm border border-brand-border bg-brand-black-2 p-4 text-sm text-brand-gray">
              Gols por mês e aproveitamento por competição também são calculados automaticamente pelos jogos. Use o modo manual se precisar ajustar esses dados na mão.
            </div>
          )}
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

          <div className="md:hidden border border-brand-border rounded-sm divide-y divide-brand-border">
            {players.length === 0 ? (
              <p className="px-4 py-8 text-center text-brand-gray text-sm">Nenhum jogador cadastrado.</p>
            ) : players.map((player) => (
              <div key={player.id} className="p-3 space-y-3">
                <p className="font-semibold text-sm">{player.nickname || player.name}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <PlayerStatField label="Jogos" value={player.stats.games} onChange={(games) => updatePlayer(player.id, { ...player, stats: { ...player.stats, games } })} />
                  <PlayerStatField label="Gols" value={player.stats.goals} onChange={(goals) => updatePlayer(player.id, { ...player, stats: { ...player.stats, goals } })} />
                  <PlayerStatField label="Assistências" value={player.stats.assists} onChange={(assists) => updatePlayer(player.id, { ...player, stats: { ...player.stats, assists } })} />
                  <PlayerStatField label="Amarelos" value={player.stats.yellowCards} onChange={(yellowCards) => updatePlayer(player.id, { ...player, stats: { ...player.stats, yellowCards } })} />
                  <PlayerStatField label="Vermelhos" value={player.stats.redCards} onChange={(redCards) => updatePlayer(player.id, { ...player, stats: { ...player.stats, redCards } })} />
                  <PlayerStatField label="Minutos" value={player.stats.minutes} onChange={(minutes) => updatePlayer(player.id, { ...player, stats: { ...player.stats, minutes } })} />
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block border border-brand-border rounded-sm overflow-x-auto">
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

function NumberField({ label, value, disabled, onChange }: { label: string; value: number; disabled?: boolean; onChange: (value: number) => void }) {
  return <div><Label>{label}</Label><Input className="mt-1" type="number" min="0" placeholder="0" value={value || ""} disabled={disabled} onChange={(e) => onChange(e.target.value === "" ? 0 : +e.target.value)} /></div>;
}

function InlineNumber({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <Input className="w-24" type="number" min="0" placeholder="0" value={value || ""} onChange={(e) => onChange(e.target.value === "" ? 0 : +e.target.value)} />;
}

function PlayerStatField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <div><p className="text-[10px] uppercase tracking-wider text-brand-gray mb-1">{label}</p><InlineNumber value={value} onChange={onChange} /></div>;
}

function EditableGoalsByMonth({ teamStats, setTeamStats }: { teamStats: TeamStatsSummary; setTeamStats: (value: TeamStatsSummary) => void }) {
  return <div className="bg-brand-black-2 border border-brand-border rounded-sm p-4 space-y-4"><div className="flex flex-col items-start min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between gap-3"><h2 className="break-words font-display uppercase text-lg text-brand-gold">Gols por mês</h2><Button variant="outline" onClick={() => setTeamStats({ ...teamStats, goalsByMonth: [...teamStats.goalsByMonth, { month: "", goals: 0 }] })}><Plus className="w-4 h-4" /> Adicionar</Button></div><div className="space-y-3">{teamStats.goalsByMonth.map((row, index) => <div key={index} className="grid grid-cols-1 min-[420px]:grid-cols-[minmax(0,1fr)_120px_auto] gap-3 items-end"><div><Label>Mês</Label><Input className="mt-1" value={row.month} onChange={(e) => setTeamStats({ ...teamStats, goalsByMonth: teamStats.goalsByMonth.map((item, i) => i === index ? { ...item, month: e.target.value } : item) })} /></div><div><Label>Gols</Label><Input className="mt-1" type="number" min="0" placeholder="0" value={row.goals || ""} onChange={(e) => setTeamStats({ ...teamStats, goalsByMonth: teamStats.goalsByMonth.map((item, i) => i === index ? { ...item, goals: e.target.value === "" ? 0 : +e.target.value } : item) })} /></div><button type="button" className="pb-2 text-xs uppercase text-brand-red hover:underline" onClick={() => setTeamStats({ ...teamStats, goalsByMonth: teamStats.goalsByMonth.filter((_, i) => i !== index) })}>Excluir</button></div>)}{teamStats.goalsByMonth.length === 0 && <p className="text-sm text-brand-gray">Nenhum mês cadastrado.</p>}</div></div>;
}

function EditableCompetitionRates({ teamStats, setTeamStats }: { teamStats: TeamStatsSummary; setTeamStats: (value: TeamStatsSummary) => void }) {
  return <div className="bg-brand-black-2 border border-brand-border rounded-sm p-4 space-y-4"><div className="flex flex-col items-start min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between gap-3"><h2 className="break-words font-display uppercase text-lg text-brand-gold">Aproveitamento por competição</h2><Button variant="outline" onClick={() => setTeamStats({ ...teamStats, winRateByCompetition: [...teamStats.winRateByCompetition, { competition: "", rate: 0 }] })}><Plus className="w-4 h-4" /> Adicionar</Button></div><div className="space-y-3">{teamStats.winRateByCompetition.map((row, index) => <div key={index} className="grid grid-cols-1 min-[420px]:grid-cols-[minmax(0,1fr)_120px_auto] gap-3 items-end"><div><Label>Competição</Label><Input className="mt-1" value={row.competition} onChange={(e) => setTeamStats({ ...teamStats, winRateByCompetition: teamStats.winRateByCompetition.map((item, i) => i === index ? { ...item, competition: e.target.value } : item) })} /></div><div><Label>%</Label><Input className="mt-1" type="number" min="0" max="100" placeholder="0" value={row.rate || ""} onChange={(e) => setTeamStats({ ...teamStats, winRateByCompetition: teamStats.winRateByCompetition.map((item, i) => i === index ? { ...item, rate: e.target.value === "" ? 0 : +e.target.value } : item) })} /></div><button type="button" className="pb-2 text-xs uppercase text-brand-red hover:underline" onClick={() => setTeamStats({ ...teamStats, winRateByCompetition: teamStats.winRateByCompetition.filter((_, i) => i !== index) })}>Excluir</button></div>)}{teamStats.winRateByCompetition.length === 0 && <p className="text-sm text-brand-gray">Nenhuma competição cadastrada.</p>}</div></div>;
}

function PlayerMonthlyGoals({ players, selectedPlayer, selectedPlayerId, setSelectedPlayerId, updatePlayer }: { players: Player[]; selectedPlayer: Player; selectedPlayerId: string; setSelectedPlayerId: (value: string) => void; updatePlayer: (playerId: string, next: Player) => void }) {
  return <div className="bg-brand-black-2 border border-brand-border rounded-sm p-4 space-y-4"><div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"><div><h2 className="font-display uppercase text-lg text-brand-gold">Gols por mês do jogador</h2><p className="text-sm text-brand-gray">Esses dados alimentam os gráficos individuais do elenco.</p></div><div className="w-full md:w-72"><Label>Jogador</Label><Select className="mt-1" value={selectedPlayerId} onChange={(e) => setSelectedPlayerId(e.target.value)}>{players.map((player) => <option key={player.id} value={player.id}>{player.nickname || player.name}</option>)}</Select></div></div><div className="space-y-3">{selectedPlayer.monthlyGoals.map((row, index) => <div key={index} className="grid grid-cols-[1fr_120px_auto] gap-3 items-end"><div><Label>Mês</Label><Input className="mt-1" value={row.month} onChange={(e) => updatePlayer(selectedPlayer.id, { ...selectedPlayer, monthlyGoals: selectedPlayer.monthlyGoals.map((item, i) => i === index ? { ...item, month: e.target.value } : item) })} /></div><div><Label>Gols</Label><Input className="mt-1" type="number" min="0" placeholder="0" value={row.goals || ""} onChange={(e) => updatePlayer(selectedPlayer.id, { ...selectedPlayer, monthlyGoals: selectedPlayer.monthlyGoals.map((item, i) => i === index ? { ...item, goals: e.target.value === "" ? 0 : +e.target.value } : item) })} /></div><button type="button" className="pb-2 text-xs uppercase text-brand-red hover:underline" onClick={() => updatePlayer(selectedPlayer.id, { ...selectedPlayer, monthlyGoals: selectedPlayer.monthlyGoals.filter((_, i) => i !== index) })}>Excluir</button></div>)}{selectedPlayer.monthlyGoals.length === 0 && <p className="text-sm text-brand-gray">Nenhum mês cadastrado para este jogador.</p>}<Button variant="outline" onClick={() => updatePlayer(selectedPlayer.id, { ...selectedPlayer, monthlyGoals: [...selectedPlayer.monthlyGoals, { month: "", goals: 0 }] })}><Plus className="w-4 h-4" /> Adicionar mês</Button></div></div>;
}
