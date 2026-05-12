"use client";

import { SiteShell } from "@/components/site/SiteShell";
import { Mail, MessageCircle, Camera } from "lucide-react";

export default function ContatoPage() {
  return (
    <SiteShell>
      <section className="diag-section py-14">
        <div className="container-x">
          <p className="text-brand-gold uppercase tracking-[0.3em] text-[10px] font-semibold mb-2">
            Contato
          </p>
          <h1 className="break-words font-display text-4xl md:text-6xl uppercase">Fale com o clube</h1>
          <p className="break-words text-brand-gray max-w-2xl mt-4">
            Imprensa, patrocínios, amistosos, peneiras ou simplesmente para mandar um alô — estamos à disposição.
          </p>
        </div>
      </section>

      <section className="container-x py-10 grid lg:grid-cols-3 gap-5 mb-4">
        <ContactCard
          icon={MessageCircle}
          title="WhatsApp"
          detail="(33) 9879-7600"
          href="https://wa.me/5533987976​00"
        />
        <ContactCard
          icon={Camera}
          title="Instagram"
          detail="@bravura_esporte_clube"
          href="https://www.instagram.com/bravura_esporte_clube"
        />
        <ContactCard
          icon={Mail}
          title="E-mail"
          detail="bravuraesporteclube@gmail.com"
          href="mailto:bravuraesporteclube@gmail.com"
        />
      </section>

      <section className="container-x py-10 pb-20">
        <div className="bg-brand-black-2 border border-brand-border rounded-sm p-6 md:p-10 max-w-3xl mx-auto text-center">
          <h2 className="break-words font-display text-2xl md:text-3xl uppercase mb-3">Entre em contato</h2>
          <p className="break-words text-brand-gray max-w-xl mx-auto mb-6">
            Fale diretamente com o Bravura pelo WhatsApp para assuntos sobre amistosos, patrocínios, peneiras e imprensa.
          </p>
          <a
            href="https://wa.me/553398797600"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center justify-center gap-2 rounded-sm bg-brand-red px-6 py-3 text-center text-base font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black"
          >
            <MessageCircle className="h-5 w-5" />
            Entrar em contato
          </a>
        </div>
      </section>
    </SiteShell>
  );
}

function ContactCard({
  icon: Icon,
  title,
  detail,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block min-w-0 bg-brand-black-2 border border-brand-border hover:border-brand-red rounded-sm p-6 transition-colors"
    >
      <Icon className="w-7 h-7 text-brand-red mb-3" />
      <p className="break-words font-display uppercase text-lg">{title}</p>
      <p className="break-words text-sm text-brand-gray">{detail}</p>
    </a>
  );
}
