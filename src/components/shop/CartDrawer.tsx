"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { isOpen, close, items, remove, updateQty, subtotal } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/70 z-[80] transition-opacity ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={close}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-brand-black-2 border-l border-brand-border z-[90] flex flex-col transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-brand-border">
          <h3 className="font-display uppercase text-lg tracking-wider">Carrinho</h3>
          <button onClick={close} className="text-brand-gray hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 && (
            <p className="text-brand-gray text-sm text-center py-10">
              Seu carrinho está vazio.
            </p>
          )}
          {items.map((it) => (
            <div
              key={`${it.productId}-${it.size}`}
              className="flex gap-3 border-b border-brand-border pb-4"
            >
              <div className="relative w-20 h-20 flex-shrink-0 bg-brand-black rounded-sm overflow-hidden">
                <Image src={it.image} alt={it.name} fill sizes="80px" className="object-cover" />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between gap-2">
                  <span className="text-sm font-semibold leading-tight">{it.name}</span>
                  <button
                    onClick={() => remove(it.productId, it.size)}
                    className="text-brand-gray hover:text-brand-red"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-brand-gray">Tamanho {it.size}</span>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center border border-brand-border rounded-sm">
                    <button
                      onClick={() => updateQty(it.productId, it.size, it.quantity - 1)}
                      className="p-1 hover:bg-white/5"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-xs">{it.quantity}</span>
                    <button
                      onClick={() => updateQty(it.productId, it.size, it.quantity + 1)}
                      className="p-1 hover:bg-white/5"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-brand-gold">
                    {formatCurrency(it.price * it.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-brand-border p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-brand-gray uppercase tracking-wider">Subtotal</span>
              <span className="font-bold text-lg text-brand-gold">
                {formatCurrency(subtotal())}
              </span>
            </div>
            <Link href="/loja/carrinho" onClick={close}>
              <Button variant="outline" className="w-full">Ver carrinho</Button>
            </Link>
            <Link href="/loja/checkout" onClick={close}>
              <Button variant="primary" className="w-full">Finalizar compra</Button>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
