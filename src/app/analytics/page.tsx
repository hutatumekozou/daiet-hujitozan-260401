import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { WeightTrendChartPanel } from "@/components/analytics/weight-trend-chart-panel";
import { Card } from "@/components/ui/card";
import { getAnalyticsPageData } from "@/lib/server/app-data";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const data = await getAnalyticsPageData();

  if (!data) {
    return (
      <Card>
        <h2 className="section-title">分析データがありません</h2>
      </Card>
    );
  }

  const chartData = data.checkins.map((item) => ({
    day: format(item.day, "M/d", { locale: ja }),
    weightKg: item.weightKg,
    meters:
      data.progressLogs.find((log) => log.day.toISOString() === item.day.toISOString())
        ?.totalMeters ?? 0,
  }));

  return (
    <>
      <Card className="app-gradient">
        <p className="mini-label">分析</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">体重推移と崩れやすい条件</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          数字だけで責めるのではなく、「どんな日に崩れやすいか」を見つけて、次の対策へつなげます。
        </p>
      </Card>

      <Card>
        <h3 className="section-title">体重推移グラフ</h3>
        <div className="mt-4">
          <WeightTrendChartPanel data={chartData} />
        </div>
      </Card>

      <Card>
        <h3 className="section-title">週間前進量</h3>
        <div className="mt-4 grid gap-3">
          {data.weeklyMetersSeries.map((item) => (
            <div key={item.week} className="soft-card rounded-[22px] p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium">{item.week} 週</p>
                <p className="text-sm font-semibold">{item.totalMeters}m</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="section-title">暴飲暴食が起きやすい条件</h3>
        <div className="mt-4 space-y-3">
          {data.triggerNotes.map((note) => (
            <div key={note} className="soft-card rounded-[22px] p-4 text-sm leading-7">
              {note}
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
