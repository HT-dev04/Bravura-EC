"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { NewsCard } from "@/components/site/NewsCard";
import { Input, Select } from "@/components/ui/input";
import { news } from "@/data/news";
import { Search } from "lucide-react";

const categories = ["Todas", "Jogos", "Bastidores", "Mercado"] as const;

export default function NoticiasPage() {
  const [items, setItems] = useState(news);
  const [category, setCategory] = useState<(typeof categories)[number]>("Todas");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/cms")
      .then((res) => res.json())
      .then((data) => data?.news && setItems(data.news));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items
      .filter((n) => category === "Todas" || n.category === category)
      .filter((n) => !q || n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q))
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  }, [items, category, search]);

  const [feature, ...rest] = filtered;

  return (
    <SiteShell>
      <section className="diag-section py-14">
        <div className="container-x">
          <p className="text-brand-gold uppercase tracking-[0.3em] text-[10px] font-semibold mb-2">
            Notícias
          </p>
          <h1 className="font-display text-4xl md:text-6xl uppercase">Direto do Bravura</h1>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="grid md:grid-cols-[1fr_auto] gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray" />
            <Input
              placeholder="Buscar notícias"
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as (typeof categories)[number])}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>

        {feature && <div className="mb-8"><NewsCard item={feature} feature /></div>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((n) => (
            <NewsCard key={n.id} item={n} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-brand-gray py-14">Nenhuma notícia encontrada.</p>
        )}
      </section>
    </SiteShell>
  );
}
