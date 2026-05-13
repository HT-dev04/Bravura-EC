"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { saveAdminCollection, uploadAdminFile } from "@/lib/admin-client";
import { createAdminId } from "@/lib/admin-id";
import type { Sponsor } from "@/types";

export default function AdminPatrocinadoresPage() {
  const [rows, setRows] = useState<Sponsor[]>([]);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/cms", { cache: "no-store", credentials: "same-origin" })
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
    setEditing({ id: createAdminId("s"), name: "", logo: "", tier: "Bronze", website: "" });
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
    <div className="p-4 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl md:text-4xl uppercase">Patrocinadores</h1>
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
                accept="image/*"
                className="mt-1"
                disabled={uploading}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setUploading(true);
                  setMessage(null);
                  try {
                    const upload = await uploadAdminFile(f);
                    setEditing((prev) => prev ? { ...prev, logo: upload.url } : prev);
                  } catch {
                    setMessage("Falha ao enviar logo. Verifique sua conexão e tente novamente.");
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              {uploading && <p className="text-xs text-brand-gray mt-1">Enviando logo...</p>}
              {editing.logo && !uploading && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editing.logo} alt="Preview" className="mt-2 h-16 w-auto object-contain" />
              )}
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
              <Button type="submit" variant="primary" disabled={uploading}>Salvar</Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
