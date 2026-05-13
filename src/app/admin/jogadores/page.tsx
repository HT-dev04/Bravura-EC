"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { saveAdminCollection, uploadAdminFile } from "@/lib/admin-client";
import { createAdminId } from "@/lib/admin-id";
import { slugify } from "@/lib/utils";
import type { Player, Position } from "@/types";

export default function AdminJogadoresPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Player[]>([]);
  const [editing, setEditing] = useState<Player | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/cms", { cache: "no-store", credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.players && setRows(data.players));
  }, []);

  function handleNew() {
    setEditing({
      id: createAdminId("p"),
      slug: "",
      name: "",
      nickname: "",
      number: 0,
      position: "Atacante",
      birthDate: "2000-01-01",
      height: 175,
      weight: 70,
      preferredFoot: "Direito",
      photo: "",
      bio: "",
      season: "2026",
      stats: { games: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutes: 0 },
      history: [],
      monthlyGoals: [],
    });
    setOpen(true);
  }

  async function persist(next: Player[]) {
    setError(null);
    const data = await saveAdminCollection("players", next);
    setRows(data.players);
    router.refresh();
    return data.players;
  }

  async function handleSave(p: Player) {
    setSaving(true);
    const player = { ...p, slug: p.slug || slugify(p.nickname || p.name) };
    const next = (() => {
      const exists = rows.find((x) => x.id === p.id);
      if (exists) return rows.map((x) => (x.id === p.id ? player : x));
      return [...rows, player];
    })();
    try {
      await persist(next);
      setOpen(false);
      setEditing(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Falha ao salvar jogador");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Player) {
    const next = rows.filter((x) => x.id !== p.id);
    console.info("Excluindo jogador no admin", {
      deletedId: p.id,
      beforeIds: rows.map((player) => player.id),
      afterIds: next.map((player) => player.id),
    });

    try {
      const savedPlayers = await persist(next);
      console.info("Resultado da exclusão de jogador", {
        deletedId: p.id,
        savedIds: savedPlayers.map((player) => player.id),
      });
    } catch (error) {
      console.error("Erro ao excluir jogador", {
        deletedId: p.id,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      setError(error instanceof Error ? error.message : "Falha ao excluir jogador");
    }
  }

  return (
    <div className="p-4 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl md:text-4xl uppercase">Jogadores</h1>
        <Button variant="primary" onClick={handleNew}>
          <Plus className="w-4 h-4" /> Novo
        </Button>
      </div>

      {error && <p className="mb-4 text-sm text-brand-red">{error}</p>}

      <DataTable
        columns={[
          { key: "number", label: "#", className: "w-12" },
          { key: "name", label: "Nome" },
          { key: "nickname", label: "Apelido" },
          { key: "position", label: "Posição" },
          { key: "games", label: "Jogos", render: (r) => r.stats.games },
          { key: "goals", label: "Gols", render: (r) => r.stats.goals },
        ]}
        rows={rows}
        onEdit={(r) => {
          setEditing(r);
          setOpen(true);
        }}
        onDelete={handleDelete}
        onBulkDelete={(selected) => {
          const selectedIds = selected.map((player) => player.id);
          const next = rows.filter((row) => !selectedIds.includes(row.id));
          console.info("Excluindo jogadores selecionados no admin", {
            deletedIds: selectedIds,
            beforeIds: rows.map((player) => player.id),
            afterIds: next.map((player) => player.id),
          });
          void persist(next).catch((error) => {
            console.error("Erro ao excluir jogadores selecionados", {
              deletedIds: selectedIds,
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            });
            setError(error instanceof Error ? error.message : "Falha ao excluir jogadores");
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
          title={rows.find((x) => x.id === editing.id) ? "Editar jogador" : "Novo jogador"}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(editing);
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="col-span-1 sm:col-span-2">
              <Label>Nome</Label>
              <Input
                required
                className="mt-1"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Apelido</Label>
              <Input
                required
                className="mt-1"
                value={editing.nickname}
                onChange={(e) => setEditing({ ...editing, nickname: e.target.value })}
              />
            </div>
            <div>
              <Label>Número</Label>
              <Input
                required
                type="number"
                className="mt-1"
                placeholder="0"
                value={editing.number || ""}
                onChange={(e) => setEditing({ ...editing, number: e.target.value === "" ? 0 : +e.target.value })}
              />
            </div>
            <div>
              <Label>Posição</Label>
              <Select
                className="mt-1"
                value={editing.position}
                onChange={(e) =>
                  setEditing({ ...editing, position: e.target.value as Position })
                }
              >
                <option>Goleiro</option>
                <option>Defensor</option>
                <option>Meia</option>
                <option>Atacante</option>
              </Select>
            </div>
            <div>
              <Label>Pé preferido</Label>
              <Select
                className="mt-1"
                value={editing.preferredFoot}
                onChange={(e) =>
                  setEditing({ ...editing, preferredFoot: e.target.value as Player["preferredFoot"] })
                }
              >
                <option>Direito</option>
                <option>Esquerdo</option>
                <option>Ambos</option>
              </Select>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <Label>Foto</Label>
              <Input
                type="file"
                accept="image/*"
                className="mt-1"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  setError(null);
                  try {
                    const upload = await uploadAdminFile(file);
                    setEditing((prev) => prev ? { ...prev, photo: upload.url } : prev);
                  } catch (error) {
                    setError(error instanceof Error ? error.message : "Falha ao enviar foto. Verifique sua conexão e tente novamente.");
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              {uploading && <p className="text-xs text-brand-gray mt-1">Enviando foto...</p>}
              {editing.photo && !uploading && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editing.photo} alt="Preview" className="mt-2 h-24 w-auto rounded-sm object-cover" />
              )}
            </div>
            <div className="col-span-1 sm:col-span-2 flex flex-wrap justify-end gap-2">
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
