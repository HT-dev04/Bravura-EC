import { StatCard } from "@/components/site/StatCard";
import { AdminRevenueChart } from "./AdminRevenueChart";
import { getCmsData } from "@/lib/cms-store";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  const { players, matches, orders } = await getCmsData();
  const upcoming = matches.filter((m) => m.status === "agendada");
  const monthOrders = orders;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="p-4 md:p-10 space-y-8">
      <div>
        <p className="text-brand-gold uppercase text-[10px] tracking-widest">Admin</p>
        <h1 className="font-display text-3xl md:text-4xl uppercase">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Jogadores" value={players.length} accent="red" />
        <StatCard label="Próximas partidas" value={upcoming.length} accent="gold" />
        <StatCard label="Pedidos do mês" value={monthOrders.length} />
        <StatCard label="Receita" value={formatCurrency(revenue)} accent="gold" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="min-w-0 lg:col-span-2 bg-brand-black-2 border border-brand-border rounded-sm p-4 sm:p-5 h-[300px] sm:h-[340px]">
          <h2 className="font-display uppercase text-sm text-brand-gold mb-3">Receita dos últimos meses</h2>
          <AdminRevenueChart />
        </div>
        <div className="min-w-0 bg-brand-black-2 border border-brand-border rounded-sm p-4 sm:p-5">
          <h2 className="font-display uppercase text-sm text-brand-gold mb-3">Últimos pedidos</h2>
          <ul className="divide-y divide-brand-border text-sm">
            {orders.map((o) => (
              <li key={o.id} className="py-3 flex justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{o.id}</p>
                  <p className="text-xs text-brand-gray truncate">{formatDate(o.createdAt)} · {o.customer.name}</p>
                </div>
                <p className="font-bold text-brand-gold shrink-0">{formatCurrency(o.total)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
