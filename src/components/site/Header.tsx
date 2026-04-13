"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag, Camera } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/o-clube", label: "O Clube" },
  { href: "/elenco", label: "Elenco" },
  { href: "/jogos", label: "Jogos" },
  { href: "/estatisticas", label: "Estatísticas" },
  { href: "/galeria", label: "Galeria" },
  { href: "/noticias", label: "Notícias" },
  { href: "/patrocinadores", label: "Patrocinadores" },
  { href: "/loja", label: "Loja" },
  { href: "/contato", label: "Contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const count = useCart((s) => s.count());
  const openCart = useCart((s) => s.open);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 bg-brand-black/95 backdrop-blur border-b border-brand-border">
      <div className="container-x flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo/bravura.svg"
            alt="Bravura FC"
            width={36}
            height={36}
            className="w-9 h-9"
          />
          <span className="font-display uppercase text-xl tracking-wider hidden sm:inline">
            Bravura <span className="text-brand-red">FC</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-xs uppercase tracking-wider font-semibold text-brand-white/80 hover:text-white hover:bg-white/5 rounded-sm transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://www.instagram.com/bravura_esporte_clube"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex p-2 text-brand-gray hover:text-brand-gold transition-colors"
            aria-label="Instagram"
          >
            <Camera className="w-5 h-5" />
          </a>
          <button
            onClick={openCart}
            className="relative p-2 text-brand-white hover:text-brand-gold transition-colors"
            aria-label="Carrinho"
          >
            <ShoppingBag className="w-5 h-5" />
            {mounted && count > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-brand-white"
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "lg:hidden overflow-hidden transition-[max-height] duration-300 border-t border-brand-border",
          open ? "max-h-[500px]" : "max-h-0"
        )}
      >
        <nav className="container-x py-4 flex flex-col gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm uppercase tracking-wider font-semibold text-brand-white/90 hover:text-white hover:bg-white/5 rounded-sm"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
