import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jogos",
  description:
    "Calendário completo dos jogos do Bravura EC: próximas partidas, resultados e histórico da temporada do Bravura Futebol Clube de Bugre-MG.",
  alternates: { canonical: "/jogos" },
};

export default function JogosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
