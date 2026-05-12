import Link from "next/link";
import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { SponsorGrid } from "@/components/site/SponsorGrid";
import { Button } from "@/components/ui/button";
import { getCmsData } from "@/lib/cms-store";
import { Check, Megaphone, Users, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Patrocinadores",
  description:
    "Conheça os patrocinadores do Bravura EC e saiba como apoiar o Bravura Esporte Clube de Bugre-MG. Planos de patrocínio disponíveis.",
  alternates: { canonical: "/patrocinadores" },
};

const plans = [
  {
    tier: "Bronze",
    price: "R$ 500/mês",
    color: "#cd7f32",
    perks: [
      "Logo no site oficial",
      "Menção nas redes sociais",
      "Presença no escudo de treino",
    ],
  },
  {
    tier: "Prata",
    price: "R$ 1.500/mês",
    color: "#c0c0c0",
    perks: [
      "Tudo do Bronze",
      "Logo na camisa de treino",
      "Ações conjuntas em jogos em casa",
      "Destaque em newsletters",
    ],
  },
  {
    tier: "Ouro",
    price: "R$ 4.000/mês",
    color: "#d4af37",
    perks: [
      "Tudo do Prata",
      "Logo na camisa oficial de jogo",
      "Naming rights em eventos",
      "Campanhas exclusivas",
    ],
  },
];

export default async function PatrocinadoresPage() {
  const { sponsors } = await getCmsData();

  return (
    <SiteShell>
      <section className="diag-section py-14">
        <div className="container-x">
          <p className="text-brand-gold uppercase tracking-[0.3em] text-[10px] font-semibold mb-2">
            Parceiros
          </p>
          <h1 className="break-words font-display text-4xl md:text-6xl uppercase">Patrocinadores do Bravura</h1>
        </div>
      </section>

      <section className="container-x py-12">
        <h2 className="break-words font-display text-3xl uppercase mb-6">Quem apoia o clube</h2>
        <SponsorGrid list={sponsors} />
      </section>

      <section className="diag-section py-14">
        <div className="container-x">
          <h2 className="break-words font-display text-3xl uppercase mb-8 text-center">
            Por que patrocinar o Bravura
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <Benefit icon={Users} title="Comunidade engajada" text="Alcance direto a centenas de torcedores e famílias da região." />
            <Benefit icon={Megaphone} title="Exposição em campo" text="Sua marca presente em jogos, redes e materiais oficiais do clube." />
            <Benefit icon={TrendingUp} title="Histórico em crescimento" text="O Bravura cresce ano após ano e leva o nome dos parceiros junto." />
          </div>
        </div>
      </section>

      <section className="container-x py-14">
        <h2 className="break-words font-display text-3xl uppercase mb-8 text-center">Planos de parceria</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className="min-w-0 bg-brand-black-2 border border-brand-border hover:border-brand-gold rounded-sm p-6 transition-colors"
            >
              <div
                className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm mb-4"
                style={{ backgroundColor: plan.color, color: "#0a0a0a" }}
              >
                {plan.tier}
              </div>
              <p className="break-words font-display text-3xl mb-4">{plan.price}</p>
              <ul className="space-y-2 text-sm text-brand-white/80 mb-6">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand-red mt-0.5 flex-shrink-0" />
                    <span className="min-w-0 break-words">{perk}</span>
                  </li>
                ))}
              </ul>
              <Link href="/contato">
                <Button variant="outline" className="w-full">Quero patrocinar</Button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

function Benefit({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="min-w-0 bg-brand-black-2 border border-brand-border rounded-sm p-6 text-center">
      <Icon className="w-8 h-8 mx-auto text-brand-red mb-3" />
      <h3 className="break-words font-display uppercase text-lg mb-2">{title}</h3>
      <p className="break-words text-sm text-brand-gray">{text}</p>
    </div>
  );
}
