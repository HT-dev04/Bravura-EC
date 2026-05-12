import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { getValidImageSrc } from "@/lib/image-utils";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }: { product: Product }) {
  const imageSrc = getValidImageSrc(product.images[0]);
  return (
    <Link
      href={`/loja/${product.slug}`}
      className="group block min-w-0 bg-brand-black-2 border border-brand-border hover:border-brand-red rounded-sm overflow-hidden"
    >
      <div className="relative aspect-square bg-brand-black overflow-hidden">
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 350px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew && <Badge variant="gold">Novo</Badge>}
          {product.bestseller && <Badge variant="red">Top</Badge>}
          {product.oldPrice && <Badge variant="red">Oferta</Badge>}
        </div>
      </div>
      <div className="p-4">
        <h3 className="break-words font-display uppercase text-sm leading-tight mb-1">{product.name}</h3>
        <div className="flex min-w-0 flex-wrap items-baseline gap-2">
          {product.oldPrice && (
            <span className="text-xs text-brand-gray line-through">
              {formatCurrency(product.oldPrice)}
            </span>
          )}
          <span className="font-bold text-brand-gold">{formatCurrency(product.price)}</span>
        </div>
      </div>
    </Link>
  );
}
