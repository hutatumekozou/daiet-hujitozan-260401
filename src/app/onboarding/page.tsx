import { Target } from "lucide-react";
import { ProfileForm } from "@/components/forms/profile-form";
import { Card } from "@/components/ui/card";
import { getOnboardingPageData } from "@/lib/server/app-data";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const profile = await getOnboardingPageData();

  const defaults = profile
    ? {
        age: profile.age,
        gender: profile.gender,
        heightCm: profile.heightCm,
        startWeightKg: profile.startWeightKg,
        startBodyFatPct: profile.startBodyFatPct,
        targetWeightKg: profile.targetWeightKg,
        targetBodyFatPct: profile.targetBodyFatPct,
        goalDate: profile.goalDate.toISOString().slice(0, 10),
        currentStrengthLevel: profile.currentStrengthLevel,
        currentCardioLevel: profile.currentCardioLevel,
        gymTime: profile.gymTime,
        morningWorkout: profile.morningWorkout,
        workoutContext: profile.workoutContext,
      }
    : {
        age: 41,
        gender: "MALE",
        heightCm: 160,
        startWeightKg: 63,
        startBodyFatPct: 23,
        targetWeightKg: 55,
        targetBodyFatPct: 17,
        goalDate: "2026-09-30",
        currentStrengthLevel:
          "かなり非力。スクワットは頑張って30回連続、ダンベルは10kg前後がちょうどよい。",
        currentCardioLevel:
          "ランニングマシン 8.0km/h を5分でかなりきつい。まずは短時間から継続したい。",
        gymTime: "07:00",
        morningWorkout: true,
        workoutContext:
          "昼以降は意志力が落ちやすい。朝のシャワー後にそのままジムへ行く導線を固定したい。",
      };

  return (
    <>
      <Card className="app-gradient">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mini-label">Step 1 / 初期プロフィール</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              6か月の登山計画をセットする
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              最初から完璧な計画を作る必要はありません。まずは「朝に動き出せる形」と
              「失敗しても再開できる形」を優先します。
            </p>
          </div>
          <div className="pill">
            <Target className="h-4 w-4" />
            9/30 頂上
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="section-title">プロフィール設定</h3>
        <p className="mini-label mt-2">MVPでは単一ユーザー前提です。後から設定画面で調整できます。</p>
        <div className="mt-5">
          <ProfileForm defaultValues={defaults} />
        </div>
      </Card>
    </>
  );
}
