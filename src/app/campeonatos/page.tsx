import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { ChampionshipCard } from "@/components/site/ChampionshipCard";
import { listChampionships } from "@/lib/championship-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Campeonatos",
  description: "Campeonatos disputados pelo Bravura EC: elenco inscrito, partidas, artilharia e campanha de cada competição.",
  alternates: { canonical: "/campeonatos" },
};

export default async function CampeonatosPage() {
  const championships = await listChampionships();

  return (
    <SiteShell>
      <section className="diag-section py-14">
        <div className="container-x">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold">Competições</p>
          <h1 className="break-words font-display text-4xl uppercase md:text-6xl">Campeonatos</h1>
          <p className="mt-3 max-w-2xl text-brand-white/70">
            A campanha do Bravura em cada competição, com elenco, números e estatísticas próprios de cada campeonato.
          </p>
        </div>
      </section>

      <section className="container-x py-10">
        {championships.length === 0 ? (
          <p className="py-14 text-center text-brand-gray">Nenhum campeonato cadastrado ainda.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {championships.map((championship) => (
              <ChampionshipCard key={championship.id} championship={championship} />
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
