import { AlertTriangle, RefreshCcw } from "lucide-react";
import { refreshDailyPlanAction } from "@/app/actions";
import { Card } from "@/components/ui/card";
import { getPlanModeLabel, getDashboardPageData } from "@/lib/server/app-data";

export default async function PlanPage() {
  const data = await getDashboardPageData();

  if (!data || !data.plan) {
    return (
      <Card>
        <h2 className="section-title">今日の提案を出すにはチェックインが必要です</h2>
      </Card>
    );
  }

  return (
    <>
      <Card className="app-gradient">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="mini-label">AI Coach</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{getPlanModeLabel(data.plan)}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{data.plan.summary}</p>
          </div>
          <form action={refreshDailyPlanAction}>
            <button className="secondary-button px-4 py-3" type="submit">
              <RefreshCcw className="h-4 w-4" />
              再生成
            </button>
          </form>
        </div>
      </Card>

      <div className="grid gap-4">
        {[
          ["ウォームアップ", data.plan.warmup],
          ["筋トレ", data.plan.strength],
          ["有酸素", data.plan.cardio],
          ["クールダウン", data.plan.cooldown],
          ["Bプラン", data.plan.bPlan],
          ["食事の注意点", data.plan.foodAdvice],
          ["モチベーション", data.plan.motivation],
        ].map(([title, body]) => (
          <Card key={title}>
            <p className="mini-label">{title}</p>
            <p className="mt-3 text-sm leading-7">{body}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-[var(--accent)]" />
          <div>
            <p className="section-title">注意レベル {data.plan.cautionLevel}/5</p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              今日は無理をして予定を達成するより、明日も続けられる状態で終えることを優先します。
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}
