import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Entre em contato com o Bravura Esporte Clube. Fale conosco pelo WhatsApp, e-mail ou Instagram oficial do Bravura EC.",
  alternates: { canonical: "/contato" },
};

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
