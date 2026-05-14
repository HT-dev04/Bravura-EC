"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StatCard } from "@/components/site/StatCard";
import { RankingShareModal } from "@/components/site/RankingShareModal";
import { assetUrl } from "@/lib/asset-url";
import { getPlayerRankings, getTeamStats } from "@/lib/cms-stats";
import { getValidImageSrc } from "@/lib/image-utils";
import { formatDate } from "@/lib/utils";
import type { Match, Player, PlayerStats } from "@/types";
import { StatsCharts } from "./StatsCharts";

type FilterType = "total" | "mes" | "temporada" | "campeonato";

const emptyPlayerStats: PlayerStats = {
  games: 0,
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  minutes: 0,
};

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function isFinishedForStats(match: Match) {
  return match.scoreHome !== null && match.scoreAway !== null && new Date(match.date).getTime() <= Date.now();
}

function formatMonth(value: string) {
  const [year, month] = value.split("-");
  const monthIndex = Number(month) - 1;
  return `${monthNames[monthIndex] || month} de ${year}`;
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => b.localeCompare(a));
}

function resolvePlayerPhoto(photo: string) {
  if (!photo) return undefined;
  return getValidImageSrc(photo) || getValidImageSrc(assetUrl(photo)) || undefined;
}

function normalizePlayerName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchFilterLabel(type: FilterType, value: string) {
  if (type === "total") return "Total geral";
  if (type === "mes") return value ? formatMonth(value) : "Todos os meses";
  if (type === "temporada") return value ? `Temporada ${value}` : "Todas as temporadas";
  return value || "Todos os campeonatos";
}

function filterMatches(matches: Match[], type: FilterType, value: string) {
  return matches.filter((match) => {
    if (!isFinishedForStats(match)) return false;
    if (type === "mes") return value ? match.date.startsWith(value) : true;
    if (type === "temporada") return value ? match.season === value : true;
    if (type === "campeonato") return value ? match.competition === value : true;
    return true;
  });
}

function buildFilteredPlayers(players: Player[], matches: Match[]) {
  const statsByPlayer = new Map<string, PlayerStats>();
  const nameToId = new Map<string, string>();
  const virtualPlayers = new Map<string, Player>();

  for (const player of players) {
    statsByPlayer.set(player.id, { ...emptyPlayerStats, games: player.stats.games, minutes: player.stats.minutes });
    nameToId.set(normalizePlayerName(player.name), player.id);
    if (player.nickname) nameToId.set(normalizePlayerName(player.nickname), player.id);
  }

  function statFor(playerId: string) {
    const stats = statsByPlayer.get(playerId);
    if (!stats) return null;
    return stats;
  }

  function eventPlayerId(playerId: string, playerName: string) {
    if (playerId && statsByPlayer.has(playerId)) return playerId;
    const normalizedName = normalizePlayerName(playerName);
    if (!normalizedName) return "";
    const existingId = nameToId.get(normalizedName);
    if (existingId) return existingId;

    const virtualId = `evento-${normalizedName.replace(/\s+/g, "-")}`;
    if (!statsByPlayer.has(virtualId)) {
      statsByPlayer.set(virtualId, { ...emptyPlayerStats });
      virtualPlayers.set(virtualId, {
        id: virtualId,
        slug: "",
        name: playerName.trim(),
        nickname: playerName.trim(),
        number: 0,
        position: "Atacante",
        birthDate: "",
        height: 0,
        weight: 0,
        preferredFoot: "Direito",
        photo: "",
        bio: "Jogador informado no evento da partida.",
        season: "",
        stats: { ...emptyPlayerStats },
        history: [],
        monthlyGoals: [],
      });
    }
    return virtualId;
  }

  for (const match of matches) {
    for (const event of match.events) {
      if (event.team !== "bravura") continue;

      const playerId = eventPlayerId(event.playerId, event.playerName);
      const stats = statFor(playerId);
      if (!stats) continue;

      if (event.type === "gol") stats.goals += 1;
      if (event.type === "assistencia") stats.assists += 1;
      if (event.type === "cartao_amarelo") stats.yellowCards += 1;
      if (event.type === "cartao_vermelho") stats.redCards += 1;
    }
  }

  return [
    ...players.map((player) => ({ ...player, stats: statsByPlayer.get(player.id) || { ...emptyPlayerStats } })),
    ...Array.from(virtualPlayers.values()).map((player) => ({ ...player, stats: statsByPlayer.get(player.id) || { ...emptyPlayerStats } })),
  ];
}

export function StatsExplorer({ players, matches, shareUrl, siteLabel }: { players: Player[]; matches: Match[]; shareUrl: string; siteLabel: string }) {
  const [filterType, setFilterType] = useState<FilterType>("total");
  const [filterValue, setFilterValue] = useState("");

  const months = useMemo(() => uniqueValues(matches.map((match) => match.date.slice(0, 7))), [matches]);
  const seasons = useMemo(() => uniqueValues(matches.map((match) => match.season)), [matches]);
  const competitions = useMemo(() => uniqueValues(matches.map((match) => match.competition)), [matches]);

  const valueOptions = filterType === "mes" ? months : filterType === "temporada" ? seasons : filterType === "campeonato" ? competitions : [];
  const filteredMatches = useMemo(() => filterMatches(matches, filterType, filterValue), [matches, filterType, filterValue]);
  const teamStats = useMemo(() => getTeamStats(filteredMatches), [filteredMatches]);
  const filteredPlayers = useMemo(() => buildFilteredPlayers(players, filteredMatches), [players, filteredMatches]);
  const { topScorers, topAssists, topGames, topGoalParticipations } = getPlayerRankings(filteredPlayers);
  const topYellowCards = [...filteredPlayers].sort((a, b) => b.stats.yellowCards - a.stats.yellowCards).slice(0, 5);
  const topRedCards = [...filteredPlayers].sort((a, b) => b.stats.redCards - a.stats.redCards).slice(0, 5);
  const rankingSubtitle = matchFilterLabel(filterType, filterValue);

  function changeFilterType(nextType: FilterType) {
    setFilterType(nextType);
    setFilterValue("");
  }

  return (
    <>
      <section className="container-x py-8">
        <div className="grid gap-3 rounded-sm border border-brand-border bg-brand-black-2 p-4 md:grid-cols-[1fr_220px_260px] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-brand-gold">Filtros</p>
            <h2 className="mt-1 font-display text-2xl uppercase text-white">Recorte das estatísticas</h2>
            <p className="mt-1 text-sm text-brand-gray">
              Os números, rankings, gráficos e jogos abaixo mudam conforme o filtro selecionado.
            </p>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-brand-gray font-medium">Tipo</label>
            <select
              className="mt-1 w-full rounded-sm border border-brand-border bg-brand-black px-3 py-2 text-sm text-white focus:border-brand-red focus:outline-none"
              value={filterType}
              onChange={(event) => changeFilterType(event.target.value as FilterType)}
            >
              <option value="total">Total</option>
              <option value="mes">Por mês</option>
              <option value="temporada">Temporada</option>
              <option value="campeonato">Campeonato</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-brand-gray font-medium">Filtro</label>
            <select
              className="mt-1 w-full rounded-sm border border-brand-border bg-brand-black px-3 py-2 text-sm text-white focus:border-brand-red focus:outline-none disabled:opacity-50"
              value={filterValue}
              disabled={filterType === "total"}
              onChange={(event) => setFilterValue(event.target.value)}
            >
              <option value="">{filterType === "total" ? "Total geral" : "Todos"}</option>
              {valueOptions.map((option) => (
                <option key={option} value={option}>{filterType === "mes" ? formatMonth(option) : option}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs uppercase tracking-wider text-brand-gray">
          Exibindo: <span className="text-brand-gold">{matchFilterLabel(filterType, filterValue)}</span>
        </p>
      </section>

      <section className="container-x py-6">
        <div className="grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Jogos" value={teamStats.games} />
          <StatCard label="Vitórias" value={teamStats.wins} accent="red" />
          <StatCard label="Empates" value={teamStats.draws} accent="gold" />
          <StatCard label="Derrotas" value={teamStats.losses} />
          <StatCard label="Gols pró" value={teamStats.goalsFor} accent="red" />
          <StatCard label="Gols contra" value={teamStats.goalsAgainst} />
        </div>
        <div className="grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <StatCard label="Aproveitamento" value={`${teamStats.winRate}%`} accent="gold" />
          <StatCard label="Saldo" value={teamStats.goalsFor - teamStats.goalsAgainst} accent="red" />
          <StatCard label="Média de gols" value={(teamStats.goalsFor / Math.max(1, teamStats.games)).toFixed(2)} />
          <StatCard label="Clean sheets" value={teamStats.cleanSheets} accent="gold" />
        </div>
      </section>

      <section className="container-x py-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Ranking title="Artilheiros" shareTitle="Top Artilheiros" valueLabel="gols" items={topScorers} getValue={(p) => p.stats.goals} subtitle={rankingSubtitle} shareUrl={shareUrl} siteLabel={siteLabel} />
        <Ranking title="Assistências" shareTitle="Top Assistências" valueLabel="assistências" items={topAssists} getValue={(p) => p.stats.assists} subtitle={rankingSubtitle} shareUrl={shareUrl} siteLabel={siteLabel} />
        <Ranking title="Mais jogos" shareTitle="Mais Jogos" valueLabel="jogos" items={topGames} getValue={(p) => p.stats.games} subtitle={rankingSubtitle} shareUrl={shareUrl} siteLabel={siteLabel} showZeroValues />
        <Ranking title="Part. em gol" shareTitle="Top Participações em Gol" valueLabel="participações" items={topGoalParticipations} getValue={(p) => p.stats.goals + p.stats.assists} subtitle={rankingSubtitle} shareUrl={shareUrl} siteLabel={siteLabel} />
        <Ranking title="Cartões amarelos" shareTitle="Cartões Amarelos" valueLabel="cartões" items={topYellowCards} getValue={(p) => p.stats.yellowCards} subtitle={rankingSubtitle} shareUrl={shareUrl} siteLabel={siteLabel} />
        <Ranking title="Cartões vermelhos" shareTitle="Cartões Vermelhos" valueLabel="cartões" items={topRedCards} getValue={(p) => p.stats.redCards} subtitle={rankingSubtitle} shareUrl={shareUrl} siteLabel={siteLabel} />
      </section>

      <section className="container-x py-10 grid lg:grid-cols-2 gap-6">
        <StatsCharts teamStats={teamStats} />
      </section>

      <section className="container-x py-10 pb-20">
        <div className="rounded-sm border border-brand-border bg-brand-black-2">
          <div className="border-b border-brand-border p-4">
            <h3 className="font-display uppercase text-sm tracking-wider text-brand-gold">Jogos considerados</h3>
            <p className="mt-1 text-sm text-brand-gray">Só entram partidas com placar cadastrado e data já passada.</p>
          </div>
          <div className="divide-y divide-brand-border">
            {filteredMatches.length === 0 ? (
              <p className="p-5 text-sm text-brand-gray">Nenhum jogo encontrado para este filtro.</p>
            ) : filteredMatches.map((match) => (
              <Link key={match.id} href={`/jogos/${match.id}`} className="grid gap-2 p-4 transition-colors hover:bg-white/[0.03] md:grid-cols-[130px_1fr_120px_160px] md:items-center">
                <span className="text-xs uppercase tracking-wider text-brand-gray">{formatDate(match.date)}</span>
                <span className="font-semibold text-white">Bravura x {match.opponent}</span>
                <span className="font-display text-xl text-brand-gold">{match.scoreHome} × {match.scoreAway}</span>
                <span className="text-xs uppercase tracking-wider text-brand-gray">{match.competition}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Ranking({
  title,
  shareTitle,
  valueLabel,
  items,
  getValue,
  subtitle,
  shareUrl,
  siteLabel,
  showZeroValues = false,
}: {
  title: string;
  shareTitle: string;
  valueLabel: string;
  items: Player[];
  getValue: (p: Player) => number;
  subtitle: string;
  shareUrl: string;
  siteLabel: string;
  showZeroValues?: boolean;
}) {
  const rankedItems = (showZeroValues ? items : items.filter((item) => getValue(item) > 0)).slice(0, 5);
  const shareItems = rankedItems.map((player) => ({
    id: player.id,
    name: player.nickname || player.name,
    photo: resolvePlayerPhoto(player.photo),
    value: getValue(player),
    label: valueLabel,
  }));

  return (
    <div className="bg-brand-black-2 border border-brand-border rounded-sm">
      <div className="flex flex-col gap-3 p-4 border-b border-brand-border">
        <h3 className="font-display uppercase text-sm tracking-wider text-brand-gold">{title}</h3>
        <RankingShareModal title={shareTitle} subtitle={subtitle} items={shareItems} shareUrl={shareUrl} siteLabel={siteLabel} />
      </div>
      <ul className="divide-y divide-brand-border">
        {rankedItems.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-brand-gray">Sem dados neste filtro.</li>
        ) : rankedItems.map((p, i) => (
          <li key={p.id} className="px-4 py-3 flex min-w-0 items-center gap-3">
            <span className="w-5 shrink-0 font-display text-brand-gray">{i + 1}</span>
            <div className="relative w-9 h-9 shrink-0 rounded-full bg-brand-black overflow-hidden">
              {getValidImageSrc(p.photo) && <Image src={getValidImageSrc(p.photo)!} alt={p.name} fill sizes="36px" className="object-cover" />}
            </div>
              {p.slug ? (
                <Link href={`/elenco/${p.slug}`} className="min-w-0 flex-1 break-words text-sm font-semibold hover:text-brand-gold">
                  {p.nickname || p.name}
                </Link>
              ) : (
                <span className="min-w-0 flex-1 break-words text-sm font-semibold text-white">{p.nickname || p.name}</span>
              )}
            <span className="font-display text-xl font-bold text-brand-red">{getValue(p)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
