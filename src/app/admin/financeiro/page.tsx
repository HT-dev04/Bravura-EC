"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { saveAdminCollection, uploadAdminFile } from "@/lib/admin-client";
import { assetUrl } from "@/lib/asset-url";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  FinanceData,
  ExpenseEntry,
  MonthlyPaymentStatus,
  Player,
  RevenueEntry,
  SponsorshipEntry,
} from "@/types";

const emptyFinance: FinanceData = {
  monthlyFeeAmount: 50,
  monthlyPayments: [],
  revenues: [],
  expenses: [],
  sponsorships: [],
};

const tabs = ["resumo", "mensalidades", "receitas", "gastos", "patrocinios"] as const;
type Tab = (typeof tabs)[number];
type FilterMode = "atual" | "mes" | "ano";
type MonthlyMovement = {
  id: string;
  date: string;
  description: string;
  type: "Entrada" | "Saída";
  value: number;
};

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function makeRevenue(): RevenueEntry {
  return { id: `rev${Date.now()}`, date: today(), description: "", value: 0 };
}

function makeExpense(): ExpenseEntry {
  return { id: `gas${Date.now()}`, date: today(), description: "", value: 0 };
}

function makeSponsorship(): SponsorshipEntry {
  return {
    id: `pat${Date.now()}`,
    date: today(),
    name: "",
    photo: assetUrl("/sponsors/placeholder.svg"),
    purpose: "",
    value: 0,
  };
}

function isInPeriod(date: string, mode: FilterMode, selectedMonth: string, selectedYear: string) {
  const now = today();
  if (mode === "atual") return date <= now;
  if (mode === "mes") return date.startsWith(selectedMonth);
  return date.startsWith(selectedYear);
}

export default function AdminFinanceiroPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [finance, setFinance] = useState<FinanceData>(emptyFinance);
  const [tab, setTab] = useState<Tab>("mensalidades");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [filterMode, setFilterMode] = useState<FilterMode>("atual");
  const [editingRevenue, setEditingRevenue] = useState<RevenueEntry | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);
  const [editingSponsorship, setEditingSponsorship] = useState<SponsorshipEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/cms", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const cms = data?.data || data;
        if (cms?.players) setPlayers(cms.players);
        if (cms?.finance) setFinance({ ...emptyFinance, ...cms.finance });
      })
      .catch((error) => {
        console.error("Erro ao carregar dados financeiros", error);
        setMessage("Não foi possível carregar os dados financeiros salvos.");
      });
  }, []);

  async function persist(next: FinanceData) {
    const previous = finance;

    try {
      await saveAdminCollection("finance", next);
      setFinance(next);
      setMessage("Dados financeiros salvos com sucesso.");
      return true;
    } catch (error) {
      setFinance(previous);
      setMessage("Não foi possível salvar os dados financeiros. Tente novamente.");
      console.error("Erro ao persistir financeiro", error);
      return false;
    }
  }

  function paymentStatus(playerId: string): MonthlyPaymentStatus {
    return (
      finance.monthlyPayments.find((item) => item.playerId === playerId && item.month === selectedMonth)
        ?.status || "pendente"
    );
  }

  async function setPayment(playerId: string, status: MonthlyPaymentStatus) {
    const nextPayments = finance.monthlyPayments.filter(
      (item) => !(item.playerId === playerId && item.month === selectedMonth)
    );
    if (status !== "pendente") {
      nextPayments.push({
        playerId,
        month: selectedMonth,
        status,
        paidAt: status === "pago" ? new Date().toISOString() : undefined,
      });
    }
    await persist({ ...finance, monthlyPayments: nextPayments });
  }

  async function saveRevenue(entry: RevenueEntry) {
    setSaving(true);
    try {
      const nextRows = finance.revenues.some((item) => item.id === entry.id)
        ? finance.revenues.map((item) => (item.id === entry.id ? entry : item))
        : [...finance.revenues, entry];
      if (await persist({ ...finance, revenues: nextRows })) setEditingRevenue(null);
    } finally {
      setSaving(false);
    }
  }

  async function saveExpense(entry: ExpenseEntry) {
    setSaving(true);
    try {
      const nextRows = finance.expenses.some((item) => item.id === entry.id)
        ? finance.expenses.map((item) => (item.id === entry.id ? entry : item))
        : [...finance.expenses, entry];
      if (await persist({ ...finance, expenses: nextRows })) setEditingExpense(null);
    } finally {
      setSaving(false);
    }
  }

  async function saveSponsorship(entry: SponsorshipEntry) {
    setSaving(true);
    try {
      const nextRows = finance.sponsorships.some((item) => item.id === entry.id)
        ? finance.sponsorships.map((item) => (item.id === entry.id ? entry : item))
        : [...finance.sponsorships, entry];
      if (await persist({ ...finance, sponsorships: nextRows })) setEditingSponsorship(null);
    } finally {
      setSaving(false);
    }
  }

  const filteredRevenues = finance.revenues.filter((item) =>
    isInPeriod(item.date, filterMode, selectedMonth, selectedYear)
  );
  const filteredExpenses = finance.expenses.filter((item) =>
    isInPeriod(item.date, filterMode, selectedMonth, selectedYear)
  );
  const filteredSponsorships = finance.sponsorships.filter((item) =>
    isInPeriod(item.date, filterMode, selectedMonth, selectedYear)
  );
  const paidCount = players.filter((player) => paymentStatus(player.id) === "pago").length;
  const exemptCount = players.filter((player) => paymentStatus(player.id) === "isento").length;
  const monthlyTotal = paidCount * finance.monthlyFeeAmount;
  const revenueTotal = filteredRevenues.reduce((sum, item) => sum + item.value, 0);
  const expenseTotal = filteredExpenses.reduce((sum, item) => sum + item.value, 0);
  const sponsorshipTotal = filteredSponsorships.reduce((sum, item) => sum + item.value, 0);
  const incomeTotal = monthlyTotal + revenueTotal + sponsorshipTotal;
  const balanceTotal = incomeTotal - expenseTotal;
  const monthRevenues = finance.revenues.filter((item) => item.date.startsWith(selectedMonth));
  const monthExpenses = finance.expenses.filter((item) => item.date.startsWith(selectedMonth));
  const monthSponsorships = finance.sponsorships.filter((item) => item.date.startsWith(selectedMonth));
  const monthPaidPlayers = players.filter(
    (player) =>
      finance.monthlyPayments.find((item) => item.playerId === player.id && item.month === selectedMonth)?.status === "pago"
  );
  const monthMonthlyTotal = monthPaidPlayers.length * finance.monthlyFeeAmount;
  const monthRevenueTotal = monthRevenues.reduce((sum, item) => sum + item.value, 0);
  const monthSponsorshipTotal = monthSponsorships.reduce((sum, item) => sum + item.value, 0);
  const monthExpenseTotal = monthExpenses.reduce((sum, item) => sum + item.value, 0);
  const monthIncomeTotal = monthMonthlyTotal + monthRevenueTotal + monthSponsorshipTotal;
  const monthMovements = [
    ...monthPaidPlayers.map((player) => ({
      id: `mensalidade-${player.id}`,
      date: selectedMonth,
      description: `Mensalidade - ${player.name}`,
      type: "Entrada" as const,
      value: finance.monthlyFeeAmount,
    })),
    ...monthRevenues.map((item) => ({ ...item, type: "Entrada" as const })),
    ...monthSponsorships.map((item) => ({
      id: item.id,
      date: item.date,
      description: `Patrocínio - ${item.name}`,
      type: "Entrada" as const,
      value: item.value,
    })),
    ...monthExpenses.map((item) => ({ ...item, type: "Saída" as const })),
  ] satisfies MonthlyMovement[];
  monthMovements.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-gold mb-2">Admin</p>
          <h1 className="font-display text-3xl md:text-4xl uppercase">Controle financeiro</h1>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 min-w-0 w-full lg:max-w-lg">
          <div>
            <Label>Filtro</Label>
            <Select className="mt-1" value={filterMode} onChange={(e) => setFilterMode(e.target.value as FilterMode)}>
              <option value="atual">Atual</option>
              <option value="mes">Mês</option>
              <option value="ano">Ano</option>
            </Select>
          </div>
          <div>
            <Label>Mês</Label>
            <Input className="mt-1" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
          </div>
          <div>
            <Label>Ano</Label>
            <Input className="mt-1" type="number" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} />
          </div>
        </div>
      </div>

      {message && <p className="text-sm text-brand-gray">{message}</p>}

      <div className="grid md:grid-cols-5 gap-3">
        <SummaryCard label="Mensalidades pagas" value={formatCurrency(monthlyTotal)} detail={`${paidCount} pagos · ${exemptCount} isentos`} />
        <SummaryCard label="Receitas filtradas" value={formatCurrency(revenueTotal)} detail={`${filteredRevenues.length} registros`} />
        <SummaryCard label="Patrocínios" value={formatCurrency(sponsorshipTotal)} detail={`${filteredSponsorships.length} registros`} />
        <SummaryCard label="Gastos filtrados" value={formatCurrency(expenseTotal)} detail={`${filteredExpenses.length} registros`} />
        <SummaryCard label="Saldo filtrado" value={formatCurrency(balanceTotal)} detail="Entradas - gastos" />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-brand-border">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`px-4 py-3 text-xs uppercase tracking-wider font-semibold border-b-2 ${
              tab === item ? "border-brand-red text-white" : "border-transparent text-brand-gray"
            }`}
          >
            {item === "resumo"
              ? "Resumo"
              : item === "mensalidades"
                ? "Mensalidades"
                : item === "receitas"
                  ? "Receitas"
                  : item === "gastos"
                    ? "Gastos"
                    : "Patrocínio"}
          </button>
        ))}
      </div>

      {tab === "resumo" && (
        <MonthlySummary
          movements={monthMovements}
          income={monthIncomeTotal}
          expenses={monthExpenseTotal}
          monthlyTotal={monthMonthlyTotal}
          revenueTotal={monthRevenueTotal}
          sponsorshipTotal={monthSponsorshipTotal}
          selectedMonth={selectedMonth}
        />
      )}

      {tab === "mensalidades" && (
        <section className="space-y-4">
          <div className="bg-brand-black-2 border border-brand-border rounded-sm p-4 flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display uppercase text-lg text-brand-gold">Mensalidades dos jogadores</h2>
              <p className="text-sm text-brand-gray">Marque como pago, desfaça para pendente ou marque jogador como isento no mês selecionado.</p>
            </div>
            <div className="w-full md:w-52">
              <Label>Valor mensal</Label>
              <Input
                className="mt-1"
                type="number"
                min="0"
                step="0.01"
                value={finance.monthlyFeeAmount}
                onChange={(e) => persist({ ...finance, monthlyFeeAmount: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
          {/* Mobile: cards */}
          <div className="md:hidden border border-brand-border rounded-sm divide-y divide-brand-border">
            {players.length === 0 ? (
              <p className="px-4 py-8 text-center text-brand-gray text-sm">Nenhum jogador cadastrado.</p>
            ) : players.map((player) => {
              const status = paymentStatus(player.id);
              return (
                <div key={player.id} className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm">{player.name}</p>
                    <Badge variant={status === "pago" ? "green" : status === "isento" ? "gold" : "gray"}>{status}</Badge>
                  </div>
                  <p className="text-xs text-brand-gray">{player.position}</p>
                  <div className="flex gap-3 pt-1 border-t border-brand-border/50">
                    <button className="text-xs uppercase text-green-400 hover:underline font-semibold" onClick={() => setPayment(player.id, "pago")}>Pago</button>
                    <button className="text-xs uppercase text-brand-gold hover:underline font-semibold" onClick={() => setPayment(player.id, "isento")}>Isento</button>
                    <button className="text-xs uppercase text-brand-red hover:underline font-semibold" onClick={() => setPayment(player.id, "pendente")}>Desfazer</button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Desktop: tabela */}
          <div className="hidden md:block border border-brand-border rounded-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-white/5 text-brand-gray uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Jogador</th>
                  <th className="text-left px-4 py-3">Posição</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => {
                  const status = paymentStatus(player.id);
                  return (
                    <tr key={player.id} className="border-t border-brand-border hover:bg-white/[0.03]">
                      <td className="px-4 py-3 font-semibold">{player.name}</td>
                      <td className="px-4 py-3 text-brand-gray">{player.position}</td>
                      <td className="px-4 py-3"><Badge variant={status === "pago" ? "green" : status === "isento" ? "gold" : "gray"}>{status}</Badge></td>
                      <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                        <button className="text-xs uppercase text-green-400 hover:underline" onClick={() => setPayment(player.id, "pago")}>Pago</button>
                        <button className="text-xs uppercase text-brand-gold hover:underline" onClick={() => setPayment(player.id, "isento")}>Isento</button>
                        <button className="text-xs uppercase text-brand-red hover:underline" onClick={() => setPayment(player.id, "pendente")}>Desfazer</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "receitas" && (
        <FinanceList
          title="Receitas"
          button="Nova receita"
          rows={filteredRevenues}
          onNew={() => setEditingRevenue(makeRevenue())}
          onEdit={setEditingRevenue}
          onDelete={(id) => persist({ ...finance, revenues: finance.revenues.filter((item) => item.id !== id) })}
        />
      )}

      {tab === "gastos" && (
        <FinanceList
          title="Gastos"
          button="Novo gasto"
          rows={filteredExpenses}
          valueClassName="text-brand-red"
          onNew={() => setEditingExpense(makeExpense())}
          onEdit={setEditingExpense}
          onDelete={(id) => persist({ ...finance, expenses: finance.expenses.filter((item) => item.id !== id) })}
        />
      )}

      {tab === "patrocinios" && (
        <SponsorList
          rows={filteredSponsorships}
          onNew={() => setEditingSponsorship(makeSponsorship())}
          onEdit={setEditingSponsorship}
          onDelete={(id) => persist({ ...finance, sponsorships: finance.sponsorships.filter((item) => item.id !== id) })}
        />
      )}

      {editingRevenue && (
        <Dialog open onClose={() => setEditingRevenue(null)} title="Receita">
          <form onSubmit={(e) => { e.preventDefault(); void saveRevenue(editingRevenue); }} className="space-y-4">
            <div><Label>Descrição</Label><Input required className="mt-1" value={editingRevenue.description} onChange={(e) => setEditingRevenue({ ...editingRevenue, description: e.target.value })} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Data</Label><Input required className="mt-1" type="date" value={editingRevenue.date} onChange={(e) => setEditingRevenue({ ...editingRevenue, date: e.target.value })} /></div>
              <div><Label>Valor</Label><Input required className="mt-1" type="number" min="0" step="0.01" value={editingRevenue.value} onChange={(e) => setEditingRevenue({ ...editingRevenue, value: Number(e.target.value) || 0 })} /></div>
            </div>
            <FormActions saving={saving} onCancel={() => setEditingRevenue(null)} />
          </form>
        </Dialog>
      )}

      {editingExpense && (
        <Dialog open onClose={() => setEditingExpense(null)} title="Gasto">
          <form onSubmit={(e) => { e.preventDefault(); void saveExpense(editingExpense); }} className="space-y-4">
            <div><Label>Descrição</Label><Input required className="mt-1" value={editingExpense.description} onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Data</Label><Input required className="mt-1" type="date" value={editingExpense.date} onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })} /></div>
              <div><Label>Valor</Label><Input required className="mt-1" type="number" min="0" step="0.01" value={editingExpense.value} onChange={(e) => setEditingExpense({ ...editingExpense, value: Number(e.target.value) || 0 })} /></div>
            </div>
            <FormActions saving={saving} onCancel={() => setEditingExpense(null)} />
          </form>
        </Dialog>
      )}

      {editingSponsorship && (
        <Dialog open onClose={() => setEditingSponsorship(null)} title="Patrocínio">
          <form onSubmit={(e) => { e.preventDefault(); void saveSponsorship(editingSponsorship); }} className="space-y-4">
            <div><Label>Nome</Label><Input required className="mt-1" value={editingSponsorship.name} onChange={(e) => setEditingSponsorship({ ...editingSponsorship, name: e.target.value })} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Data</Label><Input required className="mt-1" type="date" value={editingSponsorship.date} onChange={(e) => setEditingSponsorship({ ...editingSponsorship, date: e.target.value })} /></div>
              <div><Label>Valor</Label><Input required className="mt-1" type="number" min="0" step="0.01" value={editingSponsorship.value} onChange={(e) => setEditingSponsorship({ ...editingSponsorship, value: Number(e.target.value) || 0 })} /></div>
            </div>
            <div><Label>Foto</Label><Input className="mt-1" type="file" onChange={async (e) => { const file = e.target.files?.[0]; if (file) { const upload = await uploadAdminFile(file); setEditingSponsorship({ ...editingSponsorship, photo: upload.url }); } }} /></div>
            <div><Label>Finalidade</Label><Textarea required className="mt-1" value={editingSponsorship.purpose} onChange={(e) => setEditingSponsorship({ ...editingSponsorship, purpose: e.target.value })} /></div>
            <FormActions saving={saving} onCancel={() => setEditingSponsorship(null)} />
          </form>
        </Dialog>
      )}
    </div>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="bg-brand-black-2 border border-brand-border rounded-sm p-4"><p className="text-[10px] uppercase tracking-wider text-brand-gray">{label}</p><p className="font-display text-2xl text-white mt-2">{value}</p><p className="text-xs text-brand-gray mt-1">{detail}</p></div>;
}

function MonthlySummary({ movements, income, expenses, monthlyTotal, revenueTotal, sponsorshipTotal, selectedMonth }: { movements: MonthlyMovement[]; income: number; expenses: number; monthlyTotal: number; revenueTotal: number; sponsorshipTotal: number; selectedMonth: string }) {
  const balance = income - expenses;
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Entrou no mês" value={formatCurrency(income)} detail="Mensalidades + receitas + patrocínios" />
        <SummaryCard label="Gastou no mês" value={formatCurrency(expenses)} detail="Total de gastos registrados" />
        <SummaryCard label="Saldo do mês" value={formatCurrency(balance)} detail={balance >= 0 ? "Resultado positivo" : "Resultado negativo"} />
        <SummaryCard label="Movimentações" value={String(movements.length)} detail={`Referência ${selectedMonth}`} />
      </div>
      <div className="bg-brand-black-2 border border-brand-border rounded-sm p-4">
        <h2 className="font-display uppercase text-lg text-brand-gold">Resumo mensal</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm">
          <div className="bg-brand-black border border-brand-border rounded-sm p-3"><p className="text-xs uppercase tracking-wider text-brand-gray">Mensalidades</p><p className="font-semibold text-white mt-1">{formatCurrency(monthlyTotal)}</p></div>
          <div className="bg-brand-black border border-brand-border rounded-sm p-3"><p className="text-xs uppercase tracking-wider text-brand-gray">Receitas</p><p className="font-semibold text-white mt-1">{formatCurrency(revenueTotal)}</p></div>
          <div className="bg-brand-black border border-brand-border rounded-sm p-3"><p className="text-xs uppercase tracking-wider text-brand-gray">Patrocínios</p><p className="font-semibold text-white mt-1">{formatCurrency(sponsorshipTotal)}</p></div>
        </div>
      </div>
      {/* Mobile: cards */}
      <div className="md:hidden border border-brand-border rounded-sm divide-y divide-brand-border">
        {movements.length === 0 ? (
          <p className="px-4 py-8 text-center text-brand-gray text-sm">Nenhuma movimentação encontrada para este mês.</p>
        ) : movements.map((row) => (
          <div key={row.id} className="p-3 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <Badge variant={row.type === "Entrada" ? "green" : "gray"}>{row.type}</Badge>
              <span className={`font-semibold text-sm ${row.type === "Entrada" ? "text-brand-gold" : "text-brand-red"}`}>
                {row.type === "Entrada" ? "+" : "-"}{formatCurrency(row.value)}
              </span>
            </div>
            <p className="text-sm">{row.description}</p>
            <p className="text-xs text-brand-gray">{row.date.length === 7 ? row.date : formatDate(row.date)}</p>
          </div>
        ))}
      </div>
      {/* Desktop: tabela */}
      <div className="hidden md:block border border-brand-border rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-white/5 text-brand-gray uppercase text-[10px] tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Data</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Descrição</th>
              <th className="text-right px-4 py-3">Valor</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((row) => (
              <tr key={row.id} className="border-t border-brand-border">
                <td className="px-4 py-3">{row.date.length === 7 ? row.date : formatDate(row.date)}</td>
                <td className="px-4 py-3"><Badge variant={row.type === "Entrada" ? "green" : "gray"}>{row.type}</Badge></td>
                <td className="px-4 py-3">{row.description}</td>
                <td className={`px-4 py-3 text-right font-semibold ${row.type === "Entrada" ? "text-brand-gold" : "text-brand-red"}`}>
                  {row.type === "Entrada" ? "+" : "-"}{formatCurrency(row.value)}
                </td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-brand-gray">Nenhuma movimentação encontrada para este mês.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FinanceList({ title, button, rows, valueClassName = "text-brand-gold", onNew, onEdit, onDelete }: { title: string; button: string; rows: RevenueEntry[]; valueClassName?: string; onNew: () => void; onEdit: (row: RevenueEntry) => void; onDelete: (id: string) => void }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display uppercase text-lg text-brand-gold">{title}</h2>
        <Button variant="primary" onClick={onNew}><Plus className="w-4 h-4" /> {button}</Button>
      </div>
      {/* Mobile: cards */}
      <div className="md:hidden border border-brand-border rounded-sm divide-y divide-brand-border">
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-brand-gray text-sm">Nenhum registro encontrado.</p>
        ) : rows.map((row) => (
          <div key={row.id} className="p-3 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <span className={`font-semibold ${valueClassName}`}>{formatCurrency(row.value)}</span>
              <span className="text-xs text-brand-gray shrink-0">{formatDate(row.date)}</span>
            </div>
            <p className="text-sm text-brand-white/80">{row.description}</p>
            <div className="flex gap-4 pt-2 border-t border-brand-border/50">
              <button className="text-xs uppercase text-brand-gold hover:underline font-semibold" onClick={() => onEdit(row)}>Editar</button>
              <button className="text-xs uppercase text-brand-red hover:underline font-semibold" onClick={() => onDelete(row.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
      {/* Desktop: tabela */}
      <div className="hidden md:block border border-brand-border rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-white/5 text-brand-gray uppercase text-[10px] tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Data</th>
              <th className="text-left px-4 py-3">Descrição</th>
              <th className="text-left px-4 py-3">Valor</th>
              <th className="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-brand-border">
                <td className="px-4 py-3">{formatDate(row.date)}</td>
                <td className="px-4 py-3">{row.description}</td>
                <td className={`px-4 py-3 font-semibold ${valueClassName}`}>{formatCurrency(row.value)}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button className="text-xs uppercase text-brand-gold hover:underline" onClick={() => onEdit(row)}>Editar</button>
                  <button className="text-xs uppercase text-brand-red hover:underline" onClick={() => onDelete(row.id)}>Excluir</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-brand-gray">Nenhum registro encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SponsorList({ rows, onNew, onEdit, onDelete }: { rows: SponsorshipEntry[]; onNew: () => void; onEdit: (row: SponsorshipEntry) => void; onDelete: (id: string) => void }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display uppercase text-lg text-brand-gold">Patrocínio</h2>
        <Button variant="primary" onClick={onNew}><Plus className="w-4 h-4" /> Novo patrocínio</Button>
      </div>
      {/* Mobile: cards */}
      <div className="md:hidden border border-brand-border rounded-sm divide-y divide-brand-border">
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-brand-gray text-sm">Nenhum patrocínio registrado.</p>
        ) : rows.map((row) => (
          <div key={row.id} className="p-3 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-sm">{row.name}</p>
              <span className="text-brand-gold font-semibold text-sm shrink-0">{formatCurrency(row.value)}</span>
            </div>
            <p className="text-xs text-brand-gray">{formatDate(row.date)}</p>
            {row.purpose && <p className="text-sm text-brand-white/70">{row.purpose}</p>}
            <div className="flex gap-4 pt-2 border-t border-brand-border/50">
              <button className="text-xs uppercase text-brand-gold hover:underline font-semibold" onClick={() => onEdit(row)}>Editar</button>
              <button className="text-xs uppercase text-brand-red hover:underline font-semibold" onClick={() => onDelete(row.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
      {/* Desktop: tabela */}
      <div className="hidden md:block border border-brand-border rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-white/5 text-brand-gray uppercase text-[10px] tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Data</th>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Finalidade</th>
              <th className="text-left px-4 py-3">Valor</th>
              <th className="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-brand-border">
                <td className="px-4 py-3">{formatDate(row.date)}</td>
                <td className="px-4 py-3 font-semibold">{row.name}</td>
                <td className="px-4 py-3 text-brand-gray">{row.purpose}</td>
                <td className="px-4 py-3 text-brand-gold font-semibold">{formatCurrency(row.value)}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button className="text-xs uppercase text-brand-gold hover:underline" onClick={() => onEdit(row)}>Editar</button>
                  <button className="text-xs uppercase text-brand-red hover:underline" onClick={() => onDelete(row.id)}>Excluir</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-brand-gray">Nenhum patrocínio registrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FormActions({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
  return <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button><Button type="submit" variant="primary" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button></div>;
}
