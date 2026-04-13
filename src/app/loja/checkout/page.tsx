"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const shipping = 25;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const orderId = "BRV-" + Math.floor(1000 + Math.random() * 9000);
    setTimeout(() => {
      clear();
      router.push(`/loja/pedido/${orderId}`);
    }, 700);
  }

  if (items.length === 0) {
    return (
      <SiteShell>
        <section className="container-x py-20 text-center">
          <h1 className="font-display text-3xl uppercase mb-4">Carrinho vazio</h1>
          <p className="text-brand-gray mb-6">Adicione itens antes de finalizar.</p>
          <Button onClick={() => router.push("/loja")}>Voltar à loja</Button>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="container-x py-14">
        <h1 className="font-display text-4xl md:text-5xl uppercase mb-8">Checkout</h1>
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="bg-brand-black-2 border border-brand-border rounded-sm p-6 space-y-6">
            <div>
              <h2 className="font-display uppercase text-lg mb-4 text-brand-gold">Dados pessoais</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Nome completo</Label>
                  <Input required placeholder="Seu nome" className="mt-1" />
                </div>
                <div>
                  <Label>E-mail</Label>
                  <Input required type="email" className="mt-1" />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input required className="mt-1" />
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-display uppercase text-lg mb-4 text-brand-gold">Endereço</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>Endereço</Label>
                  <Input required placeholder="Rua, número" className="mt-1" />
                </div>
                <div>
                  <Label>CEP</Label>
                  <Input required className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label>Cidade</Label>
                  <Input required className="mt-1" />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select required defaultValue="" className="mt-1">
                    <option value="" disabled>UF</option>
                    <option>SP</option>
                    <option>RJ</option>
                    <option>MG</option>
                    <option>RS</option>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-display uppercase text-lg mb-4 text-brand-gold">Pagamento</h2>
              <p className="text-xs text-brand-gray mb-3">
                Simulação. Nenhuma cobrança é feita de verdade.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Número do cartão</Label>
                  <Input required placeholder="0000 0000 0000 0000" className="mt-1" />
                </div>
                <div>
                  <Label>Validade</Label>
                  <Input required placeholder="MM/AA" className="mt-1" />
                </div>
                <div>
                  <Label>CVV</Label>
                  <Input required placeholder="000" className="mt-1" />
                </div>
              </div>
            </div>
          </div>

          <aside className="bg-brand-black-2 border border-brand-border rounded-sm p-6 h-fit">
            <h2 className="font-display uppercase text-lg mb-4">Resumo do pedido</h2>
            <ul className="divide-y divide-brand-border text-sm mb-4">
              {items.map((it) => (
                <li
                  key={`${it.productId}-${it.size}`}
                  className="py-2 flex justify-between gap-2"
                >
                  <span>
                    {it.name} <span className="text-brand-gray">({it.size}) ×{it.quantity}</span>
                  </span>
                  <span>{formatCurrency(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between text-sm">
              <span className="text-brand-gray">Subtotal</span>
              <span>{formatCurrency(subtotal())}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-brand-gray">Frete</span>
              <span>{formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between font-display text-xl border-t border-brand-border pt-3 mt-3">
              <span>Total</span>
              <span className="text-brand-gold">{formatCurrency(subtotal() + shipping)}</span>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-5"
              disabled={loading}
            >
              {loading ? "Processando..." : "Confirmar pedido"}
            </Button>
          </aside>
        </form>
      </section>
    </SiteShell>
  );
}
