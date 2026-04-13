"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { news as initial } from "@/data/news";
import type { NewsItem } from "@/types";
import { formatDate, slugify } from "@/lib/utils";

// TODO: substituir por chamada à API quando o backend for integrado

export default function AdminNoticiasPage() {
  const [rows, setRows] = useState<NewsItem[]>(initial);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [open, setOpen] = useState(false);

  function handleNew() {
    setEditing({
      id: `n${Date.now()}`,
      slug: "",
      title: "",
      excerpt: "",
      category: "Jogos",
      author: "Redação Bravura",
      publishedAt: new Date().toISOString(),
      cover: "/gallery/artes-01.jpg",
      content: "",
    });
    setOpen(true);
  }

  function handleSave(n: NewsItem) {
    n.slug = n.slug || slugify(n.title);
    setRows((prev) => {
      const exists = prev.find((x) => x.id === n.id);
      if (exists) return prev.map((x) => (x.id === n.id ? n : x));
      return [...prev, n];
    });
    setOpen(false);
    setEditing(null);
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl md:text-4xl uppercase">Notícias</h1>
        <Button variant="primary" onClick={handleNew}>
          <Plus className="w-4 h-4" /> Nova
        </Button>
      </div>

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
          if (confirm("Excluir notícia?")) setRows((prev) => prev.filter((x) => x.id !== r.id));
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
              handleSave(editing);
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
            <div className="grid grid-cols-2 gap-4">
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
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setEditing({ ...editing, cover: URL.createObjectURL(f) });
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
              <Button type="submit" variant="primary">Salvar</Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
