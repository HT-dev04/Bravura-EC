import type { MetadataRoute } from "next";
import { getCmsData } from "@/lib/cms-store";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { players, news, matches, products } = await getCmsData();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/elenco`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/jogos`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/noticias`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/galeria`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/o-clube`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/estatisticas`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/loja`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/patrocinadores`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contato`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];

  const playerRoutes: MetadataRoute.Sitemap = players.map((p) => ({
    url: `${siteUrl}/elenco/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const newsRoutes: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${siteUrl}/noticias/${n.slug}`,
    lastModified: new Date(n.publishedAt),
    changeFrequency: "never" as const,
    priority: 0.6,
  }));

  const matchRoutes: MetadataRoute.Sitemap = matches.map((m) => ({
    url: `${siteUrl}/jogos/${m.id}`,
    lastModified: new Date(m.date),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/loja/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...playerRoutes, ...newsRoutes, ...matchRoutes, ...productRoutes];
}
