import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";
import { StatCard } from "@/components/site/StatCard";
import { getCmsData } from "@/lib/cms-store";
import { getPlayerRankings } from "@/lib/cms-stats";
import { StatsCharts } from "./StatsCharts";
import type { Player } from "@/types";
import { getValidImageSrc } from "@/lib/image-utils";

export const metadata: Metadata = {
  title: "Estatísticas",
  description:
    "Estatísticas completas do Bravura EC na temporada: artilheiros, assistências, aproveitamento e rankings dos jogadores do Bravura Futebol Clube.",
  alternates: { canonical: "/estatisticas" },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EstatisticasPage() {
  const { players, teamStats } = await getCmsData();
  const { topScorers, topAssists, topGames, topGoalParticipations } = getPlayerRankings(players);

  return (
    <SiteShell>
      <section className="diag-section py-14">
        <div className="container-x">
          <p className="text-brand-gold uppercase tracking-[0.3em] text-[10px] font-semibold mb-2">
            Estatísticas
          </p>
          <h1 className="break-words font-display text-4xl md:text-6xl uppercase">Os números do Bravura</h1>
        </div>
      </section>

      <section className="container-x py-10">
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
          <StatCard
            label="Média de gols"
            value={(teamStats.goalsFor / Math.max(1, teamStats.games)).toFixed(2)}
          />
          <StatCard label="Clean sheets" value={teamStats.cleanSheets} accent="gold" />
        </div>
      </section>

      <section className="container-x py-10 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Ranking title="Artilheiros" items={topScorers} getValue={(p) => p.stats.goals} />
        <Ranking title="Assistências" items={topAssists} getValue={(p) => p.stats.assists} />
        <Ranking title="Mais jogos" items={topGames} getValue={(p) => p.stats.games} />
        <Ranking
          title="Part. em gol"
          items={topGoalParticipations}
          getValue={(p) => p.stats.goals + p.stats.assists}
        />
      </section>

      <section className="container-x py-10 grid lg:grid-cols-2 gap-6">
        <StatsCharts teamStats={teamStats} />
      </section>
    </SiteShell>
  );
}

function Ranking({
  title,
  items,
  getValue,
}: {
  title: string;
  items: Player[];
  getValue: (p: Player) => number;
}) {
  return (
    <div className="bg-brand-black-2 border border-brand-border rounded-sm">
      <div className="p-4 border-b border-brand-border">
        <h3 className="font-display uppercase text-sm tracking-wider text-brand-gold">{title}</h3>
      </div>
      <ul className="divide-y divide-brand-border">
        {items.map((p, i) => (
          <li key={p.id} className="px-4 py-3 flex min-w-0 items-center gap-3">
            <span className="w-5 shrink-0 font-display text-brand-gray">{i + 1}</span>
            <div className="relative w-9 h-9 shrink-0 rounded-full bg-brand-black overflow-hidden">
              {getValidImageSrc(p.photo) && <Image src={getValidImageSrc(p.photo)!} alt={p.name} fill sizes="36px" className="object-cover" />}
            </div>
            <Link href={`/elenco/${p.slug}`} className="min-w-0 flex-1 break-words text-sm font-semibold hover:text-brand-gold">
              {p.nickname}
            </Link>
            <span className="font-display text-xl font-bold text-brand-red">{getValue(p)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
