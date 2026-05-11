import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { ProductCard } from "@/components/shop/ProductCard";
import { products } from "@/data/products";
import type { ProductCategory } from "@/types";

export const metadata: Metadata = {
  title: "Loja Oficial",
  description: "Camisas oficiais, uniformes, acessórios e produtos exclusivos do Bravura Esporte Clube.",
};

const categoryLabels: Record<ProductCategory, string> = {
  "uniformes-jogo": "Uniformes de jogo",
  treino: "Uniformes de treino",
  acessorios: "Acessórios",
  promocoes: "Promoções",
};

export default function LojaPage() {
  const featured = products.filter((p) => p.featured);
  const novos = products.filter((p) => p.isNew);
  const bests = products.filter((p) => p.bestseller);

  const byCategory = (Object.keys(categoryLabels) as ProductCategory[]).map((cat) => ({
    cat,
    items: products.filter((p) => p.category === cat),
  }));

  return (
    <SiteShell>
      <section className="diag-section py-14">
        <div className="container-x">
          <p className="text-brand-gold uppercase tracking-[0.3em] text-[10px] font-semibold mb-2">
            Loja Oficial
          </p>
          <h1 className="font-display text-4xl md:text-6xl uppercase">Produtos Bravura</h1>
        </div>
      </section>

      <ProductRow title="Em destaque" list={featured} />
      <ProductRow title="Lançamentos" list={novos} />
      <ProductRow title="Mais vendidos" list={bests} />

      {byCategory.map(({ cat, items }) => (
        <ProductRow key={cat} title={categoryLabels[cat]} list={items} />
      ))}
    </SiteShell>
  );
}

function ProductRow({ title, list }: { title: string; list: typeof products }) {
  if (list.length === 0) return null;
  return (
    <section className="container-x py-8">
      <h2 className="font-display text-2xl md:text-3xl uppercase mb-5">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
