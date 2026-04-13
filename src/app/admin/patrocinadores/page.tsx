"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { sponsors as initial } from "@/data/sponsors";
import type { Sponsor } from "@/types";

// TODO: substituir por chamada à API quando o backend for integrado

export default function AdminPatrocinadoresPage() {
  const [rows, setRows] = useState<Sponsor[]>(initial);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [open, setOpen] = useState(false);

  function handleNew() {
    setEditing({ id: `s${Date.now()}`, name: "", logo: "/sponsors/placeholder.svg", tier: "Bronze", website: "" });
    setOpen(true);
  }

  function handleSave(s: Sponsor) {
    setRows((prev) => {
      const exists = prev.find((x) => x.id === s.id);
      if (exists) return prev.map((x) => (x.id === s.id ? s : x));
      return [...prev, s];
    });
    setOpen(false);
    setEditing(null);
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl md:text-4xl uppercase">Patrocinadores</h1>
        <Button variant="primary" onClick={handleNew}>
          <Plus className="w-4 h-4" /> Novo
        </Button>
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Nome" },
          { key: "tier", label: "Plano" },
          { key: "website", label: "Site" },
        ]}
        rows={rows}
        onEdit={(r) => {
          setEditing(r);
          setOpen(true);
        }}
        onDelete={(r) => {
          if (confirm("Excluir?")) setRows((prev) => prev.filter((x) => x.id !== r.id));
        }}
      />

      {editing && (
        <Dialog
          open={open}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          title="Editar patrocinador"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(editing);
            }}
            className="space-y-4"
          >
            <div>
              <Label>Nome</Label>
              <Input
                required
                className="mt-1"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Plano</Label>
              <Select
                className="mt-1"
                value={editing.tier}
                onChange={(e) => setEditing({ ...editing, tier: e.target.value as Sponsor["tier"] })}
              >
                <option>Bronze</option>
                <option>Prata</option>
                <option>Ouro</option>
              </Select>
            </div>
            <div>
              <Label>Site</Label>
              <Input
                className="mt-1"
                value={editing.website || ""}
                onChange={(e) => setEditing({ ...editing, website: e.target.value })}
              />
            </div>
            <div>
              <Label>Logo</Label>
              <Input
                type="file"
                className="mt-1"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setEditing({ ...editing, logo: URL.createObjectURL(f) });
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
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
