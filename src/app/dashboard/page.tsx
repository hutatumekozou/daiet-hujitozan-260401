import Link from "next/link";
import { ArrowRight, Flame, Sparkles } from "lucide-react";
import { MountainProgress } from "@/components/plan/mountain-progress";
import { Card } from "@/components/ui/card";
import { getDashboardPageData, getPlanModeLabel } from "@/lib/server/app-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardPageData();

  if (!data) {
    return (
      <Card>
        <h2 className="section-title">まずはプロフィール設定から</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          ユーザー情報がまだありません。最初の設定を済ませると、今日の現在地と伴走プランを表示できます。
        </p>
        <Link className="primary-button mt-5" href="/onboarding">
          オンボーディングへ
        </Link>
      </Card>
    );
  }

  return (
    <>
      <Card className="app-gradient">
        <p className="mini-label">今日の登山メモ</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          {data.todayStatus}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          今日は <strong>{data.todayMeters}m</strong> の前進。小さい日でもログが残れば、
          次の日の再開コストが下がります。
        </p>

        <div className="stats-grid mt-5">
          <div className="soft-card rounded-[22px] p-4">
            <p className="mini-label">連続記録</p>
            <p className="metric-value mt-2">{data.streakDays}日</p>
          </div>
          <div className="soft-card rounded-[22px] p-4">
            <p className="mini-label">今週の前進</p>
            <p className="metric-value mt-2">{data.weekMeters}m</p>
          </div>
          <div className="soft-card rounded-[22px] p-4">
            <p className="mini-label">最新体重</p>
            <p className="metric-value mt-2">{data.latestWeightKg.toFixed(1)}kg</p>
          </div>
          <div className="soft-card rounded-[22px] p-4">
            <p className="mini-label">最新体脂肪</p>
            <p className="metric-value mt-2">
              {data.latestBodyFatPct ? `${data.latestBodyFatPct.toFixed(1)}%` : "--"}
            </p>
          </div>
        </div>
      </Card>

      <MountainProgress
        cumulativeMeters={data.cumulativeMeters}
        progressPercent={data.progressPercent}
        remainingMeters={data.remainingMeters}
        todayMeters={data.todayMeters}
      />

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="mini-label">今日のAI提案</p>
            <h3 className="section-title mt-1">{getPlanModeLabel(data.plan)}</h3>
          </div>
          <Link className="secondary-button px-4 py-3" href="/plan">
            詳細を見る
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {data.plan ? (
          <>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{data.plan.summary}</p>
            <div className="mt-4 grid gap-3">
              <div className="soft-card rounded-[22px] p-4">
                <p className="mini-label">筋トレ</p>
                <p className="mt-2 text-sm leading-7">{data.plan.strength}</p>
              </div>
              <div className="soft-card rounded-[22px] p-4">
                <p className="mini-label">有酸素</p>
                <p className="mt-2 text-sm leading-7">{data.plan.cardio}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted)]">
            今日のプランはまだありません。チェックイン後に生成されます。
          </p>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-[var(--accent)]" />
            <h3 className="section-title">今週の重点</h3>
          </div>
          <p className="mt-4 text-sm leading-7">
            {data.weeklySummary?.nextFocus ?? "まだ週次サマリーがありません。まずは数日分の記録を積みましょう。"}
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--primary)]" />
            <h3 className="section-title">今日やること</h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
            <li>1. 体重を記録する</li>
            <li>2. 朝のジム導線を崩さない</li>
            <li>3. しんどい日はBプランでゼロ回避</li>
          </ul>
          <Link className="primary-button mt-5 w-full" href="/checkin">
            今日のチェックインへ
          </Link>
        </Card>
      </div>
    </>
  );
}
