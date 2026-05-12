import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { getCmsData } from "@/lib/cms-store";
import { ProductDetailClient } from "./ProductDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await getCmsData();
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: "Produto não encontrado" };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/loja/${slug}` },
    openGraph: { images: product.images },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { products } = await getCmsData();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <SiteShell>
      <ProductDetailClient product={product} />
    </SiteShell>
  );
}
