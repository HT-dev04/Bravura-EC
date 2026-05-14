import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { NewsCard } from "@/components/site/NewsCard";
import { ShareButton } from "@/components/site/ShareButton";
import { Badge } from "@/components/ui/badge";
import { getCmsData } from "@/lib/cms-store";
import { getValidImageSrc } from "@/lib/image-utils";
import { bravuraOgImage } from "@/lib/asset-url";
import { absoluteUrl } from "@/lib/site-url";
import { formatDateLong } from "@/lib/utils";

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
  const { news } = await getCmsData();
  const item = news.find((n) => n.slug === slug);
  if (!item) return { title: "Notícia não encontrada" };
  const coverSrc = getValidImageSrc(item.cover);
  const canonicalUrl = absoluteUrl(`/noticias/${slug}`);
  const imageUrl = absoluteUrl(coverSrc && !coverSrc.startsWith("data:") ? coverSrc : bravuraOgImage);

  return {
    title: item.title,
    description: item.excerpt,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: item.title,
      description: item.excerpt,
      url: canonicalUrl,
      siteName: "Bravura Esporte Clube",
      type: "article",
      publishedTime: item.publishedAt,
      authors: [item.author],
      images: [{ url: imageUrl, width: 1200, height: 630, alt: item.title }],
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.excerpt,
      images: [imageUrl],
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { news } = await getCmsData();
  const item = news.find((n) => n.slug === slug);
  if (!item) notFound();

  const related = news.filter((n) => n.id !== item.id).slice(0, 3);
  const coverSrc = getValidImageSrc(item.cover);
  const shareUrl = absoluteUrl(`/noticias/${item.slug}`);
  const shareImageUrl = absoluteUrl(coverSrc && !coverSrc.startsWith("data:") ? coverSrc : bravuraOgImage);

  return (
    <SiteShell>
      <section className="relative w-full aspect-[21/9] md:aspect-[21/7] bg-brand-black">
        {coverSrc && (
          <Image src={coverSrc} alt={item.title} fill sizes="100vw" className="object-cover opacity-60" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container-x pb-10">
            <div className="flex min-w-0 flex-wrap items-center gap-2 mb-3">
              <Badge variant="red">{item.category}</Badge>
              <span className="text-xs text-brand-gold">{formatDateLong(item.publishedAt)}</span>
              <span className="break-words text-xs text-brand-gray">· por {item.author}</span>
            </div>
            <h1 className="max-w-4xl break-words font-display text-3xl md:text-5xl uppercase leading-tight">
              {item.title}
            </h1>
          </div>
        </div>
      </section>

      <article className="container-x py-10 max-w-3xl">
        <p className="break-words text-lg text-brand-white/90 mb-8">{item.excerpt}</p>
        <div className="mb-8">
          <ShareButton title={item.title} text={item.excerpt} url={shareUrl} imageUrl={shareImageUrl} />
        </div>
        <div className="prose-bravura break-words">
          {item.content
            .trim()
            .split("\n\n")
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
        <Link href="/noticias" className="inline-block mt-8 text-brand-gold uppercase text-sm">
          ← Voltar para notícias
        </Link>
      </article>

      <section className="container-x py-14 border-t border-brand-border">
        <h2 className="break-words font-display text-2xl md:text-3xl uppercase mb-6">Notícias relacionadas</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {related.map((n) => (
            <NewsCard key={n.id} item={n} />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
