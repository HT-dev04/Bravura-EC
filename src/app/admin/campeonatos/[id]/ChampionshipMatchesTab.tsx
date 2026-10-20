"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { createAdminId } from "@/lib/admin-id";
import { dateTimeLocalToIso, formatDate, formatDateTimeLocalInput } from "@/lib/utils";
import type { Championship, ChampionshipMatch, MatchEvent } from "@/types";
import { ImageField } from "./ImageField";

const PHASE_SUGGESTIONS = ["Fase de grupos", "Oitavas de final", "Quartas de final", "Semifinal", "Final", "Disputa de 3º lugar"];

interface Props {
  championship: Championship;
  onSave: (next: Championship) => Promise<Championship>;
  onError: (message: string) => void;
}

function scoreInput(value: string) {
  return value === "" ? null : Math.max(0, Math.trunc(+value));
}

function scoreLabel(match: ChampionshipMatch) {
  if (match.scoreHome === null || match.scoreAway === null) return "—";
  const penalties =
    match.penaltiesHome !== null && match.penaltiesAway !== null ? ` (${match.penaltiesHome}×${match.penaltiesAway} pên.)` : "";
  return `${match.scoreHome} × ${match.scoreAway}${penalties}`;
}

export function ChampionshipMatchesTab({ championship, onSave, onError }: Props) {
  const [editing, setEditing] = useState<ChampionshipMatch | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const matches = championship.matches;
  const players = [...championship.players].sort((a, b) => a.number - b.number);
  const rows = [...matches].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  async function saveMatches(next: ChampionshipMatch[]) {
    setSaving(true);
    try {
      await onSave({ ...championship, matches: next });
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }

  function handleNew() {
    setEditing({
      id: createAdminId("cm"),
      opponent: "",
      opponentLogo: "",
      date: new Date().toISOString(),
      location: "",
      phase: matches.length > 0 ? matches[matches.length - 1].phase : "Fase de grupos",
      status: "agendada",
      scoreHome: null,
      scoreAway: null,
      penaltiesHome: null,
      penaltiesAway: null,
      events: [],
      lineup: [],
      highlightPlayerId: "",
    });
  }

  async function handleSave(match: ChampionshipMatch) {
    // Placar preenchido em jogo já passado conta como encerrado, igual às partidas dos amistosos.
    const finished =
      match.scoreHome !== null && match.scoreAway !== null && match.status === "agendada" && new Date(match.date).getTime() <= Date.now();
    const saved = finished ? { ...match, status: "encerrada" as const } : match;
    const exists = matches.some((row) => row.id === saved.id);
    const next = exists ? matches.map((row) => (row.id === saved.id ? saved : row)) : [...matches, saved];
    if (await saveMatches(next)) setEditing(null);
  }

  function handleDelete(selected: ChampionshipMatch[]) {
    const ids = new Set(selected.map((match) => match.id));
    void saveMatches(matches.filter((match) => !ids.has(match.id)));
  }

  const opponentTeams = championship.teams.filter((team) => !team.isBravura);

  function selectOpponentTeam(teamId: string) {
    if (!editing) return;
    const team = opponentTeams.find((row) => row.id === teamId);
    if (!team) {
      setEditing({ ...editing, opponentTeamId: undefined });
      return;
    }
    // Jogo contra time do mesmo grupo do Bravura já vem marcado para a classificação.
    const bravura = championship.teams.find((row) => row.isBravura);
    const sharedGroup = championship.groups.find(
      (group) => group.teamIds.includes(team.id) && (!bravura || group.teamIds.includes(bravura.id))
    );
    setEditing({
      ...editing,
      opponentTeamId: team.id,
      opponent: team.name,
      opponentLogo: team.logo,
      groupId: editing.groupId || sharedGroup?.id,
    });
  }

  function updateEvent(index: number, patch: Partial<MatchEvent>) {
    setEditing((prev) =>
      prev ? { ...prev, events: prev.events.map((event, i) => (i === index ? { ...event, ...patch } : event)) } : prev
    );
  }

  function toggleLineup(playerId: string) {
    setEditing((prev) =>
      prev
        ? {
            ...prev,
            lineup: prev.lineup.includes(playerId) ? prev.lineup.filter((id) => id !== playerId) : [...prev.lineup, playerId],
          }
        : prev
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={handleNew}>
          <Plus className="h-4 w-4" /> Nova partida
        </Button>
      </div>
      {players.length === 0 && (
        <p className="mb-4 text-xs text-brand-gold">Cadastre o elenco do campeonato primeiro para lançar gols, cartões e quem jogou.</p>
      )}

      <DataTable
        columns={[
          { key: "date", label: "Data", render: (r) => formatDate(r.date) },
          { key: "phase", label: "Fase" },
          { key: "opponent", label: "Adversário" },
          { key: "status", label: "Status" },
          { key: "score", label: "Placar", render: scoreLabel },
        ]}
        rows={rows}
        onEdit={(r) => setEditing(r)}
        onDelete={(r) => handleDelete([r])}
        onBulkDelete={handleDelete}
      />

      {editing && (
        <Dialog
          open
          onClose={() => setEditing(null)}
          title={matches.some((row) => row.id === editing.id) ? "Editar partida" : "Nova partida"}
          className="max-w-3xl"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(editing);
            }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {opponentTeams.length > 0 && (
                <div>
                  <Label>Time adversário</Label>
                  <Select className="mt-1" value={editing.opponentTeamId || ""} onChange={(e) => selectOpponentTeam(e.target.value)}>
                    <option value="">Outro (digitar abaixo)</option>
                    {opponentTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              {championship.groups.length > 0 && (
                <div>
                  <Label>Conta na classificação</Label>
                  <Select
                    className="mt-1"
                    value={editing.groupId || ""}
                    onChange={(e) => setEditing({ ...editing, groupId: e.target.value || undefined })}
                  >
                    <option value="">Não (mata-mata / outro)</option>
                    {championship.groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              <div className="sm:col-span-2">
                <Label>Adversário</Label>
                <Input
                  required
                  className="mt-1"
                  value={editing.opponent}
                  onChange={(e) => setEditing({ ...editing, opponent: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <ImageField
                  label="Escudo do adversário"
                  value={editing.opponentLogo}
                  onChange={(opponentLogo) => setEditing((prev) => (prev ? { ...prev, opponentLogo } : prev))}
                  onError={onError}
                  onUploadingChange={setUploading}
                />
              </div>
              <div>
                <Label>Data</Label>
                <Input
                  required
                  type="datetime-local"
                  className="mt-1"
                  value={formatDateTimeLocalInput(editing.date)}
                  onChange={(e) => setEditing({ ...editing, date: dateTimeLocalToIso(e.target.value) })}
                />
              </div>
              <div>
                <Label>Fase</Label>
                <Input
                  className="mt-1"
                  list="championship-phases"
                  value={editing.phase}
                  onChange={(e) => setEditing({ ...editing, phase: e.target.value })}
                />
                <datalist id="championship-phases">
                  {PHASE_SUGGESTIONS.map((phase) => (
                    <option key={phase} value={phase} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label>Local</Label>
                <Input className="mt-1" value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  className="mt-1"
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as ChampionshipMatch["status"] })}
                >
                  <option value="agendada">Agendada</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="encerrada">Encerrada</option>
                </Select>
              </div>
              <div>
                <Label>Gols Bravura</Label>
                <Input
                  type="number"
                  min={0}
                  className="mt-1"
                  value={editing.scoreHome ?? ""}
                  onChange={(e) => setEditing({ ...editing, scoreHome: scoreInput(e.target.value) })}
                />
              </div>
              <div>
                <Label>Gols adversário</Label>
                <Input
                  type="number"
                  min={0}
                  className="mt-1"
                  value={editing.scoreAway ?? ""}
                  onChange={(e) => setEditing({ ...editing, scoreAway: scoreInput(e.target.value) })}
                />
              </div>
              <div>
                <Label>Pênaltis Bravura (opcional)</Label>
                <Input
                  type="number"
                  min={0}
                  className="mt-1"
                  value={editing.penaltiesHome ?? ""}
                  onChange={(e) => setEditing({ ...editing, penaltiesHome: scoreInput(e.target.value) })}
                />
              </div>
              <div>
                <Label>Pênaltis adversário (opcional)</Label>
                <Input
                  type="number"
                  min={0}
                  className="mt-1"
                  value={editing.penaltiesAway ?? ""}
                  onChange={(e) => setEditing({ ...editing, penaltiesAway: scoreInput(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <Label>Quem jogou ({editing.lineup.length})</Label>
                {players.length > 0 && (
                  <button
                    type="button"
                    className="text-xs uppercase tracking-wider text-brand-gold hover:underline"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        lineup: editing.lineup.length === players.length ? [] : players.map((player) => player.id),
                      })
                    }
                  >
                    {editing.lineup.length === players.length ? "Limpar" : "Marcar todos"}
                  </button>
                )}
              </div>
              {players.length === 0 ? (
                <p className="rounded-sm border border-dashed border-brand-border p-3 text-sm text-brand-gray">Nenhum inscrito no campeonato.</p>
              ) : (
                <div className="grid max-h-56 gap-1 overflow-y-auto rounded-sm border border-brand-border p-2 sm:grid-cols-2 md:grid-cols-3">
                  {players.map((player) => (
                    <label key={player.id} className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-white/5">
                      <input type="checkbox" checked={editing.lineup.includes(player.id)} onChange={() => toggleLineup(player.id)} />
                      <span className="w-6 font-bold text-brand-gold">{player.number || "—"}</span>
                      <span className="min-w-0 truncate">{player.nickname || player.name}</span>
                    </label>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-brand-gray">Conta um jogo para cada marcado. Quem fez gol, assistência ou levou cartão já conta automaticamente.</p>
            </div>

            <div>
              <Label>Craque do jogo</Label>
              <Select
                className="mt-1"
                value={editing.highlightPlayerId || ""}
                onChange={(e) => setEditing({ ...editing, highlightPlayerId: e.target.value })}
              >
                <option value="">Sem destaque</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.nickname || player.name} · #{player.number}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Eventos (gols, cartões, etc.)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      events: [...editing.events, { minute: 0, type: "gol", playerId: "", playerName: "", team: "bravura" }],
                    })
                  }
                >
                  <Plus className="h-3 w-3" /> Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {editing.events.map((event, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[64px_1fr] gap-2 rounded-sm border border-brand-border bg-brand-black p-2 sm:grid-cols-[64px_1fr_1.4fr_1fr_auto] sm:items-center"
                  >
                    <Input
                      type="number"
                      placeholder="min"
                      value={event.minute || ""}
                      onChange={(e) => updateEvent(i, { minute: e.target.value === "" ? 0 : +e.target.value })}
                    />
                    <Select value={event.type} onChange={(e) => updateEvent(i, { type: e.target.value as MatchEvent["type"] })}>
                      <option value="gol">Gol</option>
                      <option value="assistencia">Assistência</option>
                      <option value="cartao_amarelo">Cartão amarelo</option>
                      <option value="cartao_vermelho">Cartão vermelho</option>
                      <option value="substituicao">Substituição</option>
                    </Select>
                    {event.team === "bravura" ? (
                      <Select
                        aria-label="Jogador do evento"
                        className="col-span-2 sm:col-span-1"
                        value={event.playerId}
                        onChange={(e) => {
                          const player = players.find((row) => row.id === e.target.value);
                          updateEvent(i, { playerId: e.target.value, playerName: player ? player.nickname || player.name : "" });
                        }}
                      >
                        <option value="">Escolha o jogador</option>
                        {players.map((player) => (
                          <option key={player.id} value={player.id}>
                            {player.nickname || player.name} · #{player.number}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        className="col-span-2 sm:col-span-1"
                        placeholder="Jogador adversário"
                        value={event.playerName}
                        onChange={(e) => updateEvent(i, { playerId: "", playerName: e.target.value })}
                      />
                    )}
                    <Select
                      value={event.team}
                      onChange={(e) => updateEvent(i, { team: e.target.value as MatchEvent["team"], playerId: "", playerName: "" })}
                    >
                      <option value="bravura">Bravura</option>
                      <option value="adversario">Adversário</option>
                    </Select>
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, events: editing.events.filter((_, idx) => idx !== i) })}
                      className="justify-self-end p-1 text-brand-red"
                      aria-label="Remover evento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
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
