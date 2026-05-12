import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import { assetUrl, bravuraLogo } from "@/lib/asset-url";
import { siteUrl } from "@/lib/site-url";
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
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bravura Esporte Clube — Site Oficial",
    template: "%s · Bravura EC",
  },
  description:
    "Site oficial do Bravura Esporte Clube — clube amador de Bugre, MG. Acompanhe o elenco do Bravura, os jogos do Bravura EC, estatísticas, galeria e a história do Bravura Futebol.",
  keywords: [
    "Bravura EC",
    "Bravura Esporte Clube",
    "Bravura Futebol",
    "site oficial do Bravura",
    "elenco do Bravura",
    "jogos do Bravura",
    "história do Bravura",
    "futebol amador",
    "Bugre MG",
    "clube de futebol Minas Gerais",
  ],
  openGraph: {
    title: "Bravura Esporte Clube — Site Oficial",
    description:
      "Acompanhe o Bravura EC: elenco, partidas, estatísticas, galeria e loja oficial do Bravura Futebol Clube de Bugre-MG.",
    url: siteUrl,
    siteName: "Bravura Esporte Clube",
    locale: "pt_BR",
    type: "website",
    images: [{ url: assetUrl("/og.jpg"), width: 1200, height: 630, alt: "Bravura Esporte Clube" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bravura Esporte Clube — Site Oficial",
    description: "Site oficial do Bravura EC de Bugre-MG. Elenco, jogos, galeria e loja.",
    images: [assetUrl("/og.jpg")],
  },
  robots: { index: true, follow: true },
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
