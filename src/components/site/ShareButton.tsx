"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

type ShareButtonProps = {
  title: string;
  text: string;
  url: string;
  imageUrl?: string;
};

export function ShareButton({ title, text, url, imageUrl }: ShareButtonProps) {
  const [message, setMessage] = useState<string | null>(null);
  const shareText = `${text}\n\n${url}`;
  const clipboardText = `${title}\n\n${text}\n\n${url}`;

  async function handleShare() {
    setMessage(null);

    try {
      if (navigator.share) {
        const imageFile = imageUrl ? await getShareImageFile(imageUrl, title) : null;
        if (imageFile && navigator.canShare?.({ files: [imageFile] })) {
          await navigator.share({ title, text: shareText, files: [imageFile] });
          return;
        }

        await navigator.share({ title, text: shareText, url });
        return;
      }

      await navigator.clipboard.writeText(clipboardText);
      setMessage("Link copiado!");
      window.setTimeout(() => setMessage(null), 2400);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Não foi possível compartilhar agora.");
      window.setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <div className="relative inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex max-w-full items-center justify-center gap-2 rounded-sm border border-brand-gold/50 bg-brand-black-2 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-brand-gold transition-colors hover:border-brand-gold hover:bg-brand-gold hover:text-brand-black focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black"
      >
        <Share2 className="h-4 w-4" />
        Compartilhar notícia
      </button>
      {message && (
        <span role="status" className="text-xs font-semibold uppercase tracking-wider text-brand-white/80">
          {message}
        </span>
      )}
    </div>
  );
}

async function getShareImageFile(imageUrl: string, title: string) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) return null;

    const extension = blob.type.split("/")[1]?.split("+")[0] || "jpg";
    const safeTitle = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48);

    return new File([blob], `${safeTitle || "noticia-bravura"}.${extension}`, { type: blob.type });
  } catch {
    return null;
  }
}
