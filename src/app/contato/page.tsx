"use client";

import { SiteShell } from "@/components/site/SiteShell";
import { MessageCircle } from "lucide-react";

const contacts = [
  { detail: "(33) 9879-7600", href: "https://wa.me/553398797600" },
  { detail: "(31) 98607-0970", href: "https://wa.me/5531986070970" },
  { detail: "(33) 98431-7880", href: "https://wa.me/5533984317880" },
];

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
        {contacts.map((contact) => (
          <ContactCard key={contact.href} title="WhatsApp" detail={contact.detail} href={contact.href} />
        ))}
      </section>

      <section className="container-x py-10 pb-20">
        <div className="bg-brand-black-2 border border-brand-border rounded-sm p-6 md:p-10 max-w-3xl mx-auto text-center">
          <h2 className="break-words font-display text-2xl md:text-3xl uppercase mb-3">Entre em contato</h2>
          <p className="break-words text-brand-gray max-w-xl mx-auto mb-6">
            Fale diretamente com o Bravura pelo WhatsApp para assuntos sobre amistosos, patrocínios, peneiras e imprensa.
          </p>
          <div className="mb-6 flex flex-wrap justify-center gap-2 text-sm text-brand-gray">
            {contacts.map((contact) => (
              <a key={contact.href} href={contact.href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-brand-border px-3 py-1 hover:border-brand-red hover:text-brand-white">
                {contact.detail}
              </a>
            ))}
          </div>
          <a
            href={contacts[0].href}
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
  title,
  detail,
  href,
}: {
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
      <MessageCircle className="w-7 h-7 text-brand-red mb-3" />
      <p className="break-words font-display uppercase text-lg">{title}</p>
      <p className="break-words text-sm text-brand-gray">{detail}</p>
    </a>
  );
}
