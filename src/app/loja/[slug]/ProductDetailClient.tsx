"use client";

import Image from "next/image";
import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/lib/cart-store";
import { getValidImageSrc } from "@/lib/image-utils";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ProductDetailClient({ product }: { product: Product }) {
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState<string>(product.sizes[0]);
  const [added, setAdded] = useState(false);
  const { add, open } = useCart();
  const activeImageSrc = getValidImageSrc(product.images[activeImg]);

  function handleAdd() {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    open();
  }

  return (
    <section className="container-x py-12 grid md:grid-cols-2 gap-10">
      <div className="min-w-0">
        <div className="relative aspect-square bg-brand-black-2 border border-brand-border rounded-sm overflow-hidden">
          {activeImageSrc && (
            <Image
              src={activeImageSrc}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
              priority
            />
          )}
        </div>
        {product.images.length > 1 && (
          <div className="grid grid-cols-3 min-[430px]:grid-cols-4 gap-2 mt-3">
            {product.images.map((img, i) => {
              const thumbSrc = getValidImageSrc(img);
              return (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "relative aspect-square bg-brand-black-2 border rounded-sm overflow-hidden",
                    i === activeImg ? "border-brand-red" : "border-brand-border"
                  )}
                >
                  {thumbSrc && (
                    <Image src={thumbSrc} alt={`${product.name} ${i + 1}`} fill sizes="150px" className="object-cover" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-3">
          {product.isNew && <Badge variant="gold">Novo</Badge>}
          {product.bestseller && <Badge variant="red">Mais vendido</Badge>}
        </div>
        <h1 className="break-words font-display text-3xl md:text-5xl uppercase leading-none mb-4">
          {product.name}
        </h1>
        <div className="flex min-w-0 flex-wrap items-baseline gap-3 mb-6">
          {product.oldPrice && (
            <span className="text-brand-gray line-through text-lg">
              {formatCurrency(product.oldPrice)}
            </span>
          )}
          <span className="break-words font-display text-3xl sm:text-4xl text-brand-gold">
            {formatCurrency(product.price)}
          </span>
        </div>
        <p className="break-words text-brand-white/80 leading-relaxed mb-6">{product.description}</p>

        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider text-brand-gray mb-2">
            Tamanho
          </p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "w-12 h-12 border rounded-sm font-bold",
                  size === s
                    ? "bg-brand-red border-brand-red text-white"
                    : "border-brand-border text-brand-white/80 hover:border-brand-red"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-brand-gray mb-6">
          {product.stock > 0 ? `${product.stock} unidades em estoque` : "Esgotado"}
        </p>

        <Button
          variant="primary"
          size="lg"
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="w-full md:w-auto"
        >
          {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          {added ? "Adicionado" : "Adicionar ao carrinho"}
        </Button>
      </div>
    </section>
  );
}
