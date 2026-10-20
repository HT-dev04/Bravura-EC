import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Handshake, Sparkles, UserRound } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { StatCard } from "@/components/site/StatCard";
import { ChampionshipLogo } from "@/components/site/ChampionshipCard";
import { Badge } from "@/components/ui/badge";
import {
  CHAMPIONSHIP_STAT_KEYS,
  getChampionshipPlayerStats,
  getChampionshipPlayerTimeline,
  type ChampionshipTimelineEntry,
} from "@/lib/championship-stats";
import { getChampionshipBySlug, getClubPlayerSlug } from "@/lib/championship-store";
import { getValidImageSrc } from "@/lib/image-utils";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return [];
}

type Params = Promise<{ slug: string; playerId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, playerId } = await params;
  const championship = await getChampionshipBySlug(slug);
  const player = championship?.players.find((row) => row.id === playerId);
  if (!championship || !player) return { title: "Jogador não encontrado" };
  return {
    title: `${player.nickname || player.name} · ${championship.name}`,
    description: `Números de ${player.name} pelo Bravura EC em ${championship.name} ${championship.season}.`,
    alternates: { canonical: `/campeonatos/${slug}/jogadores/${playerId}` },
  };
}

const RESULT_STYLE = {
  V: { label: "Vitória", dot: "bg-emerald-500", badge: "border-emerald-500/40 text-emerald-400" },
  E: { label: "Empate", dot: "bg-brand-gold", badge: "border-brand-gold/40 text-brand-gold" },
  D: { label: "Derrota", dot: "bg-brand-red", badge: "border-brand-red/50 text-brand-red" },
} as const;

export default async function ChampionshipPlayerPage({ params }: { params: Params }) {
  const { slug, playerId } = await params;
  const championship = await getChampionshipBySlug(slug);
  const player = championship?.players.find((row) => row.id === playerId);
  if (!championship || !player) notFound();

  const stats = getChampionshipPlayerStats(championship).get(player.id)!;
  const timeline = getChampionshipPlayerTimeline(championship, player.id);
  const clubSlug = await getClubPlayerSlug(player.sourcePlayerId);
  const photo = getValidImageSrc(player.photo);
  const hasAdjust = CHAMPIONSHIP_STAT_KEYS.some((key) => player.adjust?.[key]);

  return (
    <SiteShell>
      <section className="diag-section py-14">
        <div className="container-x">
          <Link
            href={`/campeonatos/${championship.slug}`}
            className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-brand-gray hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> {championship.name} {championship.season}
          </Link>
          <div className="grid items-start gap-10 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-brand-border bg-brand-black-2">
              {photo ? (
                <Image src={photo} alt={player.name} fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover object-top" />
              ) : (
                <div className="flex h-full items-center justify-center text-brand-gray/40">
                  <UserRound className="h-24 w-24" />
                </div>
              )}
            </div>
            <div className="relative min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="gold">{player.position}</Badge>
                <Badge variant="outline">Inscrito no campeonato</Badge>
              </div>
              <h1 className="mt-3 break-words font-display text-4xl uppercase leading-none sm:text-5xl md:text-7xl">
                {player.nickname || player.name}
              </h1>
              <p className="mt-1 break-words text-xl text-brand-gray">{player.name}</p>
              {player.number > 0 && (
                <p className="pointer-events-none absolute right-0 top-8 font-display text-7xl font-bold leading-none text-brand-red/30 sm:text-[140px]">
                  {player.number}
                </p>
              )}
              <div className="relative z-10 mt-6 flex items-center gap-3">
                <ChampionshipLogo championship={championship} size={48} />
                <div className="min-w-0">
                  <p className="break-words font-display text-lg uppercase">{championship.name}</p>
                  <p className="text-xs uppercase tracking-wider text-brand-gray">
                    Temporada {championship.season} · Camisa {player.number > 0 ? `#${player.number}` : "—"}
                  </p>
                </div>
              </div>
              {clubSlug && (
                <Link href={`/elenco/${clubSlug}`} className="relative z-10 mt-4 inline-block text-sm text-brand-gold hover:underline">
                  Ver perfil no elenco do Bravura →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-10">
        <h2 className="mb-5 font-display text-2xl uppercase md:text-3xl">No campeonato</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Jogos" value={stats.games} />
          <StatCard label="Gols" value={stats.goals} accent="red" />
          <StatCard label="Assistências" value={stats.assists} accent="gold" />
          <StatCard label="Amarelos" value={stats.yellowCards} />
          <StatCard label="Vermelhos" value={stats.redCards} />
        </div>
        {hasAdjust && (
          <p className="mt-3 text-xs text-brand-gray">Os totais incluem lançamentos manuais sem partida vinculada.</p>
        )}
      </section>

      <section className="container-x pb-14 pt-4">
        <h2 className="font-display text-2xl uppercase md:text-3xl">Histórico no campeonato</h2>
        <p className="mb-6 mt-1 text-sm text-brand-gray">Partidas que {player.nickname || player.name} disputou nesta competição.</p>
        {timeline.length === 0 ? (
          <p className="rounded-sm border border-brand-border bg-brand-black-2 p-4 text-sm text-brand-gray">
            Ainda não há partidas registradas para este jogador.
          </p>
        ) : (
          <ol className="relative ml-2 max-w-3xl space-y-4 border-l border-brand-border">
            {timeline.map((entry) => (
              <TimelineItem key={entry.match.id} entry={entry} />
            ))}
          </ol>
        )}
      </section>
    </SiteShell>
  );
}

function minutesLabel(minutes: number[]) {
  const known = minutes.filter((minute) => minute > 0);
  return known.length > 0 ? ` · ${known.map((minute) => `${minute}'`).join(", ")}` : "";
}

function TimelineItem({ entry }: { entry: ChampionshipTimelineEntry }) {
  const { match } = entry;
  const result = entry.result ? RESULT_STYLE[entry.result] : null;
  const hasPenalties = match.penaltiesHome !== null && match.penaltiesAway !== null;
  const nothingNotable = !entry.goals.length && !entry.assists.length && !entry.yellowCards.length && !entry.redCards.length && !entry.isHighlight;

  return (
    <li className="relative pl-6">
      <span
        aria-hidden
        className={`absolute -left-[7px] top-5 h-3.5 w-3.5 rounded-full border-2 border-brand-black ${result?.dot || "bg-brand-gray"}`}
      />
      <div className="rounded-sm border border-brand-border bg-brand-black-2 p-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="break-words text-[11px] uppercase tracking-wider text-brand-gray">
              {formatDate(match.date)}
              {match.phase ? ` · ${match.phase}` : ""}
            </p>
            <p className="mt-1 break-words font-display text-lg uppercase leading-tight">
              Bravura <span className="text-brand-gold">{match.scoreHome} × {match.scoreAway}</span> {match.opponent}
              {hasPenalties && (
                <span className="ml-2 text-xs normal-case text-brand-gray">
                  (pên. {match.penaltiesHome}×{match.penaltiesAway})
                </span>
              )}
            </p>
          </div>
          {result && (
            <span className={`shrink-0 rounded-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${result.badge}`}>
              {result.label}
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {entry.goals.length > 0 && (
            <Chip className="border-brand-red/50 bg-brand-red/10">
              ⚽ {entry.goals.length === 1 ? "Gol" : `${entry.goals.length} gols`}
              {minutesLabel(entry.goals)}
            </Chip>
          )}
          {entry.assists.length > 0 && (
            <Chip className="border-brand-gold/40 bg-brand-gold/10">
              <Handshake className="h-3.5 w-3.5 text-brand-gold" />
              {entry.assists.length === 1 ? "Assistência" : `${entry.assists.length} assistências`}
              {minutesLabel(entry.assists)}
            </Chip>
          )}
          {entry.yellowCards.length > 0 && (
            <Chip>
              <span aria-hidden className="h-3.5 w-2.5 rounded-[2px] bg-yellow-400" />
              {entry.yellowCards.length === 1 ? "Cartão amarelo" : `${entry.yellowCards.length} cartões amarelos`}
              {minutesLabel(entry.yellowCards)}
            </Chip>
          )}
          {entry.redCards.length > 0 && (
            <Chip>
              <span aria-hidden className="h-3.5 w-2.5 rounded-[2px] bg-red-600" />
              {entry.redCards.length === 1 ? "Cartão vermelho" : `${entry.redCards.length} cartões vermelhos`}
              {minutesLabel(entry.redCards)}
            </Chip>
          )}
          {entry.isHighlight && (
            <Chip className="border-brand-gold/40 text-brand-gold">
              <Sparkles className="h-3.5 w-3.5" /> Craque do jogo
            </Chip>
          )}
          {nothingNotable && <Chip>Entrou em campo</Chip>}
        </div>
      </div>
    </li>
  );
}

function Chip({ children, className = "border-brand-border" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}
