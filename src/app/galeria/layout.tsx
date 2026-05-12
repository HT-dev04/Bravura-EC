import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeria",
  description:
    "Galeria de fotos e vídeos do Bravura EC — momentos marcantes dos jogos do Bravura, treinos, bastidores e eventos do Bravura Futebol Clube.",
  alternates: { canonical: "/galeria" },
};

export default function GaleriaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
