import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { getCmsData } from "@/lib/cms-store";
import { absoluteUrl, siteUrl } from "@/lib/site-url";
import { StatsExplorer } from "./StatsExplorer";

export const metadata: Metadata = {
  title: "Estatísticas",
  description:
    "Estatísticas completas do Bravura EC na temporada: artilheiros, assistências, aproveitamento e rankings dos jogadores do Bravura Futebol Clube.",
  alternates: { canonical: "/estatisticas" },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EstatisticasPage() {
  const { players, matches } = await getCmsData();
  const shareUrl = absoluteUrl("/estatisticas");
  const siteLabel = new URL(siteUrl).hostname.replace(/^www\./, "");

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

      <StatsExplorer players={players} matches={matches} shareUrl={shareUrl} siteLabel={siteLabel} />
    </SiteShell>
  );
}
