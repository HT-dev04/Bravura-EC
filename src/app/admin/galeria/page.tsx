"use client";

import Image from "next/image";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { gallery as initial } from "@/data/gallery";
import type { GalleryPhoto, GalleryAlbum } from "@/types";

// TODO: substituir por chamada à API quando o backend for integrado

export default function AdminGaleriaPage() {
  const [rows, setRows] = useState<GalleryPhoto[]>(initial);
  const [editing, setEditing] = useState<GalleryPhoto | null>(null);
  const [open, setOpen] = useState(false);

  function handleNew() {
    setEditing({
      id: `g${Date.now()}`,
      src: "/gallery/placeholder.jpg",
      album: "Jogos",
      season: "2025",
      caption: "",
    });
    setOpen(true);
  }

  function handleSave(g: GalleryPhoto) {
    setRows((prev) => {
      const exists = prev.find((x) => x.id === g.id);
      if (exists) return prev.map((x) => (x.id === g.id ? g : x));
      return [...prev, g];
    });
    setOpen(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (confirm("Excluir foto?")) setRows((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl md:text-4xl uppercase">Galeria</h1>
        <Button variant="primary" onClick={handleNew}>
          <Plus className="w-4 h-4" /> Nova foto
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {rows.map((g) => (
          <div
            key={g.id}
            className="relative group bg-brand-black-2 border border-brand-border rounded-sm overflow-hidden"
          >
            <div className="relative aspect-square">
              <Image src={g.src} alt={g.caption} fill sizes="300px" className="object-cover" />
            </div>
            <div className="p-2 text-xs">
              <p className="truncate">{g.caption}</p>
              <p className="text-brand-gray">{g.album} · {g.season}</p>
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
              <button
                onClick={() => {
                  setEditing(g);
                  setOpen(true);
                }}
                className="text-xs uppercase text-brand-gold bg-brand-black-2 px-3 py-1 rounded-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(g.id)}
                className="bg-brand-red text-white p-2 rounded-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Dialog
          open={open}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          title="Editar foto"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(editing);
            }}
            className="space-y-4"
          >
            <div>
              <Label>Arquivo</Label>
              <Input
                type="file"
                className="mt-1"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setEditing({ ...editing, src: URL.createObjectURL(f) });
                }}
              />
            </div>
            <div>
              <Label>Legenda</Label>
              <Input
                value={editing.caption}
                className="mt-1"
                onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Álbum</Label>
                <Select
                  className="mt-1"
                  value={editing.album}
                  onChange={(e) => setEditing({ ...editing, album: e.target.value as GalleryAlbum })}
                >
                  <option>Jogos</option>
                  <option>Elenco</option>
                  <option>Bastidores</option>
                  <option>Treinos</option>
                  <option>Artes</option>
                </Select>
              </div>
              <div>
                <Label>Temporada</Label>
                <Input
                  className="mt-1"
                  value={editing.season}
                  onChange={(e) => setEditing({ ...editing, season: e.target.value })}
                />
              </div>
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
