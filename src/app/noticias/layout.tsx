import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notícias",
  description:
    "Últimas notícias do Bravura EC — cobertura dos jogos do Bravura, bastidores, mercado e tudo sobre o Bravura Futebol Clube de Bugre-MG.",
  alternates: { canonical: "/noticias" },
};

export default function NoticiasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
