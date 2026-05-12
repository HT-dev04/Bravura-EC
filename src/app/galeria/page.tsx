"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Lightbox } from "@/components/site/Lightbox";
import { Select } from "@/components/ui/input";
import type { GalleryAlbum, GalleryPhoto } from "@/types";
import { getValidImageSrc } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

const albums: Array<GalleryAlbum | "Todos"> = ["Todos", "Jogos", "Elenco", "Bastidores", "Treinos", "Artes"];

export default function GaleriaPage() {
  const [items, setItems] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [album, setAlbum] = useState<GalleryAlbum | "Todos">("Todos");
  const [season, setSeason] = useState("todas");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/cms", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data?.gallery) ? data.gallery : []))
      .finally(() => setLoading(false));
  }, []);

  const seasons = Array.from(new Set(items.map((g) => g.season)));

  const filtered = useMemo(() => {
    return items.filter((g) => {
      const albumOk = album === "Todos" || g.album === album;
      const seasonOk = season === "todas" || g.season === season;
      return albumOk && seasonOk;
    });
  }, [items, album, season]);

  return (
    <SiteShell>
      <section className="diag-section py-14">
        <div className="container-x">
          <p className="text-brand-gold uppercase tracking-[0.3em] text-[10px] font-semibold mb-2">
            Galeria
          </p>
          <h1 className="break-words font-display text-4xl md:text-6xl uppercase">Momentos em imagens</h1>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2 flex-1">
            {albums.map((a) => (
              <button
                key={a}
                onClick={() => setAlbum(a)}
                className={cn(
                  "px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm border",
                  album === a
                    ? "bg-brand-red border-brand-red"
                    : "border-brand-border text-brand-white/80 hover:border-brand-red"
                )}
              >
                {a}
              </button>
            ))}
          </div>
          <div className="w-full md:w-48">
            <Select value={season} onChange={(e) => setSeason(e.target.value)}>
              <option value="todas">Todas temporadas</option>
              {seasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
        </div>

        {loading ? (
          <p className="text-brand-gray text-center py-14">Carregando galeria...</p>
        ) : filtered.length === 0 ? (
          <p className="text-brand-gray text-center py-14">Nenhuma mídia cadastrada.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((g, i) => {
              const mediaSrc = getValidImageSrc(g.src);
              const isVideo = g.mediaType === "video";
              if (!mediaSrc && !isVideo) return null;
              return (
                <button
                  key={g.id}
                  onClick={() => setOpenIdx(i)}
                  className="relative aspect-square bg-brand-black rounded-sm overflow-hidden group"
                >
                  {isVideo ? (
                    <video src={g.src} className="w-full h-full object-cover" controls />
                  ) : (
                    <Image src={mediaSrc!} alt={g.caption} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="absolute bottom-2 left-3 right-3 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {g.caption}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {openIdx !== null && filtered[openIdx]?.mediaType !== "video" && (
        <Lightbox
          images={filtered.map((g) => ({ src: g.src, caption: g.caption }))}
          index={openIdx}
          onClose={() => setOpenIdx(null)}
          onPrev={() => setOpenIdx((i) => (i! - 1 + filtered.length) % filtered.length)}
          onNext={() => setOpenIdx((i) => (i! + 1) % filtered.length)}
        />
      )}
    </SiteShell>
  );
}
