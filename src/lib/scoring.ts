import type { AppSettings, DailyCheckin } from "@prisma/client";
import { DEFAULT_SCORE_SETTINGS, FUJI_ALTITUDE_METERS } from "@/lib/constants";
import { clamp } from "@/lib/utils";

export type ScoreSettings = Pick<
  AppSettings,
  | "gymVisitMeters"
  | "planCompletedMeters"
  | "bPlanMeters"
  | "weightLogMeters"
  | "checkinMeters"
  | "noBingeMeters"
  | "healthyAteOutMeters"
  | "stepBonusThreshold"
  | "stepBonusMeters"
  | "bingePenaltyMeters"
  | "skipPenaltyMeters"
  | "minimumActiveDayMeters"
>;

export type BreakdownItem = {
  type: string;
  label: string;
  metersDelta: number;
  note?: string;
};

export type DailyProgressResult = {
  totalMeters: number;
  breakdown: BreakdownItem[];
};

export function resolveScoreSettings(
  settings?: Partial<ScoreSettings> | null,
): ScoreSettings {
  return {
    gymVisitMeters: settings?.gymVisitMeters ?? DEFAULT_SCORE_SETTINGS.gymVisitMeters,
    planCompletedMeters:
      settings?.planCompletedMeters ?? DEFAULT_SCORE_SETTINGS.planCompletedMeters,
    bPlanMeters: settings?.bPlanMeters ?? DEFAULT_SCORE_SETTINGS.bPlanMeters,
    weightLogMeters:
      settings?.weightLogMeters ?? DEFAULT_SCORE_SETTINGS.weightLogMeters,
    checkinMeters: settings?.checkinMeters ?? DEFAULT_SCORE_SETTINGS.checkinMeters,
    noBingeMeters: settings?.noBingeMeters ?? DEFAULT_SCORE_SETTINGS.noBingeMeters,
    healthyAteOutMeters:
      settings?.healthyAteOutMeters ?? DEFAULT_SCORE_SETTINGS.healthyAteOutMeters,
    stepBonusThreshold:
      settings?.stepBonusThreshold ?? DEFAULT_SCORE_SETTINGS.stepBonusThreshold,
    stepBonusMeters:
      settings?.stepBonusMeters ?? DEFAULT_SCORE_SETTINGS.stepBonusMeters,
    bingePenaltyMeters:
      settings?.bingePenaltyMeters ?? DEFAULT_SCORE_SETTINGS.bingePenaltyMeters,
    skipPenaltyMeters:
      settings?.skipPenaltyMeters ?? DEFAULT_SCORE_SETTINGS.skipPenaltyMeters,
    minimumActiveDayMeters:
      settings?.minimumActiveDayMeters ?? DEFAULT_SCORE_SETTINGS.minimumActiveDayMeters,
  };
}

export function calculateDailyProgress(
  checkin: Pick<
    DailyCheckin,
    | "weightKg"
    | "didGym"
    | "completedPlan"
    | "completedBPlan"
    | "steps"
    | "mealScore"
    | "ateOut"
    | "bingeAte"
  >,
  settings?: Partial<ScoreSettings> | null,
): DailyProgressResult {
  const scoreSettings = resolveScoreSettings(settings);
  const breakdown: BreakdownItem[] = [];

  breakdown.push({
    type: "CHECKIN",
    label: "今日の記録をつけた",
    metersDelta: scoreSettings.checkinMeters,
  });

  if (Number.isFinite(checkin.weightKg)) {
    breakdown.push({
      type: "WEIGHT_LOG",
      label: "体重を記録した",
      metersDelta: scoreSettings.weightLogMeters,
    });
  }

  if (checkin.didGym) {
    breakdown.push({
      type: "GYM_VISIT",
      label: "ジムへ行った",
      metersDelta: scoreSettings.gymVisitMeters,
    });
  }

  if (checkin.completedPlan) {
    breakdown.push({
      type: "PLAN_COMPLETED",
      label: "提案メニューを完了した",
      metersDelta: scoreSettings.planCompletedMeters,
    });
  }

  if (checkin.completedBPlan) {
    breakdown.push({
      type: "B_PLAN_COMPLETED",
      label: "Bプランでゼロ回避できた",
      metersDelta: scoreSettings.bPlanMeters,
    });
  }

  if (!checkin.bingeAte) {
    breakdown.push({
      type: "NO_BINGE",
      label: "暴飲暴食を回避した",
      metersDelta: scoreSettings.noBingeMeters,
    });
  }

  if (checkin.ateOut && checkin.mealScore >= 4 && !checkin.bingeAte) {
    breakdown.push({
      type: "HEALTHY_ATE_OUT",
      label: "外食でより良い選択ができた",
      metersDelta: scoreSettings.healthyAteOutMeters,
    });
  }

  if ((checkin.steps ?? 0) >= scoreSettings.stepBonusThreshold) {
    breakdown.push({
      type: "STEP_BONUS",
      label: `${scoreSettings.stepBonusThreshold.toLocaleString()}歩を超えた`,
      metersDelta: scoreSettings.stepBonusMeters,
    });
  }

  if (checkin.bingeAte) {
    breakdown.push({
      type: "BINGE_PENALTY",
      label: "暴飲暴食があった",
      metersDelta: scoreSettings.bingePenaltyMeters,
    });
  }

  let totalMeters = breakdown.reduce((sum, item) => sum + item.metersDelta, 0);

  if (totalMeters < scoreSettings.minimumActiveDayMeters) {
    breakdown.push({
      type: "RESCUE",
      label: "再開しやすさを優先した救済ライン",
      metersDelta: scoreSettings.minimumActiveDayMeters - totalMeters,
    });
    totalMeters = scoreSettings.minimumActiveDayMeters;
  }

  return {
    totalMeters,
    breakdown,
  };
}

export function calculateSkipDayProgress(
  settings?: Partial<ScoreSettings> | null,
): DailyProgressResult {
  const scoreSettings = resolveScoreSettings(settings);

  return {
    totalMeters: scoreSettings.skipPenaltyMeters,
    breakdown: [
      {
        type: "SKIP_PENALTY",
        label: "無断スキップ",
        metersDelta: scoreSettings.skipPenaltyMeters,
      },
    ],
  };
}

export function calculateProgressPercent(cumulativeMeters: number) {
  return clamp((cumulativeMeters / FUJI_ALTITUDE_METERS) * 100, 0, 100);
}
