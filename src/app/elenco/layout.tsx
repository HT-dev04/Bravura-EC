import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elenco",
  description:
    "Conheça o elenco do Bravura EC — todos os jogadores do Bravura Futebol Clube na temporada 2026: posição, números, estatísticas e perfis.",
  alternates: { canonical: "/elenco" },
};

export default function ElencoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
