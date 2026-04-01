"use client";

import dynamic from "next/dynamic";

const WeightTrendChart = dynamic(
  () =>
    import("@/components/analytics/weight-trend-chart").then(
      (module) => module.WeightTrendChart,
    ),
  {
    ssr: false,
    loading: () => <div className="h-72 w-full rounded-[22px] bg-white/70" />,
  },
);

export function WeightTrendChartPanel({
  data,
}: {
  data: Array<{ day: string; weightKg: number; meters: number }>;
}) {
  return <WeightTrendChart data={data} />;
}
