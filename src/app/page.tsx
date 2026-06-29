import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Gamepad2, Handshake, MapPin, Sparkles, Target, Trophy } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { StatCard } from "@/components/site/StatCard";
import { MatchCard } from "@/components/site/MatchCard";
import { NewsCard } from "@/components/site/NewsCard";
import { SponsorGrid } from "@/components/site/SponsorGrid";
import { RankingShareModal } from "@/components/site/RankingShareModal";
import { Button } from "@/components/ui/button";
import { clubInfo } from "@/data/club";
import { getCmsData } from "@/lib/cms-store";
import { bravuraLogo } from "@/lib/asset-url";
import { getInitials, getValidImageSrc } from "@/lib/image-utils";
import { getPlayerRankings, getTeamStats } from "@/lib/cms-stats";
import { absoluteUrl, siteUrl } from "@/lib/site-url";
import { formatDateLong, formatTime } from "@/lib/utils";
import type { Match, Player } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Bravura Esporte Clube — Site Oficial",
  description:
    "Site oficial do Bravura EC de Bugre-MG. Acompanhe o elenco do Bravura, os jogos do Bravura, estatísticas, galeria e a história do Bravura Futebol Clube.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const { matches, news, gallery, players, sponsors } = await getCmsData();
  const next = matches
    .filter((m) => m.status === "agendada")
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];
  const last = matches
    .filter((m) => m.status === "encerrada")
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
  const latestNews = news.slice(0, 3);
  const homeGallery = gallery.slice(0, 6);
  const teamStats = getTeamStats(matches);
  const { topScorers, topAssists, topGames, topGoalParticipations } = getPlayerRankings(players);
  const topHighlights = getTopHighlights(players, matches);
  const tickerMatches = [...matches].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const rankingShareUrl = absoluteUrl("/estatisticas");
  const siteLabel = new URL(siteUrl).hostname.replace(/^www\./, "");

  return (
    <SiteShell>
      <section className="relative diag-section overflow-hidden">
        <div className="container-x py-16 md:py-24 grid lg:grid-cols-[minmax(0,1fr)_auto] items-center gap-10">
          <div className="relative z-10 min-w-0">
            <p className="text-brand-gold uppercase tracking-[0.3em] text-xs mb-4 font-semibold">
              Portal Oficial · Temporada 2026
            </p>
            <h1 className="break-words font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl uppercase leading-none mb-6">
              Bravura <span className="text-brand-red">EC</span>
            </h1>
            <p className="break-words text-lg md:text-xl text-brand-white/80 max-w-xl mb-2 italic">
              &ldquo;{clubInfo.motto}&rdquo;
            </p>
            <p className="break-words text-sm text-brand-gray max-w-xl mb-8">
              Fundado em {clubInfo.founded} em Bugre, MG — o Bravura Futebol nasce para resgatar talentos e fortalecer o futebol local. No site oficial do Bravura você acompanha o elenco do Bravura, os jogos do Bravura EC, a galeria e a história do Bravura Esporte Clube.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/jogos">
                <Button variant="primary" size="lg">
                  Próximos jogos <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/loja">
                <Button variant="gold" size="lg">
                  Loja oficial
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <Image
              src={bravuraLogo}
              alt="Escudo Bravura Esporte Clube"
              width={360}
              height={360}
              className="h-80 w-80 object-contain drop-shadow-[0_0_60px_rgba(200,16,46,0.4)]"
              priority
            />
          </div>
        </div>
      </section>

      <MatchTicker matches={tickerMatches} />

      <section className="container-x py-14">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="min-w-0 bg-brand-black-2 border border-brand-border rounded-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 text-brand-gold text-xs uppercase tracking-widest font-semibold mb-4">
              <Calendar className="w-4 h-4" />
              Próximo jogo
            </div>
            {next ? (
              <HomeMatchSummaryCard match={next} actionLabel="Detalhes da partida" />
            ) : (
              <p className="text-brand-gray text-sm">Nenhum jogo agendado no momento.</p>
            )}
          </div>

          <div className="min-w-0 bg-brand-black-2 border border-brand-border rounded-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 text-brand-gold text-xs uppercase tracking-widest font-semibold mb-4">
              <Trophy className="w-4 h-4" />
              Último resultado
            </div>
            {last && (
              <HomeMatchSummaryCard
                match={last}
                actionLabel="Ver resumo"
                highlight={players.find((player) => player.id === last.highlightPlayerId)}
              />
            )}
          </div>
        </div>
      </section>

      <section className="diag-section py-14">
        <div className="container-x">
          <SectionHeader eyebrow="Temporada" title="Destaques do ano" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Jogos" value={teamStats.games} />
            <StatCard label="Vitórias" value={teamStats.wins} accent="red" />
            <StatCard label="Gols" value={teamStats.goalsFor} accent="gold" />
            <StatCard label="Aproveitamento" value={`${teamStats.winRate}%`} accent="red" />
          </div>
        </div>
      </section>

      <section id="rankings" className="container-x py-14 scroll-mt-24">
        <SectionHeader eyebrow="Rankings" title="Destaques individuais" />
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          <RankingPanel title="Artilheiros" shareTitle="Top Artilheiros" icon="goals" rows={topScorers.map((player) => ({ player, value: player.stats.goals, label: "gols" }))} shareUrl={rankingShareUrl} siteLabel={siteLabel} fullRankingHref="/rankings/artilheiros" />
          <RankingPanel title="Assistentes" shareTitle="Top Assistências" icon="assists" rows={topAssists.map((player) => ({ player, value: player.stats.assists, label: "assist." }))} shareUrl={rankingShareUrl} siteLabel={siteLabel} fullRankingHref="/rankings/assistentes" />
          <RankingPanel title="Part. em gols" shareTitle="Top Participações em Gol" icon="participations" rows={topGoalParticipations.map((player) => ({ player, value: player.stats.goals + player.stats.assists, label: "part." }))} shareUrl={rankingShareUrl} siteLabel={siteLabel} fullRankingHref="/rankings/participacoes" />
          <RankingPanel title="Mais jogos" shareTitle="Mais Jogos" icon="games" rows={topGames.map((player) => ({ player, value: player.stats.games, label: "jogos" }))} shareUrl={rankingShareUrl} siteLabel={siteLabel} showZeroValues fullRankingHref="/rankings/jogos" />
          <RankingPanel title="Craques do jogo" shareTitle="Craques do Jogo" icon="stars" rows={topHighlights.map(({ player, count }) => ({ player, value: count, label: "vezes" }))} shareUrl={rankingShareUrl} siteLabel={siteLabel} fullRankingHref="/rankings/craques" />
        </div>
      </section>

      <section className="diag-section py-14">
        <div className="container-x">
          <SectionHeader eyebrow="Galeria" title="Momentos do Bravura">
            <Link href="/galeria">
              <Button variant="outline" size="sm">Ver tudo</Button>
            </Link>
          </SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {homeGallery.map((g) => {
              const mediaSrc = getValidImageSrc(g.src);
              const isVideo = g.mediaType === "video";
              if (!mediaSrc && !isVideo) return null;
              return (
                <Link
                  key={g.id}
                  href="/galeria"
                  className="relative aspect-square bg-brand-black rounded-sm overflow-hidden group"
                >
                  {isVideo ? (
                    <video src={g.src} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <Image
                      src={mediaSrc!}
                      alt={g.caption}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black/70 to-transparent" />
                  <p className="absolute bottom-2 left-3 right-3 line-clamp-2 break-words text-xs font-semibold">{g.caption}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-x py-14">
        <SectionHeader eyebrow="Notícias" title="Tudo sobre o Bravura">
          <Link href="/noticias">
            <Button variant="outline" size="sm">Ver todas</Button>
          </Link>
        </SectionHeader>
        <div className="grid md:grid-cols-3 gap-5">
          {latestNews.map((n) => (
            <NewsCard key={n.id} item={n} />
          ))}
        </div>
      </section>

      {next && (
        <section className="container-x py-8">
          <MatchCard match={next} />
        </section>
      )}

      <section className="diag-section py-14">
        <div className="container-x">
          <SectionHeader eyebrow="Patrocinadores" title="Quem está com a gente" />
          <SponsorGrid list={sponsors} />
        </div>
      </section>

      <section className="container-x py-16">
        <div className="relative overflow-hidden rounded-sm border border-brand-gold/40 bg-gradient-to-r from-brand-black-2 via-brand-red/20 to-brand-black-2 p-8 md:p-14 text-center">
          <p className="text-brand-gold uppercase tracking-widest text-xs mb-3">Loja oficial</p>
          <h2 className="font-display text-3xl md:text-5xl uppercase mb-4">
            Vista o manto bravurense
          </h2>
          <p className="text-brand-white/80 max-w-2xl mx-auto mb-6">
            Camisas oficiais, uniformes de treino, acessórios e produtos exclusivos do clube. Entrega para todo o Brasil.
          </p>
          <Link href="/loja">
            <Button variant="gold" size="lg">
              Comprar agora <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}

function HomeMatchSummaryCard({
  match,
  actionLabel,
  highlight,
}: {
  match: Match;
  actionLabel: string;
  highlight?: Player;
}) {
  const opponentLogo = getValidImageSrc(match.opponentLogo);
  const highlightPhoto = getValidImageSrc(match.highlightPhoto) || getValidImageSrc(highlight?.photo);
  const showHighlight = match.status === "encerrada" && (highlight || highlightPhoto || match.highlightQuote);
  const goalEvents = match.events.filter((event) => event.type === "gol" && event.playerName.trim());
  const showGoals = match.status === "encerrada";

  return (
    <div className="overflow-hidden rounded-sm border border-brand-border bg-[radial-gradient(circle_at_top,rgba(200,16,46,0.16),transparent_42%)]">
      <div className="flex items-center justify-between gap-3 border-b border-brand-border px-4 py-2 text-xs">
        <div className="min-w-0">
          <span className="block break-words uppercase tracking-wider text-brand-gray">{match.competition}</span>
          <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-brand-white/40">{match.homeAway === "casa" ? "Casa" : "Fora"}</span>
        </div>
        <span className="rounded-full border border-brand-gold/50 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold">
          {match.status === "encerrada" ? "Encerrada" : "Agendada"}
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 p-4 sm:p-5">
        <div className="min-w-0 text-center">
          <Image src={bravuraLogo} alt="Bravura Futebol Clube" width={60} height={60} className="mx-auto h-[60px] w-[60px] object-contain" />
          <p className="mt-1 truncate text-xs uppercase text-brand-gray">Bravura</p>
        </div>
        <div className="shrink-0 text-center">
          {match.status === "encerrada" ? (
            <div className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">
              {match.scoreHome} <span className="text-brand-gray">×</span> {match.scoreAway}
            </div>
          ) : (
            <div>
              <p className="font-display text-2xl uppercase">VS</p>
              <p className="text-[10px] uppercase tracking-widest text-brand-gold">{formatTime(match.date)}</p>
            </div>
          )}
        </div>
        <div className="min-w-0 text-center">
          {opponentLogo ? (
            <Image src={opponentLogo} alt={match.opponent} width={60} height={60} className="mx-auto h-14 w-14 object-contain" />
          ) : (
            <div className="mx-auto h-14 w-14 rounded-sm bg-brand-black" />
          )}
          <p className="mt-1 truncate text-xs uppercase text-brand-gray">{match.opponent}</p>
        </div>
      </div>

      <div className="space-y-2 px-4 pb-4 text-sm text-brand-white/80">
        <p className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-brand-red" />
          {formatDateLong(match.date)} · {formatTime(match.date)}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-brand-red" />
          <span className="min-w-0 break-words">{match.location}</span>
        </p>
      </div>

      {showGoals && (
        <div className="border-t border-brand-border/80 px-4 py-3">
          {goalEvents.length > 0 ? (
            <div className="rounded-sm bg-brand-black/55 px-3 py-2">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold">Gols da partida</p>
              <div className="flex flex-wrap gap-1.5">
                {goalEvents.map((goal, index) => (
                  <span
                    key={`${goal.team}-${goal.playerName}-${goal.minute}-${index}`}
                    className="rounded-full border border-brand-border bg-white/5 px-2 py-1 text-[11px] font-semibold text-brand-white/85"
                  >
                    {goal.playerName}{goal.minute > 0 ? ` ${goal.minute}'` : ""}
                    <span className="ml-1 text-brand-gray">{goal.team === "bravura" ? "Bravura" : match.opponent}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] uppercase tracking-wider text-brand-gray">Gols ainda não registrados.</p>
          )}
        </div>
      )}

      {showHighlight && (
        <div className="border-t border-brand-border/80 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3 rounded-sm border border-brand-gold/40 bg-brand-black/55 p-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-brand-gold/50 bg-brand-black">
              {highlightPhoto ? (
                <Image src={highlightPhoto} alt={highlight?.name || "Craque do jogo"} fill sizes="56px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-lg text-brand-gold/60">*</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Craque do jogo</p>
              <p className="truncate font-display text-xl uppercase leading-tight">{highlight?.nickname || highlight?.name || "Destaque da partida"}</p>
              {match.highlightQuote && <p className="mt-1 line-clamp-2 break-words text-xs italic text-brand-gray">&ldquo;{match.highlightQuote}&rdquo;</p>}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        <Link href={`/jogos/${match.id}`}>
          <Button variant={match.status === "encerrada" ? "outline" : "primary"} size="sm">
            {actionLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function MatchTicker({ matches }: { matches: Match[] }) {
  if (matches.length === 0) return null;

  const tickerItems = matches.length > 1 ? [...matches, ...matches] : matches;

  return (
    <section className="border-y border-brand-border bg-brand-black-2/80 py-3 overflow-hidden">
      <div className="mb-2 flex items-center justify-between gap-3 px-4 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gold md:px-8">
        <span>Jogos do Bravura</span>
        <Link href="/jogos" className="text-brand-white/60 hover:text-brand-white">Ver todos</Link>
      </div>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-brand-black-2 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-brand-black-2 to-transparent" />
        <div className={`flex w-max gap-3 px-4 md:px-8 ${matches.length > 1 ? "animate-match-ticker" : ""}`}>
          {tickerItems.map((match, index) => (
            <TickerMatchCard key={`${match.id}-${index}`} match={match} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TickerMatchCard({ match }: { match: Match }) {
  const opponentLogo = getValidImageSrc(match.opponentLogo);

  return (
    <Link
      href={`/jogos/${match.id}`}
      className="grid w-36 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-sm border border-brand-border bg-brand-black px-3 py-2 transition-colors hover:border-brand-gold/70 sm:w-40"
    >
      <div className="min-w-0">
        <Image src={bravuraLogo} alt="Bravura" width={34} height={34} className="mx-auto h-8 w-8 object-contain" />
      </div>
      <div className="text-center font-display text-lg font-bold text-brand-white">
        {match.status === "encerrada" ? (
          <span>{match.scoreHome} <span className="text-brand-red">×</span> {match.scoreAway}</span>
        ) : (
          <span className="text-brand-gold">VS</span>
        )}
      </div>
      <div className="min-w-0">
        {opponentLogo ? (
          <Image src={opponentLogo} alt={match.opponent} width={34} height={34} className="mx-auto h-8 w-8 object-contain" />
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-sm border border-brand-border bg-brand-black-2 text-[10px] font-bold text-brand-gray">
            {match.opponent.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    </Link>
  );
}

function RankingPanel({
  title,
  shareTitle,
  icon,
  rows,
  shareUrl,
  siteLabel,
  showZeroValues = false,
  fullRankingHref,
}: {
  title: string;
  shareTitle: string;
  icon: "goals" | "assists" | "games" | "stars" | "participations";
  rows: Array<{ player: Player; value: number; label: string }>;
  shareUrl: string;
  siteLabel: string;
  showZeroValues?: boolean;
  fullRankingHref: string;
}) {
  const Icon = icon === "goals" ? Trophy : icon === "assists" ? Handshake : icon === "games" ? Gamepad2 : icon === "participations" ? Target : Sparkles;
  const accent = icon === "goals" || icon === "stars" || icon === "participations" ? "text-brand-red" : "text-brand-gold";
  const rankedRows = showZeroValues ? rows : rows.filter((row) => row.value > 0);
  const visibleRows = rankedRows.slice(0, 4);
  const shareItems = rankedRows
    .slice(0, 5)
    .map((row) => ({
      id: row.player.id,
      name: row.player.nickname || row.player.name,
      photo: getValidImageSrc(row.player.photo) || undefined,
      value: row.value,
      label: row.label,
    }));

  return (
    <div className="min-w-0 overflow-hidden rounded-sm border border-brand-border bg-brand-black-2">
      <div className="space-y-3 border-b border-brand-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${accent}`} />
          <h3 className="font-display text-lg uppercase tracking-wide">{title}</h3>
        </div>
        <RankingShareModal title={shareTitle} subtitle="Temporada 2026" items={shareItems} shareUrl={shareUrl} siteLabel={siteLabel} />
      </div>
      <div className="divide-y divide-brand-border">
        {visibleRows.length > 0 ? (
          visibleRows.map((row, index) => (
            <Link
              key={row.player.id}
              href={`/elenco/${row.player.slug}`}
              className="flex min-w-0 items-center gap-3 p-3 transition-colors hover:bg-white/5"
            >
              <span className="w-6 shrink-0 text-center font-display text-lg text-brand-gold">{index + 1}</span>
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-black">
                {getValidImageSrc(row.player.photo) ? (
                  <Image src={getValidImageSrc(row.player.photo)!} alt={row.player.name} fill sizes="40px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-brand-gold">
                    {getInitials(row.player.nickname || row.player.name)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display uppercase leading-tight">{row.player.nickname || row.player.name}</p>
                <p className="truncate text-[10px] uppercase text-brand-gray">#{row.player.number} · {row.player.position}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`font-display text-2xl font-bold leading-none ${accent}`}>{row.value}</p>
                <p className="text-[9px] uppercase text-brand-gray">{row.label}</p>
              </div>
            </Link>
          ))
        ) : (
          <p className="p-4 text-sm text-brand-gray">Sem dados registrados.</p>
        )}
      </div>
      <Link
        href={fullRankingHref}
        className="flex items-center justify-center gap-1.5 border-t border-brand-border px-4 py-3 text-xs font-semibold uppercase tracking-widest text-brand-gray transition-colors hover:bg-white/5 hover:text-brand-white"
      >
        Ver mais
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function getTopHighlights(players: Player[], matches: Match[]) {
  const counts = new Map<string, number>();

  for (const match of matches) {
    if (match.status !== "encerrada" || !match.highlightPlayerId) continue;
    counts.set(match.highlightPlayerId, (counts.get(match.highlightPlayerId) || 0) + 1);
  }

  return players
    .map((player) => ({ player, count: counts.get(player.id) || 0 }))
    .sort((a, b) => b.count - a.count || a.player.nickname.localeCompare(b.player.nickname))
    .slice(0, 5);
}

function SectionHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <p className="text-brand-gold uppercase tracking-[0.3em] text-[10px] font-semibold mb-1">
          {eyebrow}
        </p>
        <h2 className="break-words font-display text-3xl md:text-4xl uppercase">{title}</h2>
      </div>
      {children}
    </div>
  );
}
