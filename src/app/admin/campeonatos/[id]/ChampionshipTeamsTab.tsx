"use client";

import { useState } from "react";
import { Pencil, Plus, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { createAdminId } from "@/lib/admin-id";
import { bravuraLogo } from "@/lib/asset-url";
import { getTeamGroup } from "@/lib/championship-stats";
import { getInitials, getValidImageSrc } from "@/lib/image-utils";
import type { Championship, ChampionshipTeam } from "@/types";
import { ImageField } from "./ImageField";

interface Props {
  championship: Championship;
  onSave: (next: Championship) => Promise<Championship>;
  onError: (message: string) => void;
}

export function TeamLogo({ team, size = 40 }: { team?: ChampionshipTeam; size?: number }) {
  const logo = getValidImageSrc(team?.logo);
  if (logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo} alt={team?.name || ""} className="shrink-0 object-contain" style={{ width: size, height: size }} />;
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-sm border border-brand-border bg-brand-black text-[10px] font-bold text-brand-gray"
      style={{ width: size, height: size }}
    >
      {getInitials(team?.name || "?")}
    </div>
  );
}

export function ChampionshipTeamsTab({ championship, onSave, onError }: Props) {
  const [editing, setEditing] = useState<ChampionshipTeam | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const teams = championship.teams;
  const hasBravura = teams.some((team) => team.isBravura);

  async function saveTeams(next: ChampionshipTeam[]) {
    setSaving(true);
    try {
      // Times removidos saem também dos grupos (a validação do servidor limpa o resto).
      const ids = new Set(next.map((team) => team.id));
      const groups = championship.groups.map((group) => ({ ...group, teamIds: group.teamIds.filter((id) => ids.has(id)) }));
      await onSave({ ...championship, teams: next, groups });
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(team: ChampionshipTeam) {
    // Só um time pode ser o Bravura.
    const others = teams.map((row) => (team.isBravura && row.id !== team.id ? { ...row, isBravura: undefined } : row));
    const exists = teams.some((row) => row.id === team.id);
    const next = exists ? others.map((row) => (row.id === team.id ? team : row)) : [...others, team];
    if (await saveTeams(next)) setEditing(null);
  }

  function handleDelete(team: ChampionshipTeam) {
    if (!window.confirm(`Remover ${team.name} do campeonato?`)) return;
    void saveTeams(teams.filter((row) => row.id !== team.id));
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={() => setEditing({ id: createAdminId("ct"), name: "", logo: "" })}>
          <Plus className="h-4 w-4" /> Novo time
        </Button>
        {!hasBravura && (
          <Button
            variant="outline"
            disabled={saving}
            onClick={() => void saveTeams([...teams, { id: createAdminId("ct"), name: "Bravura", logo: bravuraLogo, isBravura: true }])}
          >
            <Shield className="h-4 w-4" /> Adicionar o Bravura
          </Button>
        )}
      </div>
      <p className="mb-4 text-xs text-brand-gray">
        Times participantes do campeonato. O time marcado como Bravura recebe automaticamente os resultados das partidas na classificação.
      </p>

      {teams.length === 0 ? (
        <p className="rounded-sm border border-dashed border-brand-border p-8 text-center text-sm text-brand-gray">Nenhum time cadastrado.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const group = getTeamGroup(championship, team.id);
            return (
              <div key={team.id} className="flex items-center gap-3 rounded-sm border border-brand-border bg-brand-black-2 p-3">
                <TeamLogo team={team} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg uppercase">{team.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-brand-gray">
                    {[team.isBravura ? "Bravura" : null, group?.name || "Sem grupo"].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button type="button" onClick={() => setEditing(team)} className="p-1 text-brand-gray hover:text-white" aria-label={`Editar ${team.name}`}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleDelete(team)} className="p-1 text-brand-red" aria-label={`Remover ${team.name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <Dialog open onClose={() => setEditing(null)} title={teams.some((row) => row.id === editing.id) ? "Editar time" : "Novo time"}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(editing);
            }}
            className="space-y-4"
          >
            <div>
              <Label>Nome</Label>
              <Input required autoFocus className="mt-1" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <ImageField
              label="Escudo"
              value={editing.logo}
              onChange={(logo) => setEditing((prev) => (prev ? { ...prev, logo } : prev))}
              onError={onError}
              onUploadingChange={setUploading}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(editing.isBravura)}
                onChange={(e) => setEditing({ ...editing, isBravura: e.target.checked || undefined })}
              />
              Este time é o Bravura (resultados das partidas entram na classificação)
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={saving || uploading}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
