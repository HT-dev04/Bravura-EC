import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { StatCard } from "@/components/site/StatCard";
import { getCmsData } from "@/lib/cms-store";
import { PlayerGoalsChart } from "./PlayerGoalsChart";
import { Badge } from "@/components/ui/badge";
import { getValidImageSrc } from "@/lib/image-utils";

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

  const lastGames = matches
    .filter((m) => m.status === "encerrada" && m.lineupStart.includes(player.id))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5);

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

      <section className="container-x py-10 grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl uppercase mb-5">Últimos 5 jogos</h2>
          <div className="bg-brand-black-2 border border-brand-border rounded-sm divide-y divide-brand-border">
            {lastGames.length === 0 && (
              <p className="p-4 text-brand-gray text-sm">Sem jogos registrados.</p>
            )}
            {lastGames.map((m) => (
              <div key={m.id} className="p-4 flex min-w-0 items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="break-words font-semibold">Bravura × {m.opponent}</p>
                  <p className="break-words text-xs text-brand-gray">{m.competition}</p>
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
              className="bg-brand-black-2 border border-brand-border rounded-sm p-4 flex min-w-0 justify-between gap-4 text-sm"
            >
              <span className="text-brand-gray">{h.year}</span>
              <span className="min-w-0 break-words text-right font-semibold">{h.club}</span>
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
