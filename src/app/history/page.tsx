import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { getHistoryPageData } from "@/lib/server/app-data";

export default async function HistoryPage() {
  const data = await getHistoryPageData();

  if (!data) {
    return (
      <Card>
        <h2 className="section-title">履歴データがありません</h2>
      </Card>
    );
  }

  return (
    <>
      <Card className="app-gradient">
        <p className="mini-label">実績ログ</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">日別一覧と週別サマリー</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          うまくいった日だけでなく、崩れた日の前後も見返せるようにしています。
        </p>
      </Card>

      <Card>
        <h3 className="section-title">日別一覧</h3>
        <div className="mt-4 space-y-3">
          {data.checkins.map((item) => (
            <div key={item.id} className="soft-card rounded-[22px] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {format(item.day, "M/d(E)", { locale: ja })}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    体重 {item.weightKg.toFixed(1)}kg / 睡眠 {item.sleepHours}h / 食事 {item.mealScore}/5
                  </p>
                </div>
                <p className={`text-sm font-semibold ${((item.progressLog?.totalMeters ?? 0) < 0) ? "status-danger" : "status-good"}`}>
                  {item.progressLog?.totalMeters ?? 0}m
                </p>
              </div>
              <p className="mt-3 text-sm leading-7">
                {item.workoutPerformed || item.comment || "メモなし"}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="section-title">週別サマリー</h3>
        <div className="mt-4 space-y-3">
          {data.weeklySummaries.map((item) => (
            <div key={item.id} className="soft-card rounded-[22px] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {format(item.weekStart, "M/d", { locale: ja })} 週
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.summaryText}</p>
                </div>
                <p className={`text-sm font-semibold ${item.deltaVsPrevious >= 0 ? "status-good" : "status-danger"}`}>
                  先週比 {item.deltaVsPrevious >= 0 ? "+" : ""}
                  {item.deltaVsPrevious}m
                </p>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="mini-label">うまくいったこと</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7">{item.successfulActions}</p>
                </div>
                <div>
                  <p className="mini-label">次週の重点</p>
                  <p className="mt-2 text-sm leading-7">{item.nextFocus}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
