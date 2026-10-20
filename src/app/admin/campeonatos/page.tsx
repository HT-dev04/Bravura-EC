"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { ChampionshipCard } from "@/components/site/ChampionshipCard";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { deleteAdminChampionship, fetchAdminChampionships, saveAdminChampionship } from "@/lib/admin-client";
import { createAdminId } from "@/lib/admin-id";
import type { Championship, ChampionshipStatus } from "@/types";

function newChampionship(): Championship {
  return {
    id: createAdminId("c"),
    slug: "",
    name: "",
    season: String(new Date().getFullYear()),
    logo: "",
    cover: "",
    description: "",
    status: "em_andamento",
    startDate: "",
    endDate: "",
    finalPosition: "",
    players: [],
    matches: [],
  };
}

export default function AdminCampeonatosPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<Championship | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminChampionships()
      .then(setRows)
      .catch((error) => setError(error instanceof Error ? error.message : "Falha ao carregar campeonatos"))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(championship: Championship) {
    setSaving(true);
    setError(null);
    try {
      const saved = await saveAdminChampionship(championship);
      router.push(`/admin/campeonatos/${saved.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Falha ao criar campeonato");
      setSaving(false);
    }
  }

  async function handleDelete(championship: Championship) {
    if (!window.confirm(`Excluir "${championship.name}"? Elenco, partidas e estatísticas desse campeonato serão apagados.`)) return;
    setError(null);
    try {
      setRows(await deleteAdminChampionship(championship.id));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Falha ao excluir campeonato");
    }
  }

  return (
    <div className="p-4 md:p-10">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl uppercase md:text-4xl">Campeonatos</h1>
        <Button variant="primary" onClick={() => setCreating(newChampionship())}>
          <Plus className="h-4 w-4" /> Novo campeonato
        </Button>
      </div>
      <p className="mb-6 max-w-2xl text-sm text-brand-gray">
        Cada campeonato tem elenco, números e estatísticas próprios. Nada lançado aqui altera os jogadores, partidas ou estatísticas dos amistosos.
      </p>

      {error && <p className="mb-4 text-sm text-brand-red">{error}</p>}

      {loading ? (
        <p className="py-14 text-center text-brand-gray">Carregando campeonatos...</p>
      ) : rows.length === 0 ? (
        <p className="rounded-sm border border-dashed border-brand-border p-8 text-center text-sm text-brand-gray">
          Nenhum campeonato criado ainda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((championship) => (
            <div key={championship.id} className="relative">
              <ChampionshipCard championship={championship} href={`/admin/campeonatos/${championship.id}`} />
              <button
                type="button"
                onClick={() => handleDelete(championship)}
                className="absolute right-2 top-2 rounded-sm bg-black/70 p-2 text-brand-red hover:bg-black"
                aria-label={`Excluir ${championship.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <Dialog open onClose={() => setCreating(null)} title="Novo campeonato">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate(creating);
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <Label>Nome do campeonato</Label>
              <Input
                required
                autoFocus
                className="mt-1"
                placeholder="Ex: Copa Regional de Bugre"
                value={creating.name}
                onChange={(e) => setCreating({ ...creating, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Temporada</Label>
              <Input
                required
                className="mt-1"
                value={creating.season}
                onChange={(e) => setCreating({ ...creating, season: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                className="mt-1"
                value={creating.status}
                onChange={(e) => setCreating({ ...creating, status: e.target.value as ChampionshipStatus })}
              >
                <option value="planejado">Em breve</option>
                <option value="em_andamento">Em andamento</option>
                <option value="encerrado">Encerrado</option>
              </Select>
            </div>
            <p className="text-xs text-brand-gray sm:col-span-2">
              Depois de criar, você cadastra o elenco do campeonato, as partidas e os detalhes (logo, capa, colocação).
            </p>
            <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setCreating(null)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Criando..." : "Criar e abrir"}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
