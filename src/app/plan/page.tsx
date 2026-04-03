import { addDays, isSameDay } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { refreshDailyPlanAction } from "@/app/actions";
import { RefreshPlanButton } from "@/components/plan/refresh-plan-button";
import { Card } from "@/components/ui/card";
import { formatDate, formatDayKey, parseDayString, today } from "@/lib/date";
import { getPlanModeLabel, getDashboardPageData } from "@/lib/server/app-data";

export const dynamic = "force-dynamic";

type PlanPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getPlanHeaderLabel(planDate: Date) {
  if (isSameDay(planDate, today())) {
    return "今日のAI提案";
  }

  if (isSameDay(planDate, addDays(today(), 1))) {
    return "明日のAI提案";
  }

  return `${formatDate(planDate, "M月d日(E)")}のAI提案`;
}

export default async function PlanPage({ searchParams }: PlanPageProps) {
  const query = searchParams ? await searchParams : {};
  const planDate = parseDayString(getSingleParam(query.day));
  const fromCheckin = getSingleParam(query.from) === "checkin";
  const refreshed = getSingleParam(query.refreshed) === "1";
  const data = await getDashboardPageData(planDate);

  if (!data || !data.plan) {
    return (
      <Card>
        <h2 className="section-title">提案を出すにはチェックインが必要です</h2>
      </Card>
    );
  }

  return (
    <>
      <Card className="app-gradient">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="mini-label">{getPlanHeaderLabel(planDate)}</p>
            <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
              対象日: {formatDate(planDate, "M月d日(E)")} の運動提案
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{getPlanModeLabel(data.plan)}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{data.plan.summary}</p>
            {fromCheckin ? (
              <p className="mt-3 text-sm font-medium text-[var(--primary)]">
                今日の記録をもとに、次のトレーニングプランを更新しました。
              </p>
            ) : null}
            {refreshed ? (
              <p className="mt-2 text-sm font-medium text-[var(--success)]">
                {formatDate(planDate, "M月d日(E)")} の提案を再生成しました。
              </p>
            ) : null}
          </div>
          <form action={refreshDailyPlanAction}>
            <input name="day" type="hidden" value={formatDayKey(planDate)} />
            <RefreshPlanButton />
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
