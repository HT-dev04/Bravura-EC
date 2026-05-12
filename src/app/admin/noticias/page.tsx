"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import type { NewsItem } from "@/types";
import { saveAdminCollection, uploadAdminFile } from "@/lib/admin-client";
import { assetUrl } from "@/lib/asset-url";
import { formatDate, slugify } from "@/lib/utils";

export default function AdminNoticiasPage() {
  const [rows, setRows] = useState<NewsItem[]>([]);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/cms", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.news && setRows(data.news));
  }, []);

  function handleNew() {
    setEditing({
      id: `n${Date.now()}`,
      slug: "",
      title: "",
      excerpt: "",
      category: "Jogos",
      author: "Redação Bravura",
      publishedAt: new Date().toISOString(),
      cover: assetUrl("/gallery/artes-01.jpg"),
      content: "",
    });
    setOpen(true);
  }

  async function persist(next: NewsItem[]) {
    setMessage(null);
    const data = await saveAdminCollection("news", next);
    setRows(data.news);
    return data.news;
  }

  async function handleSave(n: NewsItem) {
    setSaving(true);
    const item = { ...n, slug: n.slug || slugify(n.title) };
    const exists = rows.find((x) => x.id === n.id);
    const next = exists ? rows.map((x) => (x.id === n.id ? item : x)) : [...rows, item];
    try {
      await persist(next);
      setOpen(false);
      setEditing(null);
    } catch (error) {
      console.error("Erro ao salvar notícia", error);
      setMessage(error instanceof Error ? error.message : "Falha ao salvar notícia");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl md:text-4xl uppercase">Notícias</h1>
        <Button variant="primary" onClick={handleNew}>
          <Plus className="w-4 h-4" /> Nova
        </Button>
      </div>

      {message && <p className="mb-4 text-sm text-brand-red">{message}</p>}

      <DataTable
        columns={[
          { key: "title", label: "Título" },
          { key: "category", label: "Categoria" },
          { key: "author", label: "Autor" },
          { key: "date", label: "Data", render: (r) => formatDate(r.publishedAt) },
        ]}
        rows={rows}
        onEdit={(r) => {
          setEditing(r);
          setOpen(true);
        }}
        onDelete={(r) => {
          void persist(rows.filter((x) => x.id !== r.id)).catch((error) => {
            console.error("Erro ao excluir notícia", error);
            setMessage(error instanceof Error ? error.message : "Falha ao excluir notícia");
          });
        }}
        onBulkDelete={(selected) => {
          void persist(rows.filter((row) => !selected.some((item) => item.id === row.id))).catch((error) => {
            console.error("Erro ao excluir notícias", error);
            setMessage(error instanceof Error ? error.message : "Falha ao excluir notícias");
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
          title="Editar notícia"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave(editing);
            }}
            className="space-y-4"
          >
            <div>
              <Label>Título</Label>
              <Input
                required
                value={editing.title}
                className="mt-1"
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Categoria</Label>
                <Select
                  className="mt-1"
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value as NewsItem["category"] })
                  }
                >
                  <option>Jogos</option>
                  <option>Bastidores</option>
                  <option>Mercado</option>
                </Select>
              </div>
              <div>
                <Label>Autor</Label>
                <Input
                  className="mt-1"
                  value={editing.author}
                  onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Capa</Label>
              <Input
                type="file"
                className="mt-1"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const upload = await uploadAdminFile(f);
                    setEditing({ ...editing, cover: upload.url });
                  }
                }}
              />
            </div>
            <div>
              <Label>Resumo</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={editing.excerpt}
                onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
              />
            </div>
            <div>
              <Label>Conteúdo</Label>
              <Textarea
                className="mt-1"
                rows={6}
                value={editing.content}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
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
              <Button type="submit" variant="primary" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
