"use client";

import { useState, FormEvent } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Camera, Check } from "lucide-react";

export default function ContatoPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <SiteShell>
      <section className="diag-section py-14">
        <div className="container-x">
          <p className="text-brand-gold uppercase tracking-[0.3em] text-[10px] font-semibold mb-2">
            Contato
          </p>
          <h1 className="font-display text-4xl md:text-6xl uppercase">Fale com o clube</h1>
          <p className="text-brand-gray max-w-2xl mt-4">
            Imprensa, patrocínios, amistosos, peneiras ou simplesmente para mandar um alô — estamos à disposição.
          </p>
        </div>
      </section>

      <section className="container-x py-10 grid lg:grid-cols-3 gap-5 mb-4">
        <ContactCard
          icon={MessageCircle}
          title="WhatsApp"
          detail="(11) 90000-0000"
          href="https://wa.me/5511900000000"
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
          detail="contato@bravurafc.example"
          href="mailto:contato@bravurafc.example"
        />
      </section>

      <section className="container-x py-10 pb-20">
        <div className="bg-brand-black-2 border border-brand-border rounded-sm p-6 md:p-10 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl uppercase mb-6">Envie uma mensagem</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Nome</Label>
              <Input required placeholder="Seu nome" className="mt-1" />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input required type="email" placeholder="voce@email.com" className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <Label>Assunto</Label>
              <Select required className="mt-1" defaultValue="">
                <option value="" disabled>Selecione um assunto</option>
                <option value="amistoso">Marcar amistoso</option>
                <option value="patrocinio">Patrocínio</option>
                <option value="contato">Contato geral</option>
                <option value="peneira">Peneira</option>
                <option value="imprensa">Imprensa</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Mensagem</Label>
              <Textarea required rows={6} placeholder="Sua mensagem" className="mt-1" />
            </div>
            <div className="md:col-span-2 flex items-center gap-4">
              <Button type="submit" variant="primary">Enviar mensagem</Button>
              {sent && (
                <span className="inline-flex items-center gap-2 text-sm text-brand-gold">
                  <Check className="w-4 h-4" /> Mensagem enviada com sucesso.
                </span>
              )}
            </div>
          </form>
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
      className="bg-brand-black-2 border border-brand-border hover:border-brand-red rounded-sm p-6 transition-colors block"
    >
      <Icon className="w-7 h-7 text-brand-red mb-3" />
      <p className="font-display uppercase text-lg">{title}</p>
      <p className="text-sm text-brand-gray">{detail}</p>
    </a>
  );
}
