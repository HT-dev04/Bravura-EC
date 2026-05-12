import Link from "next/link";
import Image from "next/image";
import type { NewsItem } from "@/types";
import { getValidImageSrc } from "@/lib/image-utils";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function NewsCard({ item, feature }: { item: NewsItem; feature?: boolean }) {
  const coverSrc = getValidImageSrc(item.cover);
  return (
    <Link
      href={`/noticias/${item.slug}`}
      className={`group block min-w-0 bg-brand-black-2 border border-brand-border hover:border-brand-red rounded-sm overflow-hidden ${feature ? "md:flex" : ""}`}
    >
      <div className={`relative ${feature ? "md:w-1/2 aspect-video md:aspect-auto" : "aspect-video"} overflow-hidden bg-brand-black`}>
        {coverSrc && (
          <Image
            src={coverSrc}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>
      <div className={`p-5 ${feature ? "md:w-1/2 md:p-8 flex flex-col justify-center" : ""}`}>
        <div className="flex min-w-0 flex-wrap items-center gap-2 mb-2">
          <Badge variant="red">{item.category}</Badge>
          <span className="text-[11px] text-brand-gray">{formatDate(item.publishedAt)}</span>
        </div>
        <h3 className={`break-words font-display uppercase leading-tight ${feature ? "text-2xl md:text-3xl" : "text-lg"}`}>
          {item.title}
        </h3>
        <p className="break-words text-sm text-brand-gray mt-2 line-clamp-2">{item.excerpt}</p>
        <span className="inline-block mt-3 text-xs uppercase tracking-wider text-brand-gold">Ler matéria →</span>
      </div>
    </Link>
  );
}
