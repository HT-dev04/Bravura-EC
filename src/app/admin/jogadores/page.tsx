"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { players as initialPlayers } from "@/data/players";
import type { Player, Position } from "@/types";

// TODO: substituir por chamada à API quando o backend for integrado

export default function AdminJogadoresPage() {
  const [rows, setRows] = useState<Player[]>(initialPlayers);
  const [editing, setEditing] = useState<Player | null>(null);
  const [open, setOpen] = useState(false);

  function handleNew() {
    setEditing({
      id: `p${Date.now()}`,
      slug: "",
      name: "",
      nickname: "",
      number: 0,
      position: "Atacante",
      birthDate: "2000-01-01",
      height: 175,
      weight: 70,
      preferredFoot: "Direito",
      photo: "/players/placeholder.jpg",
      bio: "",
      season: "2025",
      stats: { games: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutes: 0 },
      history: [],
      monthlyGoals: [],
    });
    setOpen(true);
  }

  function handleSave(p: Player) {
    setRows((prev) => {
      const exists = prev.find((x) => x.id === p.id);
      if (exists) return prev.map((x) => (x.id === p.id ? p : x));
      return [...prev, p];
    });
    setOpen(false);
    setEditing(null);
  }

  function handleDelete(p: Player) {
    if (confirm(`Excluir ${p.name}?`)) {
      setRows((prev) => prev.filter((x) => x.id !== p.id));
    }
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl md:text-4xl uppercase">Jogadores</h1>
        <Button variant="primary" onClick={handleNew}>
          <Plus className="w-4 h-4" /> Novo
        </Button>
      </div>

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
            className="grid grid-cols-2 gap-4"
          >
            <div className="col-span-2">
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
                value={editing.number}
                onChange={(e) => setEditing({ ...editing, number: +e.target.value })}
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
            <div className="col-span-2">
              <Label>Foto</Label>
              <Input
                type="file"
                className="mt-1"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setEditing({ ...editing, photo: url });
                  }
                }}
              />
            </div>
            <div className="col-span-2 flex justify-end gap-2">
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
              <Button type="submit" variant="primary">Salvar</Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
