"use client";

import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { orders as initial } from "@/data/orders";
import type { Order } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

// TODO: substituir por chamada à API quando o backend for integrado

const statusVariant: Record<Order["status"], "gray" | "gold" | "green" | "red"> = {
  pendente: "gray",
  pago: "gold",
  enviado: "red",
  entregue: "green",
};

export default function AdminPedidosPage() {
  const [rows, setRows] = useState<Order[]>(initial);
  const [viewing, setViewing] = useState<Order | null>(null);

  function updateStatus(id: string, status: Order["status"]) {
    setRows((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (viewing?.id === id) setViewing({ ...viewing, status });
  }

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl md:text-4xl uppercase mb-6">Pedidos</h1>

      <DataTable
        columns={[
          { key: "id", label: "Pedido" },
          { key: "date", label: "Data", render: (r) => formatDate(r.createdAt) },
          { key: "customer", label: "Cliente", render: (r) => r.customer.name },
          { key: "total", label: "Total", render: (r) => formatCurrency(r.total) },
          {
            key: "status",
            label: "Status",
            render: (r) => <Badge variant={statusVariant[r.status]}>{r.status}</Badge>,
          },
        ]}
        rows={rows}
        onEdit={(r) => setViewing(r)}
      />

      {viewing && (
        <Dialog open onClose={() => setViewing(null)} title={`Pedido ${viewing.id}`}>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[10px] uppercase text-brand-gray">Cliente</p>
              <p className="font-semibold">{viewing.customer.name}</p>
              <p className="text-brand-gray">{viewing.customer.email} · {viewing.customer.phone}</p>
              <p className="text-brand-gray">
                {viewing.customer.address}, {viewing.customer.city}/{viewing.customer.state}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-brand-gray mb-2">Itens</p>
              <ul className="divide-y divide-brand-border">
                {viewing.items.map((it) => (
                  <li key={`${it.productId}-${it.size}`} className="py-2 flex justify-between">
                    <span>
                      {it.name} ({it.size}) ×{it.quantity}
                    </span>
                    <span>{formatCurrency(it.price * it.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between font-display text-lg">
              <span>Total</span>
              <span className="text-brand-gold">{formatCurrency(viewing.total)}</span>
            </div>
            <div>
              <p className="text-[10px] uppercase text-brand-gray mb-1">Status</p>
              <Select
                value={viewing.status}
                onChange={(e) => updateStatus(viewing.id, e.target.value as Order["status"])}
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="enviado">Enviado</option>
                <option value="entregue">Entregue</option>
              </Select>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
