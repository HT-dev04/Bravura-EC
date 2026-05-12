"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { PlayerCard } from "@/components/site/PlayerCard";
import { Input } from "@/components/ui/input";
import type { Player, Position } from "@/types";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

const positions: Array<Position | "Todos"> = ["Todos", "Goleiro", "Defensor", "Meia", "Atacante"];

export default function ElencoPage() {
  const [roster, setRoster] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [pos, setPos] = useState<Position | "Todos">("Todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/cms", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setRoster(Array.isArray(data?.players) ? data.players : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return roster.filter((p) => {
      const posOk = pos === "Todos" || p.position === pos;
      const searchOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.nickname.toLowerCase().includes(q);
      return posOk && searchOk;
    });
  }, [roster, pos, search]);

  return (
    <SiteShell>
      <section className="diag-section py-14">
        <div className="container-x">
          <p className="text-brand-gold uppercase tracking-[0.3em] text-[10px] font-semibold mb-2">
            Elenco
          </p>
          <h1 className="font-display text-4xl md:text-6xl uppercase mb-2">
            Os atletas do Bravura
          </h1>
          <p className="text-brand-gray">{roster.length} jogadores na temporada 2026.</p>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray" />
            <Input
              placeholder="Buscar por nome ou apelido"
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {positions.map((p) => (
              <button
                key={p}
                onClick={() => setPos(p)}
                className={cn(
                  "px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm border transition-colors",
                  pos === p
                    ? "bg-brand-red border-brand-red text-white"
                    : "border-brand-border text-brand-white/80 hover:border-brand-red"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-brand-gray text-center py-14">Carregando elenco...</p>
        ) : filtered.length === 0 ? (
          <p className="text-brand-gray text-center py-14">Nenhum jogador cadastrado.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
