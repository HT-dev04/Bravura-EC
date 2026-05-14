"use client";

import { useRef, useState } from "react";
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

export function RankingShareModal({ title, subtitle, items, shareUrl, siteLabel }: RankingShareModalProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [frameVariant, setFrameVariant] = useState<1 | 2>(1);
  const cardRef = useRef<HTMLDivElement>(null);

  function openShareModal() {
    setFrameVariant(Math.random() < 0.5 ? 1 : 2);
    setOpen(true);
  }

  async function createImageFile() {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, {
      cacheBust: true,
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
            <div className="mx-auto aspect-[9/16] max-h-[70vh] max-w-sm overflow-hidden rounded-sm bg-brand-black">
              <div className="origin-top-left scale-[0.333]">
                <RankingShareCard ref={cardRef} title={title} subtitle={subtitle} items={items} siteLabel={siteLabel} frameVariant={frameVariant} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-brand-gray">
              Arte vertical em 1080x1920 pronta para Story. Baixe ou compartilhe direto pelo celular quando disponível.
            </p>
            <button
              type="button"
              onClick={handleDownload}
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-brand-red px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              Baixar imagem
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={busy}
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
