import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { StatCard } from "@/components/site/StatCard";
import { players as defaultPlayers } from "@/data/players";
import { getCmsData } from "@/lib/cms-store";
import { PlayerGoalsChart } from "./PlayerGoalsChart";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return defaultPlayers.map((p) => ({ slug: p.slug }));
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
  return { title: `${player.nickname} · ${player.name}`, description: player.bio };
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

  const lastGames = matches
    .filter((m) => m.status === "encerrada" && m.lineupStart.includes(player.id))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5);

  return (
    <SiteShell>
      <section className="diag-section py-14">
        <div className="container-x grid md:grid-cols-[360px_1fr] gap-10 items-start">
          <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-brand-black-2 border border-brand-border">
            <Image src={player.photo} alt={player.name} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover object-top" />
          </div>
          <div>
            <Badge variant="gold">{player.position}</Badge>
            <h1 className="font-display text-5xl md:text-7xl uppercase leading-none mt-3">
              {player.nickname}
            </h1>
            <p className="text-brand-gray text-xl mt-1">{player.name}</p>
            <p className="font-display text-[140px] leading-none text-brand-red/30 font-bold absolute">
              {player.number}
            </p>
            <div className="mt-6 max-w-xl text-brand-white/80">{player.bio}</div>

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Jogos" value={player.stats.games} />
          <StatCard label="Gols" value={player.stats.goals} accent="red" />
          <StatCard label="Assistências" value={player.stats.assists} accent="gold" />
          <StatCard label="Minutos" value={player.stats.minutes} />
          <StatCard label="Amarelos" value={player.stats.yellowCards} />
          <StatCard label="Vermelhos" value={player.stats.redCards} />
        </div>
      </section>

      <section className="container-x py-10 grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl uppercase mb-5">Últimos 5 jogos</h2>
          <div className="bg-brand-black-2 border border-brand-border rounded-sm divide-y divide-brand-border">
            {lastGames.length === 0 && (
              <p className="p-4 text-brand-gray text-sm">Sem jogos registrados.</p>
            )}
            {lastGames.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">Bravura × {m.opponent}</p>
                  <p className="text-xs text-brand-gray">{m.competition}</p>
                </div>
                <p className="font-display text-xl">
                  {m.scoreHome} × {m.scoreAway}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-2xl md:text-3xl uppercase mb-5">Gols por mês</h2>
          <div className="bg-brand-black-2 border border-brand-border rounded-sm p-4 h-[280px]">
            <PlayerGoalsChart data={player.monthlyGoals} />
          </div>
        </div>
      </section>

      <section className="container-x py-10">
        <h2 className="font-display text-2xl md:text-3xl uppercase mb-5">Histórico</h2>
        <ul className="space-y-2 max-w-xl">
          {player.history.map((h, i) => (
            <li
              key={i}
              className="bg-brand-black-2 border border-brand-border rounded-sm p-4 flex justify-between text-sm"
            >
              <span className="text-brand-gray">{h.year}</span>
              <span className="font-semibold">{h.club}</span>
            </li>
          ))}
        </ul>
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
