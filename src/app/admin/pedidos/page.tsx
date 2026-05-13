"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { saveAdminCollection } from "@/lib/admin-client";
import type { Order } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusVariant: Record<Order["status"], "gray" | "gold" | "green" | "red"> = {
  pendente: "gray",
  pago: "gold",
  enviado: "red",
  entregue: "green",
};

export default function AdminPedidosPage() {
  const [rows, setRows] = useState<Order[]>([]);
  const [viewing, setViewing] = useState<Order | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/cms", { cache: "no-store", credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const orders = data?.data?.orders || data?.orders;
        if (orders) setRows(orders);
      })
      .catch((error) => {
        console.error("Erro ao carregar pedidos", error);
        setMessage("Não foi possível carregar os pedidos salvos.");
      });
  }, []);

  async function persist(next: Order[]) {
    const previous = rows;
    setRows(next);

    try {
      const data = await saveAdminCollection("orders", next);
      setRows(data.orders);
      setMessage("Pedidos salvos com sucesso.");
      return true;
    } catch (error) {
      setRows(previous);
      setMessage("Não foi possível salvar os pedidos. Tente novamente.");
      console.error("Erro ao persistir pedidos", error);
      return false;
    }
  }

  function updateStatus(id: string, status: Order["status"]) {
    const next = rows.map((o) => (o.id === id ? { ...o, status } : o));
    void persist(next);
    if (viewing?.id === id) setViewing({ ...viewing, status });
  }

  return (
    <div className="p-4 md:p-10">
      <h1 className="font-display text-2xl md:text-4xl uppercase mb-6">Pedidos</h1>
      {message && <p className="mb-4 text-sm text-brand-gray">{message}</p>}

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
        onDelete={(r) => {
          void persist(rows.filter((row) => row.id !== r.id));
        }}
        onBulkDelete={(selected) => {
          void persist(rows.filter((row) => !selected.some((item) => item.id === row.id)));
        }}
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
