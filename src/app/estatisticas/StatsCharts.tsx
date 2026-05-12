"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { TeamStatsSummary } from "@/types";

export function StatsCharts({ teamStats }: { teamStats: TeamStatsSummary }) {
  return (
    <>
      <div className="min-w-0 bg-brand-black-2 border border-brand-border rounded-sm p-4 sm:p-5 h-[320px]">
        <h3 className="font-display uppercase text-sm tracking-wider text-brand-gold mb-3">
          Gols por mês
        </h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={teamStats.goalsByMonth}>
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis dataKey="month" stroke="#9a9a9a" fontSize={12} />
            <YAxis stroke="#9a9a9a" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#141414", border: "1px solid #262626", fontSize: 12 }}
            />
            <Bar dataKey="goals" fill="#c8102e" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="min-w-0 bg-brand-black-2 border border-brand-border rounded-sm p-4 sm:p-5 h-[320px]">
        <h3 className="font-display uppercase text-sm tracking-wider text-brand-gold mb-3">
          Aproveitamento por competição
        </h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={teamStats.winRateByCompetition} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid stroke="#262626" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} stroke="#9a9a9a" fontSize={12} />
            <YAxis type="category" dataKey="competition" stroke="#9a9a9a" fontSize={12} width={110} />
            <Tooltip
              contentStyle={{ background: "#141414", border: "1px solid #262626", fontSize: 12 }}
              formatter={(v) => `${v}%`}
            />
            <Bar dataKey="rate" radius={[0, 2, 2, 0]}>
              {teamStats.winRateByCompetition.map((_, i) => (
                <Cell key={i} fill={i % 2 === 0 ? "#c8102e" : "#d4af37"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
