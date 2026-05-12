import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { Badge } from "@/components/ui/badge";
import { getCmsData } from "@/lib/cms-store";
import { bravuraLogo } from "@/lib/asset-url";
import { getValidImageSrc } from "@/lib/image-utils";
import { formatDateLong, formatTime } from "@/lib/utils";
import { Shirt, Calendar, MapPin, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { matches } = await getCmsData();
  const match = matches.find((m) => m.id === id);
  if (!match) return { title: "Partida não encontrada" };
  return {
    title: `Bravura × ${match.opponent}`,
    description: `Bravura EC × ${match.opponent} — ${match.competition} · ${formatDateLong(match.date)}. Veja o resumo da partida do Bravura Futebol Clube.`,
    alternates: { canonical: `/jogos/${id}` },
  };
}

const eventLabels: Record<string, string> = {
  gol: "Gol",
  assistencia: "Assistência",
  cartao_amarelo: "Cartão amarelo",
  cartao_vermelho: "Cartão vermelho",
  substituicao: "Substituição",
};

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { matches, players } = await getCmsData();
  const match = matches.find((m) => m.id === id);
  if (!match) notFound();

  const starters = match.lineupStart
    .map((pid) => players.find((p) => p.id === pid))
    .filter(Boolean) as typeof players;

  const bench = match.lineupBench
    .map((pid) => players.find((p) => p.id === pid))
    .filter(Boolean) as typeof players;

  const highlight = match.highlightPlayerId
    ? players.find((p) => p.id === match.highlightPlayerId)
    : null;

  return (
    <SiteShell>
      <section className="diag-section py-14">
        <div className="container-x">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="gold">{match.competition}</Badge>
            {match.status === "encerrada" && match.result && (
              <Badge variant="red">{match.result === "V" ? "Vitória" : match.result === "E" ? "Empate" : "Derrota"}</Badge>
            )}
            {match.status === "agendada" && <Badge variant="outline">Agendada</Badge>}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 py-6">
            <TeamBlock logo={bravuraLogo} name="Bravura EC" />
            <div className="text-center">
              {match.status === "encerrada" ? (
                <div className="font-display text-5xl sm:text-6xl md:text-8xl font-bold">
                  {match.scoreHome} <span className="text-brand-red">×</span> {match.scoreAway}
                </div>
              ) : (
                <div className="font-display text-4xl md:text-6xl uppercase">VS</div>
              )}
              <p className="text-brand-gold mt-2 text-sm uppercase tracking-widest">{formatTime(match.date)}</p>
            </div>
            <TeamBlock logo={match.opponentLogo} name={match.opponent} />
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-brand-gray mt-6">
            <span className="flex min-w-0 items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-red" />
              {formatDateLong(match.date)}
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-red" />
              <span className="break-words">{match.location}</span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <Trophy className="w-4 h-4 text-brand-red" />
              <span className="break-words">{match.competition}</span>
            </span>
          </div>
        </div>
      </section>

      {match.events.length > 0 && (
        <section className="container-x py-10">
          <h2 className="font-display text-3xl uppercase mb-6">Linha do tempo</h2>
          <ol className="relative border-l-2 border-brand-red/40 ml-3 space-y-5">
            {match.events.map((ev, i) => (
              <li key={i} className="pl-6 relative">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-brand-red border-4 border-brand-black" />
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <span className="font-display text-xl text-brand-gold">{ev.minute}&apos;</span>
                  <Badge variant={ev.team === "bravura" ? "red" : "gray"}>
                    {ev.team === "bravura" ? "Bravura" : match.opponent}
                  </Badge>
                  <span className="break-words text-sm">{eventLabels[ev.type]}</span>
                </div>
                <p className="break-words text-sm text-brand-gray mt-1">{ev.playerName}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {starters.length > 0 && (
        <section className="container-x py-10 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display text-3xl uppercase mb-5 flex items-center gap-2">
              <Shirt className="w-6 h-6 text-brand-red" /> Escalação
            </h2>
            <ul className="space-y-2">
              {starters.map((p) => (
                <li
                  key={p.id}
                  className="bg-brand-black-2 border border-brand-border rounded-sm px-4 py-3 flex min-w-0 items-center gap-3"
                >
                  <span className="w-6 shrink-0 font-display text-xl text-brand-gold">{p.number}</span>
                  <span className="min-w-0 flex-1 break-words">{p.name}</span>
                  <span className="shrink-0 text-xs text-brand-gray uppercase">{p.position}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-3xl uppercase mb-5">Banco</h2>
            <ul className="space-y-2">
              {bench.map((p) => (
                <li
                  key={p.id}
                  className="bg-brand-black-2 border border-brand-border rounded-sm px-4 py-3 flex min-w-0 items-center gap-3"
                >
                  <span className="w-6 shrink-0 font-display text-xl text-brand-gold">{p.number}</span>
                  <span className="min-w-0 flex-1 break-words">{p.name}</span>
                  <span className="shrink-0 text-xs text-brand-gray uppercase">{p.position}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {match.gallery.length > 0 && (
        <section className="container-x py-10">
          <h2 className="font-display text-3xl uppercase mb-5">Galeria da partida</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {match.gallery.map((src, i) => {
              const imgSrc = getValidImageSrc(src);
              if (!imgSrc) return null;
              return (
                <div key={i} className="relative aspect-video bg-brand-black rounded-sm overflow-hidden">
                  <Image src={imgSrc} alt="" fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {highlight && (
        <section className="container-x py-10">
          <div className="bg-brand-black-2 border border-brand-gold/40 rounded-sm p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-28 h-28 shrink-0 rounded-full overflow-hidden bg-brand-black">
              {getValidImageSrc(highlight.photo) && (
                <Image src={getValidImageSrc(highlight.photo)!} alt={highlight.name} fill sizes="112px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-brand-gold uppercase text-xs tracking-widest font-semibold mb-1">
                Destaque do jogo
              </p>
              <h3 className="break-words font-display text-3xl uppercase">{highlight.nickname}</h3>
              <p className="break-words text-brand-gray italic mt-2">&ldquo;{match.highlightQuote}&rdquo;</p>
            </div>
          </div>
        </section>
      )}
    </SiteShell>
  );
}

function TeamBlock({ logo, name }: { logo: string; name: string }) {
  const logoSrc = getValidImageSrc(logo);
  return (
    <div className="min-w-0 text-center">
      {logoSrc ? (
        <Image src={logoSrc} alt={name} width={110} height={110} className="mx-auto h-[110px] w-[110px] object-contain" />
      ) : (
        <div className="mx-auto h-[110px] w-[110px] rounded-sm bg-brand-black-2 border border-brand-border flex items-center justify-center text-xl font-bold text-brand-gray">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <p className="break-words font-display text-lg md:text-2xl uppercase mt-2">{name}</p>
    </div>
  );
}
