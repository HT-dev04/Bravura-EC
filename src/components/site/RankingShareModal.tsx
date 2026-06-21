"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Share2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

export type RankingShareItem = {
  id: string;
  name: string;
  photo?: string;
  value: number;
  label: string;
};

type RankingShareModalProps = {
  title: string;
  subtitle: string;
  items: RankingShareItem[];
  shareUrl: string;
  siteLabel: string;
};

// Codifica o payload em base64url (UTF-8 safe) para a rota /api/ranking-image.
function encodePayload(payload: unknown) {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function RankingShareModal({ title, subtitle, items, shareUrl }: RankingShareModalProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [variant, setVariant] = useState<1 | 2>(1);

  // A arte é gerada 100% no servidor (next/og), então funciona igual em desktop e celular.
  const imageUrl = useMemo(() => {
    const cleanItems = items
      .filter((item) => item.name && Number.isFinite(item.value))
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        name: item.name,
        photo: item.photo,
        value: item.value,
        label: item.label,
      }));
    const d = encodePayload({ title, subtitle, variant, items: cleanItems });
    const retry = attempt > 0 ? `&r=${attempt}` : "";
    return `/api/ranking-image?d=${d}${retry}`;
  }, [title, subtitle, variant, items, attempt]);

  function openShareModal() {
    setMessage(null);
    setLoaded(false);
    setFailed(false);
    setAttempt(0);
    setVariant(Math.random() < 0.5 ? 1 : 2);
    setOpen(true);
  }

  function retryGeneration() {
    setLoaded(false);
    setFailed(false);
    setMessage(null);
    setAttempt((value) => value + 1);
  }

  async function createImageFile() {
    const response = await fetch(imageUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Imagem indisponível");
    const blob = await response.blob();
    return new File([blob], `${slugify(title)}-bravura.png`, { type: "image/png" });
  }

  async function handleDownload() {
    setMessage(null);
    setBusy(true);
    try {
      const file = await createImageFile();
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
      // O link vai embutido no texto para não se perder em apps que ignoram o campo `url`.
      const text = `🏆 ${title} — ${subtitle}\nConfira o ranking completo no site oficial do Bravura:\n${shareUrl}`;
      const file = await createImageFile();

      // 1ª opção: imagem + mensagem + link juntos.
      if (navigator.canShare?.({ files: [file], text, url: shareUrl })) {
        await navigator.share({ title, text, url: shareUrl, files: [file] });
        return;
      }

      // 2ª opção: imagem + mensagem (link já está no texto).
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title, text, files: [file] });
        return;
      }

      // 3ª opção: mensagem + link sem imagem.
      if (navigator.share) {
        await navigator.share({ title, text, url: shareUrl });
        return;
      }

      // Fallback final: copia mensagem + link.
      await navigator.clipboard.writeText(text);
      setMessage("Mensagem e link do ranking copiados.");
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
              {open && !failed && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={imageUrl}
                  src={imageUrl}
                  alt="Prévia do ranking Bravura"
                  onLoad={() => setLoaded(true)}
                  onError={() => setFailed(true)}
                  className={`h-full w-full object-contain transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
                />
              )}
              {!loaded && !failed && (
                <div className="absolute inset-0 flex items-center justify-center text-center text-xs font-semibold uppercase tracking-wider text-brand-gray">
                  Gerando arte…
                </div>
              )}
              {failed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-gray">
                    Não foi possível gerar a arte.
                  </p>
                  <button
                    type="button"
                    onClick={retryGeneration}
                    className="rounded-sm border border-brand-gold/60 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-black"
                  >
                    Tentar de novo
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-brand-gray">
              Arte vertical em 1080x1920 pronta para Story. Baixe ou compartilhe direto pelo celular.
            </p>
            <button
              type="button"
              onClick={handleDownload}
              disabled={busy || !loaded}
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-brand-red px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {busy ? "Gerando…" : "Baixar imagem"}
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={busy || !loaded}
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
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}
