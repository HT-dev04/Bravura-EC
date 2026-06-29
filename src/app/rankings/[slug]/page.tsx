import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Gamepad2, Handshake, Sparkles, Target, Trophy } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { getCmsData } from "@/lib/cms-store";
import { getInitials, getValidImageSrc } from "@/lib/image-utils";
import type { Match, Player } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RankingConfig = {
  title: string;
  valueLabel: string;
  description: string;
  icon: "goals" | "assists" | "games" | "stars" | "participations";
  accent: "red" | "gold";
  includeZero: boolean;
  getValue: (player: Player, highlights: Map<string, number>) => number;
};

const RANKINGS: Record<string, RankingConfig> = {
  artilheiros: {
    title: "Artilheiros",
    valueLabel: "gols",
    description: "Ranking completo dos jogadores que mais marcaram gols na temporada.",
    icon: "goals",
    accent: "red",
    includeZero: false,
    getValue: (player) => player.stats.goals,
  },
  assistentes: {
    title: "Assistentes",
    valueLabel: "assistências",
    description: "Ranking completo dos jogadores que mais deram assistências na temporada.",
    icon: "assists",
    accent: "gold",
    includeZero: false,
    getValue: (player) => player.stats.assists,
  },
  participacoes: {
    title: "Participações em gol",
    valueLabel: "participações",
    description: "Ranking completo por participações em gol (gols + assistências) na temporada.",
    icon: "participations",
    accent: "red",
    includeZero: false,
    getValue: (player) => player.stats.goals + player.stats.assists,
  },
  jogos: {
    title: "Mais jogos",
    valueLabel: "jogos",
    description: "Ranking completo dos jogadores com mais jogos na temporada.",
    icon: "games",
    accent: "gold",
    includeZero: true,
    getValue: (player) => player.stats.games,
  },
  craques: {
    title: "Craques do jogo",
    valueLabel: "vezes",
    description: "Ranking completo dos jogadores mais vezes eleitos craque do jogo.",
    icon: "stars",
    accent: "red",
    includeZero: false,
    getValue: (player, highlights) => highlights.get(player.id) || 0,
  },
};

function getHighlightCounts(matches: Match[]) {
  const counts = new Map<string, number>();
  for (const match of matches) {
    if (match.status !== "encerrada" || !match.highlightPlayerId) continue;
    counts.set(match.highlightPlayerId, (counts.get(match.highlightPlayerId) || 0) + 1);
  }
  return counts;
}

export function generateStaticParams() {
  return Object.keys(RANKINGS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = RANKINGS[slug];
  if (!config) return { title: "Ranking não encontrado" };
  return {
    title: `${config.title} — Ranking completo · Bravura EC`,
    description: config.description,
    alternates: { canonical: `/rankings/${slug}` },
  };
}

export default async function RankingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = RANKINGS[slug];
  if (!config) notFound();

  const { players, matches } = await getCmsData();
  const highlights = getHighlightCounts(matches);

  const rows = players
    .map((player) => ({ player, value: config.getValue(player, highlights) }))
    .filter((row) => config.includeZero || row.value > 0)
    .sort((a, b) => b.value - a.value || (a.player.nickname || a.player.name).localeCompare(b.player.nickname || b.player.name));

  const accentText = config.accent === "red" ? "text-brand-red" : "text-brand-gold";
  const Icon =
    config.icon === "goals"
      ? Trophy
      : config.icon === "assists"
        ? Handshake
        : config.icon === "games"
          ? Gamepad2
          : config.icon === "participations"
            ? Target
            : Sparkles;

  return (
    <SiteShell>
      <section className="diag-section py-14">
        <div className="container-x">
          <Link href="/#rankings" className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-gray transition-colors hover:text-brand-white">
            <ArrowLeft className="h-4 w-4" />
            Voltar aos destaques
          </Link>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold">Ranking completo</p>
          <h1 className="flex items-center gap-3 break-words font-display text-4xl uppercase md:text-6xl">
            <Icon className={`h-8 w-8 shrink-0 md:h-10 md:w-10 ${accentText}`} />
            {config.title}
          </h1>
          <p className="mt-3 break-words text-brand-gray">{config.description}</p>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="overflow-hidden rounded-sm border border-brand-border bg-brand-black-2">
          <div className="divide-y divide-brand-border">
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <Link
                  key={row.player.id}
                  href={`/elenco/${row.player.slug}`}
                  className="flex min-w-0 items-center gap-4 p-4 transition-colors hover:bg-white/5"
                >
                  <span className={`w-8 shrink-0 text-center font-display text-2xl ${index < 3 ? accentText : "text-brand-gray"}`}>
                    {index + 1}
                  </span>
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-brand-black">
                    {getValidImageSrc(row.player.photo) ? (
                      <Image src={getValidImageSrc(row.player.photo)!} alt={row.player.name} fill sizes="48px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-brand-gold">
                        {getInitials(row.player.nickname || row.player.name)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg uppercase leading-tight">{row.player.nickname || row.player.name}</p>
                    <p className="truncate text-[11px] uppercase text-brand-gray">#{row.player.number} · {row.player.position}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`font-display text-3xl font-bold leading-none ${accentText}`}>{row.value}</p>
                    <p className="text-[10px] uppercase text-brand-gray">{config.valueLabel}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="p-6 text-brand-gray">Sem dados registrados.</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Link href="/estatisticas">
            <Button variant="outline" size="sm">Ver todas as estatísticas</Button>
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
