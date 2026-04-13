"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function PlayerGoalsChart({
  data,
}: {
  data: { month: string; goals: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
        <CartesianGrid stroke="#262626" vertical={false} />
        <XAxis dataKey="month" stroke="#9a9a9a" fontSize={12} />
        <YAxis stroke="#9a9a9a" fontSize={12} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "#141414",
            border: "1px solid #262626",
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="goals"
          stroke="#c8102e"
          strokeWidth={3}
          dot={{ fill: "#d4af37", r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
