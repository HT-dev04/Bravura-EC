import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Handshake, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { StatCard } from "@/components/site/StatCard";
import { getCmsData } from "@/lib/cms-store";
import { getPlayerTimeline, PLAYER_EVENT_STAT_KEYS, type PlayerTimelineEntry } from "@/lib/cms-stats";
import { PlayerGoalsChart } from "./PlayerGoalsChart";
import { Badge } from "@/components/ui/badge";
import { getValidImageSrc } from "@/lib/image-utils";
import { formatDate } from "@/lib/utils";
import type { PlayerEventStatKey, PlayerStats } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { players } = await getCmsData();
  const player = players.find((p) => p.slug === slug);
  if (!player) return { title: "Jogador não encontrado" };
  return {
    title: `${player.nickname} · ${player.name}`,
    description: player.bio || `Perfil de ${player.name} no elenco do Bravura EC — posição, estatísticas e carreira.`,
    alternates: { canonical: `/elenco/${slug}` },
  };
}

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { players, matches } = await getCmsData();
  const player = players.find((p) => p.slug === slug);
  if (!player) notFound();

  const timeline = getPlayerTimeline(player, players, matches);
  const manualNote = manualAdjustNote(player.stats);

  return (
    <SiteShell>
      <section className="diag-section py-14">
        <div className="container-x grid md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-10 items-start">
          <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-brand-black-2 border border-brand-border">
            {getValidImageSrc(player.photo) && (
              <Image src={getValidImageSrc(player.photo)!} alt={player.name} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover object-top" />
            )}
          </div>
          <div className="relative min-w-0">
            <Badge variant="gold">{player.position}</Badge>
            <h1 className="break-words font-display text-4xl sm:text-5xl md:text-7xl uppercase leading-none mt-3">
              {player.nickname}
            </h1>
            <p className="break-words text-brand-gray text-xl mt-1">{player.name}</p>
            <p className="pointer-events-none absolute right-0 top-8 max-w-full break-words text-right font-display text-7xl sm:text-[140px] leading-none text-brand-red/30 font-bold">
              {player.number}
            </p>
            <div className="relative z-10 mt-6 max-w-xl break-words text-brand-white/80">{player.bio}</div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-xl">
              <InfoRow label="Pé preferido" value={player.preferredFoot} />
              <InfoRow label="Altura" value={`${player.height} cm`} />
              <InfoRow label="Peso" value={`${player.weight} kg`} />
              <InfoRow label="Número" value={`#${player.number}`} />
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-14">
        <h2 className="font-display text-2xl md:text-3xl uppercase mb-5">Estatísticas da temporada</h2>
        <div className="grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Jogos" value={player.stats.games} />
          <StatCard label="Gols" value={player.stats.goals} accent="red" />
          <StatCard label="Assistências" value={player.stats.assists} accent="gold" />
          <StatCard label="Minutos" value={player.stats.minutes} />
          <StatCard label="Amarelos" value={player.stats.yellowCards} />
          <StatCard label="Vermelhos" value={player.stats.redCards} />
        </div>
      </section>

      <section className="container-x py-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div className="min-w-0">
          <h2 className="font-display text-2xl md:text-3xl uppercase">Linha do tempo</h2>
          <p className="mt-1 mb-6 text-sm text-brand-gray">
            Jogos em que {player.nickname || player.name} marcou, deu assistência, levou cartão ou foi o craque da partida.
          </p>
          {timeline.length === 0 ? (
            <p className="rounded-sm border border-brand-border bg-brand-black-2 p-4 text-sm text-brand-gray">
              Ainda não há gols, assistências ou cartões registrados nos jogos.
            </p>
          ) : (
            <ol className="relative ml-2 space-y-4 border-l border-brand-border">
              {timeline.map((entry) => (
                <TimelineItem key={entry.match.id} entry={entry} />
              ))}
            </ol>
          )}
          {manualNote && <p className="mt-4 text-xs text-brand-gray">{manualNote}</p>}
        </div>

        <div className="min-w-0 space-y-10 lg:sticky lg:top-24 lg:self-start">
          <div>
            <h2 className="font-display text-2xl md:text-3xl uppercase mb-5">Gols por mês</h2>
            <div className="bg-brand-black-2 border border-brand-border rounded-sm p-4 h-[280px]">
              <PlayerGoalsChart data={player.monthlyGoals} />
            </div>
          </div>
          {player.history.length > 0 && (
            <div>
              <h2 className="font-display text-2xl md:text-3xl uppercase mb-5">Histórico</h2>
              <ul className="space-y-2">
                {player.history.map((h, i) => (
                  <li
                    key={i}
                    className="bg-brand-black-2 border border-brand-border rounded-sm p-4 flex min-w-0 justify-between gap-4 text-sm"
                  >
                    <span className="text-brand-gray">{h.year}</span>
                    <span className="min-w-0 break-words text-right font-semibold">{h.club}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-brand-black-2 border border-brand-border rounded-sm px-3 py-2">
      <p className="text-[10px] uppercase text-brand-gray tracking-wider">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

const RESULT_STYLE = {
  V: { label: "Vitória", dot: "bg-emerald-500", badge: "border-emerald-500/40 text-emerald-400" },
  E: { label: "Empate", dot: "bg-brand-gold", badge: "border-brand-gold/40 text-brand-gold" },
  D: { label: "Derrota", dot: "bg-brand-red", badge: "border-brand-red/50 text-brand-red" },
} as const;

const MANUAL_LABELS: Record<PlayerEventStatKey, [string, string]> = {
  goals: ["gol", "gols"],
  assists: ["assistência", "assistências"],
  yellowCards: ["cartão amarelo", "cartões amarelos"],
  redCards: ["cartão vermelho", "cartões vermelhos"],
};

// Os totais podem incluir lançamentos manuais do admin que não pertencem a nenhum jogo da linha do tempo.
function manualAdjustNote(stats: PlayerStats) {
  const parts = PLAYER_EVENT_STAT_KEYS.flatMap((key) => {
    const value = stats.adjust?.[key] || 0;
    if (!value) return [];
    const [singular, plural] = MANUAL_LABELS[key];
    return [`${value > 0 ? "+" : "−"}${Math.abs(value)} ${Math.abs(value) === 1 ? singular : plural}`];
  });
  if (parts.length === 0) return null;
  return `Os totais da temporada incluem lançamentos sem jogo vinculado: ${parts.join(", ")}.`;
}

function minutesLabel(minutes: number[]) {
  const known = minutes.filter((minute) => minute > 0);
  return known.length > 0 ? ` · ${known.map((minute) => `${minute}'`).join(", ")}` : "";
}

function TimelineItem({ entry }: { entry: PlayerTimelineEntry }) {
  const { match } = entry;
  const result = entry.result ? RESULT_STYLE[entry.result] : null;

  return (
    <li className="relative pl-6">
      <span
        aria-hidden
        className={`absolute -left-[7px] top-5 h-3.5 w-3.5 rounded-full border-2 border-brand-black ${result?.dot || "bg-brand-gray"}`}
      />
      <Link
        href={`/jogos/${match.id}`}
        className="group block rounded-sm border border-brand-border bg-brand-black-2 p-4 transition-colors hover:border-brand-gold/60"
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="break-words text-[11px] uppercase tracking-wider text-brand-gray">
              {formatDate(match.date)} · {match.competition}
            </p>
            <p className="mt-1 break-words font-display text-lg uppercase leading-tight">
              Bravura <span className="text-brand-gold">{match.scoreHome} × {match.scoreAway}</span> {match.opponent}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {result && (
              <span className={`rounded-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${result.badge}`}>
                {result.label}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-brand-gray transition-colors group-hover:text-brand-gold" />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {entry.goals.length > 0 && (
            <TimelineChip className="border-brand-red/50 bg-brand-red/10">
              <BallIcon />
              {entry.goals.length === 1 ? "Gol" : `${entry.goals.length} gols`}
              {minutesLabel(entry.goals)}
            </TimelineChip>
          )}
          {entry.assists.length > 0 && (
            <TimelineChip className="border-brand-gold/40 bg-brand-gold/10">
              <Handshake className="h-3.5 w-3.5 text-brand-gold" />
              {entry.assists.length === 1 ? "Assistência" : `${entry.assists.length} assistências`}
              {minutesLabel(entry.assists)}
            </TimelineChip>
          )}
          {entry.yellowCards.length > 0 && (
            <TimelineChip>
              <span aria-hidden className="h-3.5 w-2.5 rounded-[2px] bg-yellow-400" />
              {entry.yellowCards.length === 1 ? "Cartão amarelo" : `${entry.yellowCards.length} cartões amarelos`}
              {minutesLabel(entry.yellowCards)}
            </TimelineChip>
          )}
          {entry.redCards.length > 0 && (
            <TimelineChip>
              <span aria-hidden className="h-3.5 w-2.5 rounded-[2px] bg-red-600" />
              {entry.redCards.length === 1 ? "Cartão vermelho" : `${entry.redCards.length} cartões vermelhos`}
              {minutesLabel(entry.redCards)}
            </TimelineChip>
          )}
          {entry.isHighlight && (
            <TimelineChip className="border-brand-gold/40 text-brand-gold">
              <Sparkles className="h-3.5 w-3.5" />
              Craque do jogo
            </TimelineChip>
          )}
        </div>
      </Link>
    </li>
  );
}

function TimelineChip({ children, className = "border-brand-border" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

function BallIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7.5l4.3 3.1-1.6 5h-5.4l-1.6-5z" fill="currentColor" />
      <path d="M12 7.5V2.6M16.3 10.6l4.6-1.5M14.7 15.6l2.8 3.9M9.3 15.6l-2.8 3.9M7.7 10.6L3.1 9.1" />
    </svg>
  );
}
