"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BarChart3,
  Newspaper,
  Image as ImageIcon,
  Handshake,
  DollarSign,
  ShoppingBag,
  Receipt,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { bravuraLogo } from "@/lib/asset-url";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/jogadores", label: "Jogadores", icon: Users },
  { href: "/admin/estatisticas", label: "Estatísticas", icon: BarChart3 },
  { href: "/admin/partidas", label: "Partidas", icon: CalendarDays },
  { href: "/admin/noticias", label: "Notícias", icon: Newspaper },
  { href: "/admin/galeria", label: "Galeria", icon: ImageIcon },
  { href: "/admin/patrocinadores", label: "Patrocinadores", icon: Handshake },
  { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/admin/produtos", label: "Produtos", icon: ShoppingBag },
  { href: "/admin/pedidos", label: "Pedidos", icon: Receipt },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/entrar-admin";
  }

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-brand-border">
        <Link href="/admin" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Image
            src={bravuraLogo}
            alt="Bravura Futebol Clube"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <div>
            <p className="font-display uppercase text-sm tracking-wider">Bravura EC</p>
            <p className="text-[10px] text-brand-gold uppercase tracking-widest">Admin</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 text-sm overflow-y-auto">
        {links.map((l) => {
          const Icon = l.icon;
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-sm transition-colors",
                active
                  ? "bg-brand-red text-white"
                  : "text-brand-white/80 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="uppercase text-xs tracking-wider font-semibold">{l.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-brand-border">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-brand-white/80 hover:text-white"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair do admin
        </button>
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-brand-gray hover:text-white"
        >
          <Image
            src={bravuraLogo}
            alt="Bravura Futebol Clube"
            width={16}
            height={16}
            className="h-4 w-4 object-contain shrink-0"
          />
          Voltar ao site
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 bg-brand-black-2 border-b border-brand-border">
        <button
          onClick={() => setOpen(true)}
          className="p-1 text-brand-white"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src={bravuraLogo}
            alt="Bravura EC"
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
          />
          <span className="font-display uppercase text-sm tracking-wider">Bravura EC</span>
        </Link>
        <div className="w-7" />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-brand-black-2 border-r border-brand-border flex flex-col transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-brand-border">
          <Link href="/admin" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <Image src={bravuraLogo} alt="Bravura EC" width={28} height={28} className="h-7 w-7 object-contain" />
            <div>
              <p className="font-display uppercase text-sm tracking-wider">Bravura EC</p>
              <p className="text-[10px] text-brand-gold uppercase tracking-widest">Admin</p>
            </div>
          </Link>
          <button onClick={() => setOpen(false)} className="p-1 text-brand-gray hover:text-white" aria-label="Fechar menu">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 text-sm overflow-y-auto">
          {links.map((l) => {
            const Icon = l.icon;
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors",
                  active
                    ? "bg-brand-red text-white"
                    : "text-brand-white/80 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="uppercase text-xs tracking-wider font-semibold">{l.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-brand-border">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-brand-white/80 hover:text-white"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sair do admin
          </button>
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider text-brand-gray hover:text-white"
          >
            <Image src={bravuraLogo} alt="Bravura EC" width={16} height={16} className="h-4 w-4 object-contain shrink-0" />
            Voltar ao site
          </Link>
        </div>
      </aside>

      {/* Desktop sidebar (always visible, static) */}
      <aside className="hidden md:flex w-60 shrink-0 bg-brand-black-2 border-r border-brand-border flex-col min-h-screen sticky top-0">
        {sidebarContent}
      </aside>
    </>
  );
}
