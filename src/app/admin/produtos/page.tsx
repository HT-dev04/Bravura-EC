"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { saveAdminCollection } from "@/lib/admin-client";
import { assetUrl } from "@/lib/asset-url";
import type { Product, ProductCategory } from "@/types";
import { formatCurrency, slugify } from "@/lib/utils";

export default function AdminProdutosPage() {
  const [rows, setRows] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/cms")
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
      images: [assetUrl("/products/placeholder.jpg")],
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
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl md:text-4xl uppercase">Produtos</h1>
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Preço</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  className="mt-1"
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: +e.target.value })}
                />
              </div>
              <div>
                <Label>Estoque</Label>
                <Input
                  required
                  type="number"
                  className="mt-1"
                  value={editing.stock}
                  onChange={(e) => setEditing({ ...editing, stock: +e.target.value })}
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
                className="mt-1"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setEditing({ ...editing, images: [URL.createObjectURL(f)] });
                }}
              />
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
