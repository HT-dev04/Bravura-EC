import Image from "next/image";
import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { Card, CardContent } from "@/components/ui/card";
import { clubInfo } from "@/data/club";
import { bravuraLogo } from "@/lib/asset-url";
import { Shield, Target, Eye, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "O Clube",
  description:
    "Conheça a história do Bravura EC — missão, valores e trajetória do Bravura Futebol Clube de Bugre-MG, fundado em 2026 para resgatar talentos e fortalecer o futebol local.",
  alternates: { canonical: "/o-clube" },
};

export default function ClubePage() {
  return (
    <SiteShell>
      <section className="diag-section py-16">
        <div className="container-x">
          <p className="text-brand-gold uppercase tracking-[0.3em] text-[10px] font-semibold mb-2">
            O Clube
          </p>
          <h1 className="font-display text-4xl md:text-6xl uppercase mb-4">
            A história do <span className="text-brand-red">Bravura EC</span>
          </h1>
          <p className="text-brand-white/80 max-w-3xl">
            Nascido em Bugre-MG com o sonho de resgatar jovens talentos e fortalecer o futebol local. Conheça a história, missão e valores do Bravura Esporte Clube.
          </p>
        </div>
      </section>

      <section className="container-x py-14 grid lg:grid-cols-[2fr_1fr] gap-10">
        <div className="prose-bravura">
          <h2>Uma história de bravura</h2>
          {clubInfo.history.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="bg-brand-black-2 border border-brand-border rounded-sm p-8 text-center h-fit">
          <Image
            src={bravuraLogo}
            alt="Escudo Bravura Esporte Clube"
            width={180}
            height={180}
            className="mx-auto mb-4 h-[180px] w-[180px] object-contain"
          />
          <p className="font-display text-xl uppercase">{clubInfo.name}</p>
          <p className="text-brand-gold text-sm italic mt-1">&ldquo;{clubInfo.motto}&rdquo;</p>
          <p className="text-xs text-brand-gray mt-4">Fundado em {clubInfo.founded}</p>
        </div>
      </section>

      <section className="diag-section py-14">
        <div className="container-x">
          <h2 className="font-display text-3xl md:text-4xl uppercase mb-8 text-center">
            Missão, visão e valores
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <Card>
              <CardContent className="text-center">
                <Target className="w-8 h-8 text-brand-red mx-auto mb-3" />
                <h3 className="font-display uppercase text-lg mb-2">Missão</h3>
                <p className="text-sm text-brand-gray">{clubInfo.mission}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center">
                <Eye className="w-8 h-8 text-brand-gold mx-auto mb-3" />
                <h3 className="font-display uppercase text-lg mb-2">Visão</h3>
                <p className="text-sm text-brand-gray">{clubInfo.vision}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center">
                <Heart className="w-8 h-8 text-brand-red mx-auto mb-3" />
                <h3 className="font-display uppercase text-lg mb-2">Valores</h3>
                <ul className="text-sm text-brand-gray space-y-1">
                  {clubInfo.values.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container-x py-14">
        <h2 className="font-display text-3xl md:text-4xl uppercase mb-8">Linha do tempo</h2>
        <ol className="relative border-l-2 border-brand-red/40 ml-4 space-y-8">
          {clubInfo.timeline.map((t) => (
            <li key={t.id} className="pl-6 relative">
              <span className="absolute -left-[11px] top-1 w-5 h-5 bg-brand-red rounded-full border-4 border-brand-black" />
              <p className="font-display text-2xl text-brand-gold">{t.year}</p>
              <h3 className="font-display uppercase text-lg mt-1">{t.title}</h3>
              <p className="text-sm text-brand-gray">{t.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="diag-section py-14">
        <div className="container-x">
          <h2 className="font-display text-3xl md:text-4xl uppercase mb-8">Identidade</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-brand-red" />
                <h3 className="font-display uppercase text-xl">Escudo e cores</h3>
              </div>
              <p className="text-brand-gray mb-4">
                A identidade visual do Bravura foi pensada para refletir a alma guerreira do clube. O preto é a base, o vermelho representa a raça e o dourado carrega a tradição conquistada ao longo da história.
              </p>
              <p className="text-brand-gray mb-4">
                <strong>Mascote:</strong> {clubInfo.mascot}
              </p>
              <div className="flex gap-3 mt-6">
                <ColorSwatch color="#0a0a0a" label="Preto" />
                <ColorSwatch color="#c8102e" label="Vermelho" />
                <ColorSwatch color="#d4af37" label="Dourado" />
                <ColorSwatch color="#ffffff" label="Branco" />
              </div>
            </div>
            <div className="bg-brand-black-2 border border-brand-border rounded-sm p-10 flex items-center justify-center">
              <Image
                src={bravuraLogo}
                alt="Escudo Bravura"
                width={260}
                height={260}
                className="h-[260px] w-[260px] object-contain drop-shadow-[0_0_40px_rgba(200,16,46,0.4)]"
              />
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="text-center">
      <div
        className="w-12 h-12 rounded-full border border-brand-border"
        style={{ backgroundColor: color }}
      />
      <p className="text-[10px] uppercase text-brand-gray mt-1">{label}</p>
    </div>
  );
}
