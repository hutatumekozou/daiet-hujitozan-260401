"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function WeightTrendChart({
  data,
}: {
  data: Array<{ day: string; weightKg: number; meters: number }>;
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-[22px] bg-white/70 px-4 py-8 text-center text-sm text-[var(--muted)]">
        記録が増えるとグラフが表示されます。
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 4, left: -16 }}>
          <CartesianGrid stroke="rgba(23,49,59,0.08)" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#68818b" }} />
          <YAxis tick={{ fontSize: 12, fill: "#68818b" }} domain={["dataMin - 1", "dataMax + 1"]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="weightKg"
            stroke="#1b728f"
            strokeWidth={3}
            dot={{ fill: "#f18f3b", strokeWidth: 0, r: 4 }}
            name="体重"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
