"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { saveAdminCollection, uploadAdminFile } from "@/lib/admin-client";
import type { Product, ProductCategory } from "@/types";
import { formatCurrency, slugify } from "@/lib/utils";

export default function AdminProdutosPage() {
  const [rows, setRows] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/cms", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.products && setRows(data.products));
  }, []);

  async function persist(next: Product[]) {
    const data = await saveAdminCollection("products", next);
    setRows(data.products);
  }

  function handleNew() {
    setEditing({
      id: `pr${Date.now()}`,
      slug: "",
      name: "",
      category: "uniformes-jogo",
      price: 0,
      images: [],
      description: "",
      sizes: ["P", "M", "G", "GG"],
      stock: 0,
      featured: false,
      isNew: true,
      bestseller: false,
    });
    setOpen(true);
  }

  async function handleSave(p: Product) {
    const product = { ...p, slug: p.slug || slugify(p.name) };
    const exists = rows.find((x) => x.id === p.id);
    const next = exists ? rows.map((x) => (x.id === p.id ? product : x)) : [...rows, product];
    await persist(next);
    setOpen(false);
    setEditing(null);
  }

  return (
    <div className="p-4 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl md:text-4xl uppercase">Produtos</h1>
        <Button variant="primary" onClick={handleNew}>
          <Plus className="w-4 h-4" /> Novo
        </Button>
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Nome" },
          { key: "category", label: "Categoria" },
          { key: "price", label: "Preço", render: (r) => formatCurrency(r.price) },
          { key: "stock", label: "Estoque" },
        ]}
        rows={rows}
        onEdit={(r) => {
          setEditing(r);
          setOpen(true);
        }}
        onDelete={(r) => {
          void persist(rows.filter((x) => x.id !== r.id));
        }}
        onBulkDelete={(selected) => {
          void persist(rows.filter((row) => !selected.some((item) => item.id === row.id)));
        }}
      />

      {editing && (
        <Dialog
          open={open}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          title="Editar produto"
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Preço</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  className="mt-1"
                  placeholder="0"
                  value={editing.price || ""}
                  onChange={(e) => setEditing({ ...editing, price: e.target.value === "" ? 0 : +e.target.value })}
                />
              </div>
              <div>
                <Label>Estoque</Label>
                <Input
                  required
                  type="number"
                  className="mt-1"
                  placeholder="0"
                  value={editing.stock || ""}
                  onChange={(e) => setEditing({ ...editing, stock: e.target.value === "" ? 0 : +e.target.value })}
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select
                  className="mt-1"
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value as ProductCategory })
                  }
                >
                  <option value="uniformes-jogo">Uniformes de jogo</option>
                  <option value="treino">Treino</option>
                  <option value="acessorios">Acessórios</option>
                  <option value="promocoes">Promoções</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                className="mt-1"
                rows={3}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Imagem principal</Label>
              <Input
                type="file"
                accept="image/*"
                className="mt-1"
                disabled={uploading}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setUploading(true);
                  setUploadError(null);
                  try {
                    const upload = await uploadAdminFile(f);
                    setEditing((prev) => prev ? { ...prev, images: [upload.url] } : prev);
                  } catch {
                    setUploadError("Falha ao enviar imagem. Verifique sua conexão e tente novamente.");
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              {uploading && <p className="text-xs text-brand-gray mt-1">Enviando imagem...</p>}
              {uploadError && <p className="text-xs text-brand-red mt-1">{uploadError}</p>}
              {editing.images[0] && !uploading && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editing.images[0]} alt="Preview" className="mt-2 h-24 w-auto rounded-sm object-cover" />
              )}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.featured}
                  onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                />
                Destaque
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.isNew}
                  onChange={(e) => setEditing({ ...editing, isNew: e.target.checked })}
                />
                Lançamento
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.bestseller}
                  onChange={(e) => setEditing({ ...editing, bestseller: e.target.checked })}
                />
                Mais vendido
              </label>
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
