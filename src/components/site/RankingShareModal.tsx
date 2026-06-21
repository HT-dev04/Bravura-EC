"use client";

import { useCallback, useRef, useState } from "react";
import { Copy, Download, Share2 } from "lucide-react";
import { toPng } from "html-to-image";
import { Dialog } from "@/components/ui/dialog";
import { RankingShareCard, type RankingShareItem } from "@/components/site/RankingShareCard";

type RankingShareModalProps = {
  title: string;
  subtitle: string;
  items: RankingShareItem[];
  shareUrl: string;
  siteLabel: string;
};

const FRAME_SRC: Record<1 | 2, string> = {
  1: "/moldura-ranking2.png",
  2: "/moldura-ranking3.png",
};

// Converte qualquer imagem (moldura local ou foto remota do Supabase) em data URL.
// Fotos cross-origin passam pelo proxy same-origin para evitar problemas de CORS.
// Assim o html-to-image embute tudo no PNG sem depender de fetch externo na captura.
async function toDataUrl(src: string): Promise<string | null> {
  if (src.startsWith("data:")) return src;

  let fetchUrl = src;
  if (/^https?:\/\//i.test(src)) {
    try {
      if (new URL(src).origin !== window.location.origin) {
        fetchUrl = `/api/image-proxy?url=${encodeURIComponent(src)}`;
      }
    } catch {
      return null;
    }
  }

  try {
    const response = await fetch(fetchUrl, { cache: "no-store" });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export function RankingShareModal({ title, subtitle, items, shareUrl, siteLabel }: RankingShareModalProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [frameVariant, setFrameVariant] = useState<1 | 2>(1);
  const [frameSrc, setFrameSrc] = useState<string | null>(null);
  const [preparedItems, setPreparedItems] = useState<RankingShareItem[] | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const prepareAssets = useCallback(
    async (variant: 1 | 2) => {
      setPreparing(true);
      setFrameSrc(null);
      setPreparedItems(null);
      try {
        const [frame, resolvedItems] = await Promise.all([
          toDataUrl(FRAME_SRC[variant]),
          Promise.all(
            items.map(async (item) => {
              if (!item.photo) return item;
              const photo = await toDataUrl(item.photo);
              // Sem a foto embutida, deixa o fallback (inicial) aparecer no lugar do círculo vazio.
              return { ...item, photo: photo ?? undefined };
            })
          ),
        ]);
        setFrameSrc(frame ?? FRAME_SRC[variant]);
        setPreparedItems(resolvedItems);
      } finally {
        setPreparing(false);
      }
    },
    [items]
  );

  function openShareModal() {
    const variant: 1 | 2 = Math.random() < 0.5 ? 1 : 2;
    setMessage(null);
    setFrameVariant(variant);
    setOpen(true);
    void prepareAssets(variant);
  }

  const ready = !preparing && Boolean(frameSrc) && Boolean(preparedItems);

  async function createImageFile() {
    if (!cardRef.current || !ready) return null;
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 1,
      width: 1080,
      height: 1920,
      canvasWidth: 1080,
      canvasHeight: 1920,
      backgroundColor: "#0a0a0a",
    });
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], `${slugify(title)}-bravura.png`, { type: "image/png" });
  }

  async function handleDownload() {
    setMessage(null);
    setBusy(true);
    try {
      const file = await createImageFile();
      if (!file) throw new Error("Imagem indisponível");
      const objectUrl = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(objectUrl);
      setMessage("Imagem baixada em PNG.");
    } catch {
      setMessage("Não foi possível baixar a imagem.");
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    setMessage(null);
    setBusy(true);
    try {
      const text = `${title} - ${subtitle}\nVeja o ranking completo no site oficial do Bravura.`;
      const file = await createImageFile();
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title, text, files: [file] });
        return;
      }

      if (navigator.share) {
        await navigator.share({ title, text, url: shareUrl });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setMessage("Link do ranking copiado.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Não foi possível compartilhar agora.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCopyLink() {
    setMessage(null);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setMessage("Link do ranking copiado.");
    } catch {
      setMessage("Não foi possível copiar o link.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openShareModal}
        className="inline-flex items-center gap-2 rounded-sm border border-brand-gold/50 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-brand-gold transition-colors hover:border-brand-gold hover:bg-brand-gold hover:text-brand-black"
      >
        <Share2 className="h-4 w-4" />
        Compartilhar ranking
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Compartilhar ranking" className="max-w-4xl">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="overflow-hidden rounded-sm border border-brand-border bg-brand-black p-3">
            <div className="relative mx-auto aspect-[9/16] max-h-[70vh] max-w-sm overflow-hidden rounded-sm bg-brand-black">
              {ready && frameSrc && preparedItems ? (
                <div className="origin-top-left scale-[0.333]">
                  <RankingShareCard
                    ref={cardRef}
                    title={title}
                    subtitle={subtitle}
                    items={preparedItems}
                    siteLabel={siteLabel}
                    frameVariant={frameVariant}
                    frameSrc={frameSrc}
                  />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-center text-xs font-semibold uppercase tracking-wider text-brand-gray">
                  Gerando arte…
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-brand-gray">
              Arte vertical em 1080x1920 pronta para Story. Baixe ou compartilhe direto pelo celular quando disponível.
            </p>
            <button
              type="button"
              onClick={handleDownload}
              disabled={busy || !ready}
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-brand-red px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {preparing ? "Gerando…" : "Baixar imagem"}
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={busy || !ready}
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-brand-gold px-4 py-3 text-sm font-semibold uppercase tracking-wide text-brand-black transition-colors hover:bg-brand-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-brand-border px-4 py-3 text-sm font-semibold uppercase tracking-wide text-brand-white transition-colors hover:border-brand-gold hover:text-brand-gold"
            >
              <Copy className="h-4 w-4" />
              Copiar link
            </button>
            {message && <p role="status" className="text-sm font-semibold text-brand-gold">{message}</p>}
          </div>
        </div>
      </Dialog>
    </>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}
