import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
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
    default: "Bravura FC — Portal Oficial",
    template: "%s · Bravura FC",
  },
  description:
    "Portal oficial do Bravura FC. Acompanhe elenco, jogos, estatísticas, notícias, galeria e adquira produtos oficiais do clube.",
  openGraph: {
    title: "Bravura FC — Portal Oficial",
    description:
      "Acompanhe a jornada do Bravura FC: elenco, partidas, estatísticas, galeria e loja oficial.",
    url: "https://bravurafc.example",
    siteName: "Bravura FC",
    locale: "pt_BR",
    type: "website",
    images: ["/og.jpg"],
  },
  icons: { icon: "/logo/bravura.svg" },
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
