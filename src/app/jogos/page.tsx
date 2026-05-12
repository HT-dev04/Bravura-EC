"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { MatchCard } from "@/components/site/MatchCard";
import { Select } from "@/components/ui/input";
import type { Match, MatchResult } from "@/types";
import { cn } from "@/lib/utils";

export default function JogosPage() {
  const [list, setList] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState("todas");
  const [competition, setCompetition] = useState("todas");
  const [result, setResult] = useState<MatchResult | "todos">("todos");

  useEffect(() => {
    fetch("/api/cms", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setList(Array.isArray(data?.matches) ? data.matches : []))
      .finally(() => setLoading(false));
  }, []);

  const seasons = Array.from(new Set(list.map((m) => m.season)));
  const competitions = Array.from(new Set(list.map((m) => m.competition)));

  const filtered = useMemo(() => {
    return list
      .filter((m) => season === "todas" || m.season === season)
      .filter((m) => competition === "todas" || m.competition === competition)
      .filter((m) => result === "todos" || m.result === result)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [list, season, competition, result]);

  return (
    <SiteShell>
      <section className="diag-section py-14">
        <div className="container-x">
          <p className="text-brand-gold uppercase tracking-[0.3em] text-[10px] font-semibold mb-2">
            Jogos
          </p>
          <h1 className="font-display text-4xl md:text-6xl uppercase">Partidas do Bravura</h1>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-brand-gray mb-1 block">
              Temporada
            </label>
            <Select value={season} onChange={(e) => setSeason(e.target.value)}>
              <option value="todas">Todas</option>
              {seasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-brand-gray mb-1 block">
              Competição
            </label>
            <Select value={competition} onChange={(e) => setCompetition(e.target.value)}>
              <option value="todas">Todas</option>
              {competitions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-brand-gray mb-1 block">
              Resultado
            </label>
            <div className="flex gap-2">
              {(["todos", "V", "E", "D"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setResult(r)}
                  className={cn(
                    "flex-1 px-3 py-2 text-xs uppercase font-semibold border rounded-sm",
                    result === r
                      ? "bg-brand-red border-brand-red"
                      : "border-brand-border text-brand-white/80"
                  )}
                >
                  {r === "todos" ? "Todos" : r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-brand-gray text-center py-14">Carregando partidas...</p>
        ) : filtered.length === 0 ? (
          <p className="text-brand-gray text-center py-14">Nenhuma partida cadastrada.</p>
        ) : <div className="space-y-3">
          {filtered.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>}
      </section>
    </SiteShell>
  );
}
