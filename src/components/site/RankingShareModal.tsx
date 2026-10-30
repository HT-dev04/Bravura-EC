"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Download, Shuffle, Share2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { encodeRankingPayload, randomRankingArtStyle, RANKING_ART_STYLES, type RankingArtStyle, type RankingShareItem } from "@/lib/ranking-share";

export type { RankingShareItem };

type RankingShareModalProps = {
  title: string;
  subtitle: string;
  items: RankingShareItem[];
  shareUrl: string;
  siteLabel: string;
};

// Arte já baixada: o arquivo vai direto para o compartilhamento e a URL local alimenta a prévia.
type Art = { file: File; url: string };

export function RankingShareModal({ title, subtitle, items, shareUrl, siteLabel }: RankingShareModalProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [style, setStyle] = useState<RankingArtStyle | null>(null);
  // Resultado por URL da arte: a URL muda junto com estilo, filtro e números, então nunca mostra arte velha.
  const [arts, setArts] = useState<Record<string, Art | "error">>({});
  const requested = useRef(new Set<string>());
  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  // A arte é gerada 100% no servidor (next/og), então funciona igual em desktop e celular.
  const artUrl = useCallback(
    (artStyle: RankingArtStyle) => {
      const cleanItems = items
        .filter((item) => item.name && Number.isFinite(item.value))
        .slice(0, 5)
        .map((item) => ({ id: item.id, name: item.name, photo: item.photo, value: item.value, label: item.label, number: item.number }));
      return `/api/ranking-image?d=${encodeRankingPayload({ title, subtitle, style: artStyle, site: siteLabel, items: cleanItems })}`;
    },
    [title, subtitle, items, siteLabel]
  );

  const loadArt = useCallback(
    (artStyle: RankingArtStyle) => {
      const url = artUrl(artStyle);
      if (requested.current.has(url)) return;
      requested.current.add(url);

      fetch(url)
        .then(async (response) => {
          if (!response.ok) throw new Error("Imagem indisponível");
          const file = new File([await response.blob()], `${slugify(title)}-bravura.jpg`, { type: "image/jpeg" });
          const objectUrl = URL.createObjectURL(file);
          objectUrls.current.push(objectUrl);
          setArts((current) => ({ ...current, [url]: { file, url: objectUrl } }));
        })
        .catch(() => {
          requested.current.delete(url);
          setArts((current) => ({ ...current, [url]: "error" }));
        });
    },
    [artUrl, title]
  );

  // Começa a gerar assim que a pessoa encosta no botão: quando o modal abre a arte já está a caminho.
  // A arte é sorteada uma vez por abertura, então cada compartilhamento tende a sair diferente.
  function prepare() {
    const chosen = style ?? randomRankingArtStyle();
    if (!style) setStyle(chosen);
    loadArt(chosen);
  }

  function openShareModal() {
    setMessage(null);
    prepare();
    setOpen(true);
  }

  function closeShareModal() {
    setOpen(false);
    // Na próxima abertura sai outra arte sorteada.
    setStyle(null);
  }

  function shuffleStyle() {
    selectStyle(randomRankingArtStyle(style));
  }

  function selectStyle(next: RankingArtStyle) {
    setMessage(null);
    setStyle(next);
    loadArt(next);
  }

  const currentUrl = style ? artUrl(style) : null;
  const current = currentUrl ? arts[currentUrl] : undefined;
  const art = current && current !== "error" ? current : null;
  const failed = current === "error";

  function retryGeneration() {
    if (!style || !currentUrl) return;
    setMessage(null);
    setArts((previous) => {
      const next = { ...previous };
      delete next[currentUrl];
      return next;
    });
    loadArt(style);
  }

  function handleDownload() {
    if (!art) return;
    const link = document.createElement("a");
    link.href = art.url;
    link.download = art.file.name;
    link.click();
    setMessage("Imagem baixada.");
  }

  // A imagem já está na memória: o compartilhamento abre no mesmo toque, sem esperar o servidor
  // (no iPhone, esperar aqui faz o navegador bloquear a janela de compartilhar).
  async function handleShare() {
    if (!art) return;
    setMessage(null);
    // O link vai embutido no texto para não se perder em apps que ignoram o campo `url`.
    const text = `🏆 ${title} — ${subtitle}\nConfira o ranking completo no site oficial do Bravura:\n${shareUrl}`;
    const files = [art.file];

    try {
      // 1ª opção: imagem + mensagem + link juntos.
      if (navigator.canShare?.({ files, text, url: shareUrl })) {
        await navigator.share({ title, text, url: shareUrl, files });
        return;
      }

      // 2ª opção: imagem + mensagem (link já está no texto).
      if (navigator.canShare?.({ files })) {
        await navigator.share({ title, text, files });
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
        onPointerEnter={prepare}
        onTouchStart={prepare}
        onFocus={prepare}
        className="inline-flex items-center gap-2 rounded-sm border border-brand-gold/50 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-brand-gold transition-colors hover:border-brand-gold hover:bg-brand-gold hover:text-brand-black"
      >
        <Share2 className="h-4 w-4" />
        Compartilhar ranking
      </button>

      <Dialog open={open} onClose={closeShareModal} title="Compartilhar ranking" className="max-w-4xl">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="overflow-hidden rounded-sm border border-brand-border bg-brand-black p-3">
            <div className="relative mx-auto aspect-[9/16] max-h-[44vh] max-w-sm overflow-hidden rounded-sm bg-brand-black lg:max-h-[70vh]">
              {art && (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={art.url} src={art.url} alt="Prévia do ranking Bravura" className="h-full w-full object-contain" />
              )}
              {!art && !failed && (
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
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-gray">Estilo da arte</p>
                <button
                  type="button"
                  onClick={shuffleStyle}
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-brand-gold transition-colors hover:text-brand-white"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  Sortear outra
                </button>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {RANKING_ART_STYLES.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={style === option.id}
                    onClick={() => selectStyle(option.id)}
                    onPointerEnter={() => loadArt(option.id)}
                    className={`whitespace-nowrap rounded-sm border px-1 py-2 text-[11px] font-semibold uppercase transition-colors ${
                      style === option.id
                        ? "border-brand-gold bg-brand-gold/15 text-brand-gold"
                        : "border-brand-border text-brand-white hover:border-brand-gold/60"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={handleShare}
              disabled={!art}
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-brand-gold px-4 py-3 text-sm font-semibold uppercase tracking-wide text-brand-black transition-colors hover:bg-brand-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!art}
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-brand-red px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              Baixar imagem
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
            <p className="text-sm text-brand-gray">
              Arte vertical em 1080x1920 pronta para Story. Baixe ou compartilhe direto pelo celular.
            </p>
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
