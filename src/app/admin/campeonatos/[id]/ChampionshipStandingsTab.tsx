"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAdminId } from "@/lib/admin-id";
import { getGroupStandings, STANDING_STAT_KEYS } from "@/lib/championship-stats";
import { cn } from "@/lib/utils";
import type { Championship, ChampionshipGroup, ChampionshipStandingStats } from "@/types";
import { TeamLogo } from "./ChampionshipTeamsTab";

interface Props {
  championship: Championship;
  onSave: (next: Championship) => Promise<Championship>;
}

const MANUAL_LABELS: Record<keyof ChampionshipStandingStats, string> = {
  wins: "V",
  draws: "E",
  losses: "D",
  goalsFor: "GP",
  goalsAgainst: "GC",
};

function nextGroupName(groups: ChampionshipGroup[]) {
  const used = new Set(groups.map((group) => group.name.trim().toUpperCase()));
  for (let code = 65; code < 91; code++) {
    const name = `Grupo ${String.fromCharCode(code)}`;
    if (!used.has(name.toUpperCase())) return name;
  }
  return `Grupo ${groups.length + 1}`;
}

export function ChampionshipStandingsTab({ championship, onSave }: Props) {
  const [groups, setGroups] = useState(championship.groups);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const draft = { ...championship, groups };
  const dirty = JSON.stringify(groups) !== JSON.stringify(championship.groups);

  function update(groupId: string, patch: (group: ChampionshipGroup) => ChampionshipGroup) {
    setSaved(false);
    setGroups((current) => current.map((group) => (group.id === groupId ? patch(group) : group)));
  }

  function toggleTeam(groupId: string, teamId: string) {
    setSaved(false);
    // Um time fica em um grupo só.
    setGroups((current) =>
      current.map((group) => {
        if (group.id === groupId) {
          return group.teamIds.includes(teamId)
            ? { ...group, teamIds: group.teamIds.filter((id) => id !== teamId) }
            : { ...group, teamIds: [...group.teamIds, teamId] };
        }
        return { ...group, teamIds: group.teamIds.filter((id) => id !== teamId) };
      })
    );
  }

  function setManual(groupId: string, teamId: string, key: keyof ChampionshipStandingStats, value: string) {
    update(groupId, (group) => ({
      ...group,
      manual: { ...group.manual, [teamId]: { ...group.manual[teamId], [key]: value === "" ? 0 : Math.max(0, Math.trunc(+value)) } },
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const next = await onSave(draft);
      setGroups(next.groups);
      setSaved(true);
    } catch {
      // Mensagem já exibida pela página.
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setSaved(false);
            setGroups([...groups, { id: createAdminId("cg"), name: nextGroupName(groups), teamIds: [], manual: {} }]);
          }}
        >
          <Plus className="h-4 w-4" /> Novo grupo
        </Button>
        <div className="ml-auto flex items-center gap-3">
          {saved && !dirty && <span className="text-xs text-green-500">Salvo!</span>}
          <Button variant="primary" onClick={handleSave} disabled={saving || !dirty}>
            {saving ? "Salvando..." : "Salvar classificação"}
          </Button>
        </div>
      </div>
      <p className="mb-6 max-w-3xl text-xs text-brand-gray">
        Os jogos do Bravura entram sozinhos quando a partida está encerrada e marcada com o grupo. Nos campos V, E, D, GP e GC lance só os
        jogos entre os outros times. P (pontos), J (jogos) e SG (saldo) são calculados.
      </p>

      {championship.teams.length === 0 && (
        <p className="mb-4 text-xs text-brand-gold">Cadastre os times na aba Times para montar os grupos.</p>
      )}

      {groups.length === 0 ? (
        <p className="rounded-sm border border-dashed border-brand-border p-8 text-center text-sm text-brand-gray">Nenhum grupo criado.</p>
      ) : (
        <div className="grid gap-6 2xl:grid-cols-2">
          {groups.map((group) => {
            const rows = getGroupStandings(draft, group);
            return (
              <div key={group.id} className="rounded-sm border border-brand-border bg-brand-black-2 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Input
                    aria-label="Nome do grupo"
                    className="font-display text-lg uppercase"
                    value={group.name}
                    onChange={(e) => update(group.id, (row) => ({ ...row, name: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="p-2 text-brand-red"
                    aria-label={`Excluir ${group.name}`}
                    onClick={() => {
                      if (!window.confirm(`Excluir ${group.name}?`)) return;
                      setSaved(false);
                      setGroups(groups.filter((row) => row.id !== group.id));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-4 flex flex-wrap gap-1.5">
                  {championship.teams.map((team) => {
                    const active = group.teamIds.includes(team.id);
                    return (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => toggleTeam(group.id, team.id)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                          active ? "border-brand-red bg-brand-red/20 text-white" : "border-brand-border text-brand-gray hover:text-white"
                        )}
                      >
                        {active ? "✓ " : "+ "}
                        {team.name}
                      </button>
                    );
                  })}
                </div>

                {rows.length === 0 ? (
                  <p className="text-sm text-brand-gray">Escolha os times do grupo acima.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-sm">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-wider text-brand-gray">
                          <th className="py-2 text-left">Time</th>
                          <th className="w-10 text-center">P</th>
                          <th className="w-10 text-center">J</th>
                          {STANDING_STAT_KEYS.map((key) => (
                            <th key={key} className="w-14 text-center">
                              {MANUAL_LABELS[key]}
                            </th>
                          ))}
                          <th className="w-10 text-center">SG</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, index) => (
                          <tr key={row.team.id} className="border-t border-brand-border">
                            <td className="py-2">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="w-4 text-brand-gray">{index + 1}</span>
                                <TeamLogo team={row.team} size={24} />
                                <span className="truncate font-semibold">{row.team.name}</span>
                              </div>
                            </td>
                            <td className="text-center font-bold text-brand-gold">{row.points}</td>
                            <td className="text-center">{row.played}</td>
                            {STANDING_STAT_KEYS.map((key) => (
                              <td key={key} className="px-0.5">
                                <Input
                                  type="number"
                                  min={0}
                                  aria-label={`${MANUAL_LABELS[key]} manual de ${row.team.name}`}
                                  className="px-1.5 py-1 text-center"
                                  placeholder="0"
                                  value={group.manual[row.team.id]?.[key] || ""}
                                  onChange={(e) => setManual(group.id, row.team.id, key, e.target.value)}
                                />
                              </td>
                            ))}
                            <td className="text-center">{row.goalDiff}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
