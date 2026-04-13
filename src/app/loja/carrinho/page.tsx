"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/utils";

export default function CarrinhoPage() {
  const { items, remove, updateQty, subtotal } = useCart();

  return (
    <SiteShell>
      <section className="container-x py-14">
        <h1 className="font-display text-4xl md:text-5xl uppercase mb-8">Meu carrinho</h1>

        {items.length === 0 ? (
          <div className="bg-brand-black-2 border border-brand-border rounded-sm p-10 text-center">
            <p className="text-brand-gray mb-4">Seu carrinho está vazio.</p>
            <Link href="/loja">
              <Button variant="primary">Ir para a loja</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-3">
              {items.map((it) => (
                <div
                  key={`${it.productId}-${it.size}`}
                  className="bg-brand-black-2 border border-brand-border rounded-sm p-4 flex gap-4"
                >
                  <div className="relative w-24 h-24 bg-brand-black rounded-sm overflow-hidden flex-shrink-0">
                    <Image src={it.image} alt={it.name} fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between gap-4">
                      <div>
                        <Link href={`/loja/${it.slug}`} className="font-display uppercase text-lg">
                          {it.name}
                        </Link>
                        <p className="text-xs text-brand-gray">Tamanho: {it.size}</p>
                      </div>
                      <button
                        onClick={() => remove(it.productId, it.size)}
                        className="text-brand-gray hover:text-brand-red"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-brand-border rounded-sm">
                        <button
                          onClick={() => updateQty(it.productId, it.size, it.quantity - 1)}
                          className="p-2 hover:bg-white/5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-4 text-sm">{it.quantity}</span>
                        <button
                          onClick={() => updateQty(it.productId, it.size, it.quantity + 1)}
                          className="p-2 hover:bg-white/5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="font-bold text-brand-gold">
                        {formatCurrency(it.price * it.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-brand-black-2 border border-brand-border rounded-sm p-6 h-fit sticky top-20">
              <h2 className="font-display uppercase text-lg mb-4">Resumo</h2>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-brand-gray">Subtotal</span>
                <span>{formatCurrency(subtotal())}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-brand-gray">Frete</span>
                <span className="text-brand-gold">Calculado no checkout</span>
              </div>
              <div className="flex justify-between font-display text-2xl border-t border-brand-border pt-4 mt-4">
                <span>Total</span>
                <span className="text-brand-gold">{formatCurrency(subtotal())}</span>
              </div>
              <Link href="/loja/checkout" className="block mt-6">
                <Button variant="primary" size="lg" className="w-full">
                  Finalizar compra
                </Button>
              </Link>
              <Link href="/loja" className="block mt-3">
                <Button variant="outline" className="w-full">Continuar comprando</Button>
              </Link>
            </aside>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
