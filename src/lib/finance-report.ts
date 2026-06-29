import { formatCurrency } from "@/lib/utils";
import type { FinanceData, Player } from "@/types";

/**
 * Formata uma data "YYYY-MM-DD" como "DD/MM/YYYY" sem usar `new Date`,
 * evitando o deslocamento de fuso horário que ocorre ao parsear datas sem hora.
 */
function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

export type ReportPeriod = "completo" | "dia" | "semana" | "mes" | "ano";

export interface ReportConfig {
  period: ReportPeriod;
  day: string; // YYYY-MM-DD — referência para "dia" e "semana"
  month: string; // YYYY-MM — referência para "mes"
  year: string; // YYYY — referência para "ano"
}

type MovementCategory = "Mensalidade" | "Receita" | "Patrocínio" | "Gasto";

interface ReportMovement {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: MovementCategory;
  type: "Entrada" | "Saída";
  value: number;
}

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function parseLocalDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year || 1970, (month || 1) - 1, day || 1);
}

function toIsoDay(date: Date) {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Intervalo da semana (segunda a domingo) que contém a data informada. */
export function weekRange(day: string) {
  const base = parseLocalDate(day);
  const weekday = (base.getDay() + 6) % 7; // 0 = segunda
  const start = new Date(base);
  start.setDate(base.getDate() - weekday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: toIsoDay(start), end: toIsoDay(end) };
}

/** Monta todas as movimentações financeiras (entradas e saídas) sem filtro. */
function buildMovements(finance: FinanceData, players: Player[]): ReportMovement[] {
  const playerName = (id: string) => players.find((player) => player.id === id)?.name || "Jogador";

  const mensalidades = finance.monthlyPayments
    .filter((payment) => payment.status === "pago")
    .map((payment) => ({
      id: `mensalidade-${payment.playerId}-${payment.month}`,
      date: payment.paidAt ? payment.paidAt.slice(0, 10) : `${payment.month}-01`,
      description: `Mensalidade - ${playerName(payment.playerId)} (${payment.month})`,
      category: "Mensalidade" as const,
      type: "Entrada" as const,
      value: finance.monthlyFeeAmount,
    }));

  const receitas = finance.revenues.map((item) => ({
    id: item.id,
    date: item.date,
    description: item.description || "Receita",
    category: "Receita" as const,
    type: "Entrada" as const,
    value: item.value,
  }));

  const patrocinios = finance.sponsorships.map((item) => ({
    id: item.id,
    date: item.date,
    description: `Patrocínio - ${item.name}${item.purpose ? ` (${item.purpose})` : ""}`,
    category: "Patrocínio" as const,
    type: "Entrada" as const,
    value: item.value,
  }));

  const gastos = finance.expenses.map((item) => ({
    id: item.id,
    date: item.date,
    description: item.description || "Gasto",
    category: "Gasto" as const,
    type: "Saída" as const,
    value: item.value,
  }));

  return [...mensalidades, ...receitas, ...patrocinios, ...gastos];
}

function matchesPeriod(date: string, config: ReportConfig) {
  switch (config.period) {
    case "completo":
      return true;
    case "dia":
      return date === config.day;
    case "semana": {
      const { start, end } = weekRange(config.day);
      return date >= start && date <= end;
    }
    case "mes":
      return date.startsWith(config.month);
    case "ano":
      return date.startsWith(config.year);
    default:
      return true;
  }
}

/** Rótulo legível do período selecionado. */
export function periodLabel(config: ReportConfig) {
  switch (config.period) {
    case "dia":
      return `Dia ${formatDate(config.day)}`;
    case "semana": {
      const { start, end } = weekRange(config.day);
      return `Semana de ${formatDate(start)} a ${formatDate(end)}`;
    }
    case "mes": {
      const [year, month] = config.month.split("-");
      return `${MONTH_NAMES[Number(month) - 1] || month} de ${year}`;
    }
    case "ano":
      return `Ano de ${config.year}`;
    default:
      return "Balanço completo";
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Gera o HTML completo e estilizado do balanço financeiro para impressão/PDF. */
export function buildFinanceReportHtml(
  finance: FinanceData,
  players: Player[],
  config: ReportConfig,
  clubName: string,
  generatedAt: Date,
  logoUrl?: string
) {
  const movements = buildMovements(finance, players)
    .filter((movement) => matchesPeriod(movement.date, config))
    .sort((a, b) => a.date.localeCompare(b.date) || a.description.localeCompare(b.description));

  const sum = (category: MovementCategory) =>
    movements.filter((movement) => movement.category === category).reduce((total, item) => total + item.value, 0);

  const mensalidadesTotal = sum("Mensalidade");
  const receitasTotal = sum("Receita");
  const patrociniosTotal = sum("Patrocínio");
  const gastosTotal = sum("Gasto");
  const entradasTotal = mensalidadesTotal + receitasTotal + patrociniosTotal;
  const saldo = entradasTotal - gastosTotal;

  const rows = movements
    .map(
      (movement) => `
        <tr>
          <td>${escapeHtml(formatDate(movement.date))}</td>
          <td>${escapeHtml(movement.category)}</td>
          <td>${escapeHtml(movement.description)}</td>
          <td class="num ${movement.type === "Entrada" ? "in" : "out"}">${
            movement.type === "Entrada" ? "+" : "-"
          } ${escapeHtml(formatCurrency(movement.value))}</td>
        </tr>`
    )
    .join("");

  const emptyRow = `<tr><td colspan="4" class="empty">Nenhuma movimentação no período selecionado.</td></tr>`;

  const generatedLabel = `${formatDate(toIsoDay(generatedAt))} às ${generatedAt
    .getHours()
    .toString()
    .padStart(2, "0")}:${generatedAt.getMinutes().toString().padStart(2, "0")}`;

  const logoHtml = logoUrl
    ? `<img class="logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(clubName)}" />`
    : "";

  const summaryCard = (label: string, value: string, modifier = "") =>
    `<div class="card ${modifier}"><span class="card-label">${label}</span><span class="card-value">${escapeHtml(
      value
    )}</span></div>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Balanço Financeiro - ${escapeHtml(clubName)}</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    color: #1a1a1a;
    background: #ffffff;
    font-size: 12px;
    line-height: 1.45;
  }
  .page { max-width: 800px; margin: 0 auto; padding: 32px 28px; }
  header {
    border-bottom: 4px solid #c8102e;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .header-top { display: flex; align-items: center; gap: 16px; }
  .logo { width: 64px; height: 64px; object-fit: contain; flex-shrink: 0; }
  .header-text { min-width: 0; }
  .eyebrow { text-transform: uppercase; letter-spacing: 3px; font-size: 10px; color: #b8860b; margin: 0 0 4px; font-weight: 700; }
  h1 { font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
  .club { font-size: 14px; font-weight: 700; margin: 2px 0 0; color: #c8102e; }
  .meta { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 12px; font-size: 11px; color: #555; }
  .meta strong { color: #1a1a1a; }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px; }
  .card { border: 1px solid #e2e2e2; border-radius: 6px; padding: 12px 14px; background: #fafafa; }
  .card-label { display: block; text-transform: uppercase; letter-spacing: 1px; font-size: 9px; color: #777; margin-bottom: 6px; }
  .card-value { display: block; font-size: 18px; font-weight: 800; }
  .card.in .card-value { color: #15803d; }
  .card.out .card-value { color: #c8102e; }
  .card.balance { background: #1a1a1a; border-color: #1a1a1a; }
  .card.balance .card-label { color: #b8860b; }
  .card.balance .card-value { color: #ffffff; }
  .subcards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px; }
  .subcard { border: 1px solid #e2e2e2; border-radius: 6px; padding: 10px; text-align: center; }
  .subcard span { display: block; }
  .subcard .l { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #777; margin-bottom: 4px; }
  .subcard .v { font-size: 13px; font-weight: 700; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #1a1a1a; padding-bottom: 6px; margin: 0 0 10px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { text-align: left; text-transform: uppercase; font-size: 9px; letter-spacing: 1px; color: #555; border-bottom: 1px solid #ccc; padding: 8px 8px; }
  tbody td { padding: 7px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
  tbody tr:nth-child(even) { background: #fafafa; }
  .num { text-align: right; white-space: nowrap; font-weight: 700; font-variant-numeric: tabular-nums; }
  .num.in { color: #15803d; }
  .num.out { color: #c8102e; }
  .empty { text-align: center; color: #999; padding: 24px 8px; }
  tfoot td { padding: 10px 8px; font-weight: 800; border-top: 2px solid #1a1a1a; }
  tfoot .num { font-size: 14px; }
  footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e2e2; font-size: 10px; color: #888; text-align: center; }
  @media print {
    .page { padding: 0; max-width: none; }
    body { font-size: 11px; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="page">
    <header>
      <div class="header-top">
        ${logoHtml}
        <div class="header-text">
          <p class="eyebrow">Balanço Financeiro</p>
          <h1>Balanço Financeiro</h1>
          <p class="club">${escapeHtml(clubName)}</p>
        </div>
      </div>
      <div class="meta">
        <span>Período: <strong>${escapeHtml(periodLabel(config))}</strong></span>
        <span>Emitido em: <strong>${escapeHtml(generatedLabel)}</strong></span>
      </div>
    </header>

    <div class="cards">
      ${summaryCard("Total de Entradas", formatCurrency(entradasTotal), "in")}
      ${summaryCard("Total de Saídas", formatCurrency(gastosTotal), "out")}
      ${summaryCard("Saldo", formatCurrency(saldo), "balance")}
    </div>

    <div class="subcards">
      <div class="subcard"><span class="l">Mensalidades</span><span class="v">${escapeHtml(formatCurrency(mensalidadesTotal))}</span></div>
      <div class="subcard"><span class="l">Receitas</span><span class="v">${escapeHtml(formatCurrency(receitasTotal))}</span></div>
      <div class="subcard"><span class="l">Patrocínios</span><span class="v">${escapeHtml(formatCurrency(patrociniosTotal))}</span></div>
      <div class="subcard"><span class="l">Gastos</span><span class="v">${escapeHtml(formatCurrency(gastosTotal))}</span></div>
    </div>

    <h2>Movimentações (${movements.length})</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 90px">Data</th>
          <th style="width: 90px">Tipo</th>
          <th>Descrição</th>
          <th style="width: 120px; text-align: right">Valor</th>
        </tr>
      </thead>
      <tbody>
        ${rows || emptyRow}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3">Saldo do período</td>
          <td class="num ${saldo >= 0 ? "in" : "out"}">${escapeHtml(formatCurrency(saldo))}</td>
        </tr>
      </tfoot>
    </table>

    <footer>
      Documento gerado automaticamente pelo painel administrativo do ${escapeHtml(clubName)}.
    </footer>
  </div>
</body>
</html>`;
}

/** Abre o relatório num iframe oculto e dispara a impressão (Salvar como PDF). */
export function printFinanceReport(html: string) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";

  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  let printed = false;
  const triggerPrint = () => {
    if (printed) return;
    printed = true;
    const win = iframe.contentWindow;
    if (!win) return;
    win.focus();
    win.print();
    window.setTimeout(() => iframe.remove(), 1000);
  };

  // Aguarda todas as imagens (ex.: escudo do clube) carregarem antes de imprimir,
  // com um fallback de tempo para não travar caso alguma imagem demore.
  const images = Array.from(doc.images || []);
  const pending = images.filter((img) => !img.complete);
  if (pending.length === 0) {
    window.setTimeout(triggerPrint, 100);
  } else {
    let remaining = pending.length;
    const onSettle = () => {
      remaining -= 1;
      if (remaining <= 0) triggerPrint();
    };
    pending.forEach((img) => {
      img.addEventListener("load", onSettle);
      img.addEventListener("error", onSettle);
    });
  }
  window.setTimeout(triggerPrint, 6000);
}
