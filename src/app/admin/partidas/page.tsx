"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { saveAdminCollection, uploadAdminFile } from "@/lib/admin-client";
import type { Match, MatchEvent } from "@/types";
import { formatDate } from "@/lib/utils";

export default function AdminPartidasPage() {
  const [rows, setRows] = useState<Match[]>([]);
  const [editing, setEditing] = useState<Match | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/cms", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.matches && setRows(data.matches));
  }, []);

  function handleNew() {
    setEditing({
      id: `m${Date.now()}`,
      opponent: "",
      opponentLogo: "",
      date: new Date().toISOString(),
      location: "",
      homeAway: "casa",
      competition: "Copa Amadora",
      season: "2026",
      status: "agendada",
      scoreHome: null,
      scoreAway: null,
      result: null,
      events: [],
      lineupStart: [],
      lineupBench: [],
      gallery: [],
    });
    setOpen(true);
  }

  async function persist(next: Match[]) {
    setMessage(null);
    const data = await saveAdminCollection("matches", next);
    setRows(data.matches);
    return data.matches;
  }

  async function handleSave(m: Match) {
    setSaving(true);
    const exists = rows.find((x) => x.id === m.id);
    const next = exists ? rows.map((x) => (x.id === m.id ? m : x)) : [...rows, m];
    try {
      await persist(next);
      setOpen(false);
      setEditing(null);
    } catch (error) {
      console.error("Erro ao salvar partida", error);
      setMessage(error instanceof Error ? error.message : "Falha ao salvar partida");
    } finally {
      setSaving(false);
    }
  }

  function addEvent() {
    if (!editing) return;
    const newEv: MatchEvent = {
      minute: 0,
      type: "gol",
      playerId: "",
      playerName: "",
      team: "bravura",
    };
    setEditing({ ...editing, events: [...editing.events, newEv] });
  }

  function updateEvent(i: number, patch: Partial<MatchEvent>) {
    if (!editing) return;
    setEditing({
      ...editing,
      events: editing.events.map((ev, idx) => (idx === i ? { ...ev, ...patch } : ev)),
    });
  }

  function removeEvent(i: number) {
    if (!editing) return;
    setEditing({ ...editing, events: editing.events.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="p-4 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl md:text-4xl uppercase">Partidas</h1>
        <Button variant="primary" onClick={handleNew}>
          <Plus className="w-4 h-4" /> Nova
        </Button>
      </div>

      {message && <p className="mb-4 text-sm text-brand-red">{message}</p>}

      <DataTable
        columns={[
          { key: "date", label: "Data", render: (r) => formatDate(r.date) },
          { key: "opponent", label: "Adversário" },
          { key: "competition", label: "Competição" },
          { key: "homeAway", label: "Local" },
          { key: "status", label: "Status" },
          {
            key: "score",
            label: "Placar",
            render: (r) =>
              r.status === "encerrada" ? `${r.scoreHome} × ${r.scoreAway}` : "—",
          },
        ]}
        rows={rows}
        onEdit={(r) => {
          setEditing(r);
          setOpen(true);
        }}
        onDelete={(r) => {
          void persist(rows.filter((x) => x.id !== r.id)).catch((error) => {
            console.error("Erro ao excluir partida", error);
            setMessage(error instanceof Error ? error.message : "Falha ao excluir partida");
          });
        }}
        onBulkDelete={(selected) => {
          void persist(rows.filter((row) => !selected.some((item) => item.id === row.id))).catch((error) => {
            console.error("Erro ao excluir partidas", error);
            setMessage(error instanceof Error ? error.message : "Falha ao excluir partidas");
          });
        }}
      />

      {editing && (
        <Dialog
          open={open}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          title="Editar partida"
          className="max-w-3xl"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(editing);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-1 sm:col-span-2">
                <Label>Adversário</Label>
                <Input
                  required
                  className="mt-1"
                  value={editing.opponent}
                  onChange={(e) => setEditing({ ...editing, opponent: e.target.value })}
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Label>Escudo do adversário</Label>
                <Input
                  type="file"
                  accept="image/*"
                  className="mt-1"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    setMessage(null);
                    try {
                      const upload = await uploadAdminFile(file);
                      setEditing((prev) => prev ? { ...prev, opponentLogo: upload.url } : prev);
                    } catch (error) {
                      setMessage(error instanceof Error ? error.message : "Falha ao enviar imagem. Verifique sua conexão e tente novamente.");
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
                {uploading && <p className="text-xs text-brand-gray mt-1">Enviando imagem...</p>}
                {editing.opponentLogo && !uploading && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={editing.opponentLogo} alt="Preview" className="mt-2 h-16 w-auto object-contain" />
                )}
              </div>
              <div>
                <Label>Data</Label>
                <Input
                  required
                  type="datetime-local"
                  className="mt-1"
                  value={editing.date.slice(0, 16)}
                  onChange={(e) =>
                    setEditing({ ...editing, date: new Date(e.target.value).toISOString() })
                  }
                />
              </div>
              <div>
                <Label>Competição</Label>
                <Input
                  className="mt-1"
                  value={editing.competition}
                  onChange={(e) => setEditing({ ...editing, competition: e.target.value })}
                />
              </div>
              <div>
                <Label>Local</Label>
                <Input
                  className="mt-1"
                  value={editing.location}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                />
              </div>
              <div>
                <Label>Casa/Fora</Label>
                <Select
                  className="mt-1"
                  value={editing.homeAway}
                  onChange={(e) =>
                    setEditing({ ...editing, homeAway: e.target.value as Match["homeAway"] })
                  }
                >
                  <option value="casa">Casa</option>
                  <option value="fora">Fora</option>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  className="mt-1"
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({ ...editing, status: e.target.value as Match["status"] })
                  }
                >
                  <option value="agendada">Agendada</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="encerrada">Encerrada</option>
                </Select>
              </div>
              <div>
                <Label>Resultado</Label>
                <Select
                  className="mt-1"
                  value={editing.result ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      result: e.target.value === "" ? null : (e.target.value as Match["result"]),
                    })
                  }
                >
                  <option value="">Sem resultado</option>
                  <option value="V">Vitória</option>
                  <option value="E">Empate</option>
                  <option value="D">Derrota</option>
                </Select>
              </div>
              <div>
                <Label>Placar casa</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={editing.scoreHome ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      scoreHome: e.target.value === "" ? null : +e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Placar fora</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={editing.scoreAway ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      scoreAway: e.target.value === "" ? null : +e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Galeria da partida</Label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-brand-border px-3 py-2 text-xs uppercase text-brand-white hover:border-brand-gold">
                  <Plus className="w-3 h-3" /> Adicionar imagem
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      setUploading(true);
                      setMessage(null);
                      try {
                        const upload = await uploadAdminFile(file);
                        setEditing((prev) => prev ? { ...prev, gallery: [...prev.gallery, upload.url] } : prev);
                      } catch (error) {
                        setMessage(error instanceof Error ? error.message : "Falha ao enviar imagem. Verifique sua conexão e tente novamente.");
                      } finally {
                        setUploading(false);
                      }
                    }}
                  />
                </label>
              </div>
              {uploading && <p className="text-xs text-brand-gray mb-2">Enviando imagem...</p>}
              {editing.gallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {editing.gallery.map((src, i) => (
                    <div key={`${src}-${i}`} className="relative overflow-hidden rounded-sm border border-brand-border bg-brand-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Foto ${i + 1} da partida`} className="h-24 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, gallery: editing.gallery.filter((_, idx) => idx !== i) })}
                        className="absolute right-1 top-1 rounded-sm bg-black/70 p-1 text-brand-red"
                        aria-label="Remover imagem da galeria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-sm border border-dashed border-brand-border p-3 text-sm text-brand-gray">Nenhuma imagem adicionada.</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Eventos (gols, cartões, etc.)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addEvent}>
                  <Plus className="w-3 h-3" /> Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {editing.events.map((ev, i) => (
                  <div
                    key={i}
                    className="bg-brand-black border border-brand-border rounded-sm p-2 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-[60px_1fr_1fr_1fr_auto] sm:gap-2 sm:items-center"
                  >
                    {/* Mobile: linha 1 — minuto + tipo */}
                    <div className="grid grid-cols-[64px_1fr] gap-2 sm:contents">
                      <Input
                        type="number"
                        value={ev.minute || ""}
                        placeholder="min"
                        onChange={(e) => updateEvent(i, { minute: e.target.value === "" ? 0 : +e.target.value })}
                      />
                      <Select
                        value={ev.type}
                        onChange={(e) => updateEvent(i, { type: e.target.value as MatchEvent["type"] })}
                      >
                        <option value="gol">Gol</option>
                        <option value="assistencia">Assistência</option>
                        <option value="cartao_amarelo">Cartão amarelo</option>
                        <option value="cartao_vermelho">Cartão vermelho</option>
                        <option value="substituicao">Substituição</option>
                      </Select>
                    </div>
                    {/* Mobile: linha 2 — jogador + time + excluir */}
                    <div className="grid grid-cols-1 min-[420px]:grid-cols-[1fr_1fr_auto] gap-2 sm:contents">
                      <Input
                        placeholder="Jogador"
                        value={ev.playerName}
                        onChange={(e) => updateEvent(i, { playerName: e.target.value })}
                      />
                      <Select
                        value={ev.team}
                        onChange={(e) => updateEvent(i, { team: e.target.value as MatchEvent["team"] })}
                      >
                        <option value="bravura">Bravura</option>
                        <option value="adversario">Adversário</option>
                      </Select>
                      <button
                        type="button"
                        onClick={() => removeEvent(i)}
                        className="text-brand-red p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={saving || uploading}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
