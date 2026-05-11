"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { saveAdminCollection } from "@/lib/admin-client";
import { assetUrl } from "@/lib/asset-url";
import type { Sponsor } from "@/types";

export default function AdminPatrocinadoresPage() {
  const [rows, setRows] = useState<Sponsor[]>([]);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/cms")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.sponsors && setRows(data.sponsors));
  }, []);

  async function persist(next: Sponsor[]) {
    setMessage(null);
    const data = await saveAdminCollection("sponsors", next);
    setRows(data.sponsors);
    return data.sponsors;
  }

  function handleNew() {
    setEditing({ id: `s${Date.now()}`, name: "", logo: assetUrl("/sponsors/placeholder.svg"), tier: "Bronze", website: "" });
    setOpen(true);
  }

  async function handleSave(s: Sponsor) {
    const exists = rows.find((x) => x.id === s.id);
    const next = exists ? rows.map((x) => (x.id === s.id ? s : x)) : [...rows, s];
    try {
      await persist(next);
      setOpen(false);
      setEditing(null);
    } catch (error) {
      console.error("Erro ao salvar patrocinador", error);
      setMessage(error instanceof Error ? error.message : "Falha ao salvar patrocinador");
    }
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl md:text-4xl uppercase">Patrocinadores</h1>
        <Button variant="primary" onClick={handleNew}>
          <Plus className="w-4 h-4" /> Novo
        </Button>
      </div>

      {message && <p className="mb-4 text-sm text-brand-red">{message}</p>}

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
          void persist(rows.filter((x) => x.id !== r.id)).catch((error) => {
            console.error("Erro ao excluir patrocinador", error);
            setMessage(error instanceof Error ? error.message : "Falha ao excluir patrocinador");
          });
        }}
        onBulkDelete={(selected) => {
          void persist(rows.filter((row) => !selected.some((item) => item.id === row.id))).catch((error) => {
            console.error("Erro ao excluir patrocinadores", error);
            setMessage(error instanceof Error ? error.message : "Falha ao excluir patrocinadores");
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
          title="Editar patrocinador"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave(editing);
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
