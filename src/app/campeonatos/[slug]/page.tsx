import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar, Sparkles, Trophy } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { StatCard } from "@/components/site/StatCard";
import { ChampionshipLogo } from "@/components/site/ChampionshipCard";
import { GroupStandingsTable, TeamCrest } from "@/components/site/ChampionshipStandings";
import { RankingPanel } from "@/components/site/RankingPanel";
import { Badge } from "@/components/ui/badge";
import { bravuraLogo } from "@/lib/asset-url";
import {
  CHAMPIONSHIP_STATUS_LABELS,
  championshipMatchResult,
  getChampionshipPlayerStats,
  getChampionshipSummary,
  getTeamGroup,
  type ChampionshipPlayerStats,
} from "@/lib/championship-stats";
import { championshipShareSubtitle, CHAMPIONSHIP_RANKINGS, getChampionshipRankings } from "@/lib/championship-rankings";
import { getChampionshipBySlug } from "@/lib/championship-store";
import { absoluteUrl, siteUrl } from "@/lib/site-url";
import { getInitials, getValidImageSrc } from "@/lib/image-utils";
import { cn, formatDate, formatDateLong, formatTime } from "@/lib/utils";
import type { Championship, ChampionshipMatch, ChampionshipPlayer } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const championship = await getChampionshipBySlug(slug);
  if (!championship) return { title: "Campeonato não encontrado" };
  return {
    title: `${championship.name} ${championship.season}`,
    description:
      championship.description ||
      `Campanha do Bravura EC em ${championship.name} ${championship.season}: partidas, elenco e artilharia.`,
    alternates: { canonical: `/campeonatos/${slug}` },
  };
}

const RESULT_STYLE = {
  V: { label: "Vitória", card: "border-green-700/70", badge: "green" },
  E: { label: "Empate", card: "border-brand-border", badge: "gray" },
  D: { label: "Derrota", card: "border-brand-red/80", badge: "red" },
} as const;

export default async function ChampionshipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const championship = await getChampionshipBySlug(slug);
  if (!championship) notFound();

  const summary = getChampionshipSummary(championship);
  const playerStats = getChampionshipPlayerStats(championship);
  const rankings = getChampionshipRankings(championship);
  const shareSubtitle = championshipShareSubtitle(championship);
  const siteLabel = new URL(siteUrl).hostname.replace(/^www\./, "");
  const matches = [...championship.matches].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const squad = [...championship.players].sort((a, b) => (a.number || 999) - (b.number || 999));
  const cover = getValidImageSrc(championship.cover);
  const sections = [
    { id: "campanha", label: "Campanha" },
    ...(championship.groups.length > 0 ? [{ id: "classificacao", label: "Classificação" }] : []),
    ...(championship.teams.length > 0 ? [{ id: "times", label: "Times" }] : []),
    { id: "partidas", label: "Partidas" },
    { id: "rankings", label: "Rankings" },
    { id: "elenco", label: "Elenco" },
  ];
  // Datas só com dia (YYYY-MM-DD): meio-dia evita voltar um dia no fuso do Brasil.
  const period = [championship.startDate, championship.endDate]
    .filter(Boolean)
    .map((date) => formatDate(`${date}T12:00:00`))
    .join(" — ");

  return (
    <SiteShell>
      <section className="relative overflow-hidden border-b border-brand-border">
        {cover && <Image src={cover} alt="" fill priority sizes="100vw" className="object-cover opacity-25" />}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_45%)]" />
        <div className="container-x relative flex flex-col gap-6 py-14 md:flex-row md:items-center">
          <ChampionshipLogo championship={championship} size={120} />
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="gold">Temporada {championship.season}</Badge>
              <Badge variant={championship.status === "em_andamento" ? "red" : "outline"}>
                {CHAMPIONSHIP_STATUS_LABELS[championship.status]}
              </Badge>
            </div>
            <h1 className="break-words font-display text-4xl uppercase leading-none md:text-6xl">{championship.name}</h1>
            {championship.finalPosition && (
              <p className="mt-3 inline-flex items-center gap-2 font-display text-xl uppercase text-brand-gold md:text-2xl">
                <Trophy className="h-6 w-6" /> {championship.finalPosition}
              </p>
            )}
            {period && (
              <p className="mt-2 flex items-center gap-2 text-sm text-brand-gray">
                <Calendar className="h-4 w-4 text-brand-red" /> {period}
              </p>
            )}
            {championship.description && (
              <p className="mt-4 max-w-2xl whitespace-pre-line break-words text-brand-white/80">{championship.description}</p>
            )}
          </div>
        </div>
      </section>

      <nav className="sticky top-16 z-30 border-b border-brand-border bg-brand-black/95 backdrop-blur">
        <div className="container-x flex gap-1 overflow-x-auto py-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="shrink-0 rounded-sm px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-white/80 hover:bg-white/5 hover:text-white"
            >
              {section.label}
            </a>
          ))}
        </div>
      </nav>

      <section id="campanha" className="container-x scroll-mt-32 py-10">
        <h2 className="mb-5 font-display text-2xl uppercase md:text-3xl">Campanha</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <StatCard label="Jogos" value={summary.games} />
          <StatCard label="Vitórias" value={summary.wins} accent="gold" />
          <StatCard label="Empates" value={summary.draws} />
          <StatCard label="Derrotas" value={summary.losses} accent="red" />
          <StatCard label="Gols pró" value={summary.goalsFor} accent="gold" />
          <StatCard label="Gols contra" value={summary.goalsAgainst} />
          <StatCard label="Aproveit." value={`${summary.winRate}%`} hint={`${summary.points} pts`} />
        </div>
      </section>

      {championship.groups.length > 0 && (
        <section id="classificacao" className="container-x scroll-mt-32 py-10">
          <h2 className="mb-5 font-display text-2xl uppercase md:text-3xl">Classificação</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {championship.groups.map((group) => (
              <GroupStandingsTable key={group.id} championship={championship} group={group} />
            ))}
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-wider text-brand-gray">
            P pontos · J jogos · V vitórias · E empates · D derrotas · SG saldo de gols
          </p>
        </section>
      )}

      {championship.teams.length > 0 && (
        <section id="times" className="container-x scroll-mt-32 py-10">
          <h2 className="mb-5 font-display text-2xl uppercase md:text-3xl">Times</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {championship.teams.map((team) => {
              const group = getTeamGroup(championship, team.id);
              return (
                <div
                  key={team.id}
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-sm border bg-brand-black-2 p-5 text-center",
                    team.isBravura ? "border-brand-red/70" : "border-brand-border"
                  )}
                >
                  <TeamCrest team={team} size={88} />
                  <div className="min-w-0">
                    <p className="break-words font-display text-lg uppercase leading-tight">{team.name}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-brand-gold">{group?.name || "Confirmado"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section id="partidas" className="container-x scroll-mt-32 py-6">
        <h2 className="mb-5 font-display text-2xl uppercase md:text-3xl">Partidas</h2>
        {matches.length === 0 ? (
          <p className="rounded-sm border border-brand-border bg-brand-black-2 p-4 text-sm text-brand-gray">Nenhuma partida cadastrada.</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {matches.map((match) => (
              <ChampionshipMatchCard key={match.id} match={match} championship={championship} />
            ))}
          </div>
        )}
      </section>

      <section id="rankings" className="container-x scroll-mt-32 py-10">
        <h2 className="mb-1 font-display text-2xl uppercase md:text-3xl">Rankings</h2>
        <p className="mb-5 text-sm text-brand-gray">Destaques individuais do Bravura nesta competição. Compartilhe a arte de cada ranking.</p>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {CHAMPIONSHIP_RANKINGS.map((config) => {
            const href = `/campeonatos/${championship.slug}/rankings/${config.slug}`;
            return (
              <RankingPanel
                key={config.slug}
                title={config.title}
                icon={config.icon}
                accent={config.accent}
                unit={config.unit}
                rows={(rankings.get(config.slug) || []).map(({ player, value }) => ({
                  id: player.id,
                  name: player.nickname || player.name,
                  photo: player.photo,
                  number: player.number,
                  position: player.position,
                  href: playerHref(championship, player),
                  value,
                }))}
                shareTitle={config.shareTitle}
                shareSubtitle={shareSubtitle}
                shareUrl={absoluteUrl(href)}
                siteLabel={siteLabel}
                fullRankingHref={href}
              />
            );
          })}
        </div>
      </section>

      <section id="elenco" className="container-x scroll-mt-32 py-10">
        <h2 className="mb-1 font-display text-2xl uppercase md:text-3xl">Elenco do campeonato</h2>
        <p className="mb-5 text-sm text-brand-gray">Números e estatísticas válidos só para esta competição.</p>
        {squad.length === 0 ? (
          <p className="rounded-sm border border-brand-border bg-brand-black-2 p-4 text-sm text-brand-gray">Elenco ainda não divulgado.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {squad.map((player) => (
              <SquadCard key={player.id} player={player} stats={playerStats.get(player.id)} championship={championship} />
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}

function playerHref(championship: Championship, player: ChampionshipPlayer) {
  return `/campeonatos/${championship.slug}/jogadores/${player.id}`;
}

function ChampionshipMatchCard({ match, championship }: { match: ChampionshipMatch; championship: Championship }) {
  const played = match.status === "encerrada" && match.scoreHome !== null && match.scoreAway !== null;
  const result = played ? championshipMatchResult(match) : null;
  const style = result ? RESULT_STYLE[result] : null;
  const opponentTeam = championship.teams.find((team) => team.id === match.opponentTeamId);
  const opponentLogo = getValidImageSrc(opponentTeam?.logo || match.opponentLogo);
  const goals = match.events.filter((event) => event.team === "bravura" && event.type === "gol" && event.playerName.trim());
  const highlight = championship.players.find((player) => player.id === match.highlightPlayerId);
  const hasPenalties = match.penaltiesHome !== null && match.penaltiesAway !== null;

  return (
    <article className={cn("overflow-hidden rounded-sm border bg-brand-black-2", style?.card || "border-brand-border")}>
      <div className="flex items-center justify-between gap-3 border-b border-brand-border px-4 py-2 text-xs">
        <span className="min-w-0 break-words uppercase tracking-wider text-brand-gray">{match.phase || "Partida"}</span>
        {style ? (
          <Badge variant={style.badge}>{style.label}</Badge>
        ) : (
          match.status === "agendada" && <Badge variant="gold">Próximo</Badge>
        )}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 p-4">
        <div className="flex min-w-0 items-center justify-end gap-3">
          <span className="hidden min-w-0 break-words text-right font-display text-lg uppercase sm:block">Bravura</span>
          <Image src={bravuraLogo} alt="Bravura" width={40} height={40} className="h-10 w-10 object-contain" />
        </div>
        <div className="text-center">
          {played ? (
            <>
              <p className="font-display text-3xl font-bold sm:text-4xl">
                {match.scoreHome} <span className="text-brand-gray">×</span> {match.scoreAway}
              </p>
              {hasPenalties && (
                <p className="text-[10px] uppercase tracking-wider text-brand-gold">
                  Pênaltis {match.penaltiesHome} × {match.penaltiesAway}
                </p>
              )}
            </>
          ) : (
            <p className="font-display text-xl">{formatTime(match.date)}</p>
          )}
        </div>
        <div className="flex min-w-0 items-center gap-3">
          {opponentLogo ? (
            <Image src={opponentLogo} alt={match.opponent} width={40} height={40} className="h-10 w-10 object-contain" />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-brand-border bg-brand-black text-xs font-bold text-brand-gray">
              {getInitials(match.opponent)}
            </div>
          )}
          <span className="hidden min-w-0 break-words font-display text-lg uppercase sm:block">{match.opponent}</span>
        </div>
      </div>
      <p className="px-4 text-center text-sm font-semibold uppercase sm:hidden">Bravura × {match.opponent}</p>
      <div className="flex flex-wrap justify-between gap-1 px-4 pb-3 text-xs text-brand-gray">
        <span>{formatDateLong(match.date)}</span>
        <span className="break-words text-right">{match.location}</span>
      </div>
      {played && (goals.length > 0 || highlight) && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-brand-border/80 px-4 py-3">
          {goals.map((goal, index) => {
            const scorer = championship.players.find((player) => player.id === goal.playerId);
            const label = `${goal.playerName}${goal.minute > 0 ? ` ${goal.minute}'` : ""}`;
            const className = "rounded-full border border-brand-border bg-white/5 px-2 py-1 text-[11px] font-semibold text-brand-white/85";
            return scorer ? (
              <Link key={index} href={playerHref(championship, scorer)} className={cn(className, "hover:border-brand-gold")}>
                ⚽ {label}
              </Link>
            ) : (
              <span key={index} className={className}>
                ⚽ {label}
              </span>
            );
          })}
          {highlight && (
            <Link
              href={playerHref(championship, highlight)}
              className="inline-flex items-center gap-1 rounded-full border border-brand-gold/50 px-2 py-1 text-[11px] font-semibold text-brand-gold"
            >
              <Sparkles className="h-3 w-3" /> Craque: {highlight.nickname || highlight.name}
            </Link>
          )}
        </div>
      )}
    </article>
  );
}

function SquadCard({
  player,
  stats,
  championship,
}: {
  player: ChampionshipPlayer;
  stats?: ChampionshipPlayerStats;
  championship: Championship;
}) {
  const photo = getValidImageSrc(player.photo);
  return (
    <Link
      href={playerHref(championship, player)}
      className="group block overflow-hidden rounded-sm border border-brand-border bg-brand-black-2 transition-colors hover:border-brand-red"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-brand-red/20 via-brand-black to-brand-black-2">
        {photo && (
          <Image
            src={photo}
            alt={player.name}
            fill
            sizes="(max-width: 768px) 50vw, 200px"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/30 to-transparent" />
        <span className="absolute right-2 top-2 font-display text-4xl font-bold leading-none text-brand-gold drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
          {player.number || ""}
        </span>
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-gold">{player.position}</p>
          <p className="break-words font-display text-base uppercase leading-tight">{player.nickname || player.name}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-brand-border text-center">
        <div className="py-1.5">
          <p className="text-[9px] uppercase text-brand-gray">J</p>
          <p className="text-sm font-bold">{stats?.games ?? 0}</p>
        </div>
        <div className="border-x border-brand-border py-1.5">
          <p className="text-[9px] uppercase text-brand-gray">G</p>
          <p className="text-sm font-bold text-brand-red">{stats?.goals ?? 0}</p>
        </div>
        <div className="py-1.5">
          <p className="text-[9px] uppercase text-brand-gray">A</p>
          <p className="text-sm font-bold text-brand-gold">{stats?.assists ?? 0}</p>
        </div>
      </div>
    </Link>
  );
}
