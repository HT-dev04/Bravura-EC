import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Entre em contato com o Bravura Esporte Clube. Fale conosco pelos telefones oficiais de WhatsApp do Bravura EC.",
  alternates: { canonical: "/contato" },
};

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
