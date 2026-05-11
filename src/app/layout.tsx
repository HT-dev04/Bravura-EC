import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import { assetUrl, bravuraLogo } from "@/lib/asset-url";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bravura Esporte Clube — Portal Oficial",
    template: "%s · Bravura EC",
  },
  description:
    "Portal oficial do Bravura Esporte Clube — clube amador de Bugre, MG. Fundado em 2026 com a missão de resgatar talentos e fortalecer o futebol local.",
  openGraph: {
    title: "Bravura Esporte Clube — Portal Oficial",
    description:
      "Acompanhe a jornada do Bravura Esporte Clube, time mensalista de Bugre-MG: elenco, partidas, estatísticas, galeria e loja oficial.",
    url: "https://bravurafc.example",
    siteName: "Bravura Esporte Clube",
    locale: "pt_BR",
    type: "website",
    images: [assetUrl("/og.jpg")],
  },
  icons: { icon: bravuraLogo },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${oswald.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-brand-black text-brand-white">
        {children}
      </body>
    </html>
  );
}
