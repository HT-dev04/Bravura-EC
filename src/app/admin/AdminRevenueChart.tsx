"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", revenue: 2800 },
  { month: "Fev", revenue: 3400 },
  { month: "Mar", revenue: 4200 },
  { month: "Abr", revenue: 5100 },
  { month: "Mai", revenue: 4800 },
  { month: "Jun", revenue: 6200 },
];

export function AdminRevenueChart() {
  return (
    <ResponsiveContainer width="100%" height="85%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8102e" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#c8102e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#262626" vertical={false} />
        <XAxis dataKey="month" stroke="#9a9a9a" fontSize={12} />
        <YAxis stroke="#9a9a9a" fontSize={12} />
        <Tooltip
          contentStyle={{ background: "#141414", border: "1px solid #262626", fontSize: 12 }}
          formatter={(v) => `R$ ${v}`}
        />
        <Area type="monotone" dataKey="revenue" stroke="#c8102e" strokeWidth={2} fill="url(#rev)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
