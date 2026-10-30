import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { RankingShareModal } from "@/components/site/RankingShareModal";
import { RANKING_ACCENT_TEXT, RankingIconGlyph } from "@/components/site/RankingPanel";
import { championshipShareSubtitle, CHAMPIONSHIP_RANKINGS, getChampionshipRankingConfig, getChampionshipRankings } from "@/lib/championship-rankings";
import { getChampionshipBySlug } from "@/lib/championship-store";
import { getInitials, getValidImageSrc } from "@/lib/image-utils";
import { absoluteUrl, siteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return [];
}

type Params = Promise<{ slug: string; ranking: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, ranking } = await params;
  const championship = await getChampionshipBySlug(slug);
  const config = getChampionshipRankingConfig(ranking);
  if (!championship || !config) return { title: "Ranking não encontrado" };
  return {
    title: `${config.title} · ${championship.name} ${championship.season}`,
    description: config.description,
    alternates: { canonical: `/campeonatos/${slug}/rankings/${ranking}` },
  };
}

export default async function ChampionshipRankingPage({ params }: { params: Params }) {
  const { slug, ranking } = await params;
  const championship = await getChampionshipBySlug(slug);
  const config = getChampionshipRankingConfig(ranking);
  if (!championship || !config) notFound();

  const rows = getChampionshipRankings(championship).get(config.slug) || [];
  const accentText = RANKING_ACCENT_TEXT[config.accent];
  const path = `/campeonatos/${championship.slug}/rankings/${config.slug}`;
  const shareItems = rows.slice(0, 5).map(({ player, value }) => ({
    id: player.id,
    name: player.nickname || player.name,
    photo: getValidImageSrc(player.photo) || undefined,
    value,
    label: config.unit,
    number: player.number || undefined,
  }));

  return (
    <SiteShell>
      <section className="diag-section py-14">
        <div className="container-x">
          <Link
            href={`/campeonatos/${championship.slug}#rankings`}
            className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-gray transition-colors hover:text-brand-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {championship.name} {championship.season}
          </Link>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold">Ranking completo do campeonato</p>
          <h1 className="flex items-center gap-3 break-words font-display text-4xl uppercase md:text-6xl">
            <RankingIconGlyph icon={config.icon} className={`h-8 w-8 shrink-0 md:h-10 md:w-10 ${accentText}`} />
            {config.title}
          </h1>
          <p className="mt-3 break-words text-brand-gray">{config.description}</p>
          <div className="mt-5">
            <RankingShareModal
              title={config.shareTitle}
              subtitle={championshipShareSubtitle(championship)}
              items={shareItems}
              shareUrl={absoluteUrl(path)}
              siteLabel={new URL(siteUrl).hostname.replace(/^www\./, "")}
            />
          </div>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="overflow-hidden rounded-sm border border-brand-border bg-brand-black-2">
          <div className="divide-y divide-brand-border">
            {rows.length > 0 ? (
              rows.map(({ player, value }, index) => {
                const photo = getValidImageSrc(player.photo);
                return (
                  <Link
                    key={player.id}
                    href={`/campeonatos/${championship.slug}/jogadores/${player.id}`}
                    className="flex min-w-0 items-center gap-4 p-4 transition-colors hover:bg-white/5"
                  >
                    <span className={cn("w-8 shrink-0 text-center font-display text-2xl", index < 3 ? accentText : "text-brand-gray")}>{index + 1}</span>
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-brand-black">
                      {photo ? (
                        <Image src={photo} alt={player.name} fill sizes="48px" className="object-cover object-top" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-brand-gold">
                          {getInitials(player.nickname || player.name)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg uppercase leading-tight">{player.nickname || player.name}</p>
                      <p className="truncate text-[11px] uppercase text-brand-gray">
                        #{player.number} · {player.position}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={cn("font-display text-3xl font-bold leading-none", accentText)}>{value}</p>
                      <p className="text-[10px] uppercase text-brand-gray">{config.valueLabel}</p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="p-6 text-brand-gray">Sem registros ainda neste campeonato.</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {CHAMPIONSHIP_RANKINGS.filter((other) => other.slug !== config.slug).map((other) => (
            <Link
              key={other.slug}
              href={`/campeonatos/${championship.slug}/rankings/${other.slug}`}
              className="inline-flex items-center gap-2 rounded-sm border border-brand-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-brand-white/80 transition-colors hover:border-brand-gold hover:text-brand-gold"
            >
              <RankingIconGlyph icon={other.icon} className={`h-3.5 w-3.5 ${RANKING_ACCENT_TEXT[other.accent]}`} />
              {other.title}
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
