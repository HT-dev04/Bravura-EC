import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <SiteShell>
      <section className="container-x py-20">
        <div className="max-w-2xl mx-auto bg-brand-black-2 border border-brand-border rounded-sm p-10 text-center">
          <CheckCircle2 className="w-20 h-20 text-brand-gold mx-auto mb-6" />
          <h1 className="font-display text-3xl md:text-5xl uppercase mb-3">
            Pedido confirmado!
          </h1>
          <p className="text-brand-gray mb-6">
            Obrigado por apoiar o Bravura. Seu pedido foi recebido e está sendo processado.
          </p>
          <div className="bg-brand-black border border-brand-border rounded-sm p-5 mb-6 text-left inline-block">
            <p className="text-[10px] uppercase tracking-wider text-brand-gray">Número do pedido</p>
            <p className="font-display text-3xl text-brand-red">{id}</p>
            <p className="text-xs text-brand-gray mt-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-gold" />
              Prazo de entrega estimado: 7 a 10 dias úteis
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Link href="/loja">
              <Button variant="gold">Voltar à loja</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Ir para o início</Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
