"use client";

import Image from "next/image";
import { getValidImageSrc } from "@/lib/image-utils";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { saveAdminCollection, uploadAdminFile } from "@/lib/admin-client";
import type { GalleryPhoto, GalleryAlbum } from "@/types";

function makeUniqueGalleryRows(items: GalleryPhoto[]) {
  const seen = new Set<string>();
  return items.map((item) => {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      return item;
    }

    const unique = { ...item, id: `${item.id}-${Date.now()}-${seen.size}` };
    seen.add(unique.id);
    return unique;
  });
}

export default function AdminGaleriaPage() {
  const [rows, setRows] = useState<GalleryPhoto[]>([]);
  const [editing, setEditing] = useState<GalleryPhoto | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/cms", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const gallery = data?.data?.gallery || data?.gallery;
        if (gallery) setRows(makeUniqueGalleryRows(gallery));
      })
      .catch((error) => {
        console.error("Erro ao carregar galeria", error);
        setMessage("Não foi possível carregar os dados salvos da galeria.");
      });
  }, []);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  function clearLocalPreview() {
    setLocalPreview(null);
  }

  function handleNew() {
    clearLocalPreview();
    setEditing({
      id: `g${Date.now()}`,
      src: "",
      mediaType: "image",
      album: "Jogos",
      season: "2026",
      caption: "",
    });
    setOpen(true);
  }

  async function persist(next: GalleryPhoto[]) {
    const previous = rows;
    const safeNext = makeUniqueGalleryRows(next).filter((item) => item.id && item.src && item.album && item.season);

    try {
      const data = await saveAdminCollection("gallery", safeNext);
      setRows(makeUniqueGalleryRows(data.gallery));
      setMessage("Galeria salva com sucesso.");
      return true;
    } catch (error) {
      setRows(previous);
      setMessage("Não foi possível salvar a galeria. Tente novamente.");
      console.error("Erro ao persistir galeria", error);
      return false;
    }
  }

  async function handleSave(g: GalleryPhoto) {
    setSaving(true);
    try {
      const exists = rows.find((x) => x.id === g.id);
      const next = exists ? rows.map((x) => (x.id === g.id ? g : x)) : [...rows, g];
      if (await persist(next)) {
        clearLocalPreview();
        setOpen(false);
        setEditing(null);
      }
    } finally {
      setSaving(false);
    }
  }

  async function upsertGalleryItem(item: GalleryPhoto) {
    const exists = rows.some((row) => row.id === item.id);
    const next = exists ? rows.map((row) => (row.id === item.id ? item : row)) : [...rows, item];
    return persist(next);
  }

  async function handleDelete(id: string) {
    const next = rows.filter((x) => x.id !== id);
    if (next.length === rows.length) {
      setMessage("Mídia não encontrada para exclusão.");
      return;
    }

    await persist(next);
  }

  return (
    <div className="p-4 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl md:text-4xl uppercase">Galeria</h1>
        <Button variant="primary" onClick={handleNew}>
          <Plus className="w-4 h-4" /> Nova mídia
        </Button>
      </div>

      {message && <p className="mb-4 text-sm text-brand-gray">{message}</p>}

      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {rows.map((g) => (
          <div
            key={g.id}
            className="relative group bg-brand-black-2 border border-brand-border rounded-sm overflow-hidden"
          >
            <div className="relative aspect-square">
              {g.mediaType === "video" ? (
                <video src={g.src} className="w-full h-full object-cover" muted />
              ) : getValidImageSrc(g.src) ? (
                <Image src={getValidImageSrc(g.src)!} alt={g.caption} fill sizes="300px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-brand-gray">Sem imagem</div>
              )}
            </div>
            <div className="p-2 text-xs">
              <p className="truncate">{g.caption}</p>
              <p className="text-brand-gray">{g.album} · {g.season}</p>
            </div>
            {/* Ações visíveis no mobile (touch não tem hover) */}
            <div className="sm:hidden flex border-t border-brand-border">
              <button
                onClick={() => { setEditing(g); setOpen(true); }}
                className="flex-1 py-2 text-xs uppercase text-brand-gold font-semibold hover:bg-white/5"
              >
                Editar
              </button>
              <div className="w-px bg-brand-border" />
              <button
                onClick={() => handleDelete(g.id)}
                className="flex-1 py-2 text-xs uppercase text-brand-red font-semibold hover:bg-white/5"
              >
                Excluir
              </button>
            </div>
            {/* Ações em overlay no desktop (hover) */}
            <div className="hidden sm:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 items-center justify-center gap-2 transition-opacity">
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
            clearLocalPreview();
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
              <Label>Arquivo de foto ou vídeo</Label>
              <Input
                type="file"
                accept="image/*,video/*"
                className="mt-1"
                disabled={uploading}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  clearLocalPreview();
                  const preview = URL.createObjectURL(f);
                  setLocalPreview(preview);
                  setEditing((prev) => prev ? { ...prev, mediaType: f.type.startsWith("video/") ? "video" : "image" } : prev);
                  setUploading(true);
                  setMessage(null);
                  try {
                    const upload = await uploadAdminFile(f);
                    const nextEditing = {
                      ...editing,
                      src: upload.url,
                      mediaType: upload.type,
                      caption: editing.caption || f.name.replace(/\.[^.]+$/, ""),
                    };
                    setEditing(nextEditing);
                    await upsertGalleryItem(nextEditing);
                    setMessage("Upload concluído. A mídia já está disponível na galeria do site e no admin.");
                  } catch (error) {
                    setMessage(error instanceof Error ? error.message : "Falha ao enviar arquivo. Verifique sua conexão e tente novamente.");
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              {uploading && <p className="text-xs text-brand-gray mt-1">Enviando arquivo...</p>}
              {(localPreview || editing.src) && editing.mediaType === "video" && (
                <video src={localPreview || editing.src} className="mt-2 h-24 max-w-full w-auto rounded-sm object-cover" muted controls />
              )}
              {(localPreview || editing.src) && editing.mediaType !== "video" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={localPreview || editing.src} alt="Preview" className="mt-2 h-24 max-w-full w-auto rounded-sm object-cover" />
              )}
            </div>
            <div>
              <Label>Legenda</Label>
              <Input
                value={editing.caption}
                className="mt-1"
                onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  clearLocalPreview();
                  setOpen(false);
                  setEditing(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={saving || uploading}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
