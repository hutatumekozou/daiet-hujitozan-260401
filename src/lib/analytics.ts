import type { DailyCheckin, ProgressScoreLog, UserProfile } from "@prisma/client";
import {
  differenceInCalendarDays,
  eachWeekOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
  subDays,
} from "date-fns";
import { ja } from "date-fns/locale";
import { calculateProgressPercent } from "@/lib/scoring";
import { today } from "@/lib/date";

type CheckinLike = Pick<
  DailyCheckin,
  "day" | "sleepHours" | "moodScore" | "bingeRiskScore" | "ateOut" | "bingeAte" | "mealScore"
>;

type ProgressLike = Pick<ProgressScoreLog, "day" | "totalMeters" | "cumulativeMeters">;

export function computeStreakDays(checkins: Pick<DailyCheckin, "day">[]) {
  if (checkins.length === 0) {
    return 0;
  }

  const sorted = [...checkins].sort((a, b) => b.day.getTime() - a.day.getTime());
  const baseline = today();
  const firstRelevant = isSameDay(sorted[0].day, baseline)
    ? sorted[0].day
    : isSameDay(sorted[0].day, subDays(baseline, 1))
      ? sorted[0].day
      : null;

  if (!firstRelevant) {
    return 0;
  }

  let streak = 0;
  let cursor = firstRelevant;

  for (const item of sorted) {
    if (differenceInCalendarDays(cursor, item.day) === 0) {
      streak += 1;
      cursor = subDays(cursor, 1);
    } else if (item.day.getTime() < cursor.getTime()) {
      break;
    }
  }

  return streak;
}

export function currentWeekMeters(progressLogs: ProgressLike[], baseDate = today()) {
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 });

  return progressLogs
    .filter((item) => item.day >= weekStart && item.day <= weekEnd)
    .reduce((sum, item) => sum + item.totalMeters, 0);
}

export function buildTriggerNotes(checkins: CheckinLike[]) {
  if (checkins.length === 0) {
    return ["記録が増えると暴食トリガーの傾向が見えてきます。"];
  }

  const bingeDays = checkins.filter((item) => item.bingeAte);

  if (bingeDays.length === 0) {
    return ["暴飲暴食の記録はまだ少なく、現状は回避できています。"];
  }

  const notes: string[] = [];
  const lowSleepRatio = bingeDays.filter((item) => item.sleepHours < 6).length / bingeDays.length;
  const lowMoodRatio = bingeDays.filter((item) => item.moodScore <= 2).length / bingeDays.length;
  const ateOutRatio = bingeDays.filter((item) => item.ateOut).length / bingeDays.length;
  const highRiskRatio =
    bingeDays.filter((item) => item.bingeRiskScore >= 4).length / bingeDays.length;

  if (lowSleepRatio >= 0.4) {
    notes.push("睡眠6時間未満の日に暴食が起きやすい傾向があります。");
  }

  if (lowMoodRatio >= 0.4) {
    notes.push("気分が落ちた日に食欲が暴走しやすいです。");
  }

  if (ateOutRatio >= 0.4) {
    notes.push("外食のある日は選択の難易度が上がっています。");
  }

  if (highRiskRatio >= 0.6) {
    notes.push("朝の時点で食欲暴走リスクが高い日は、先にBプランを確保すると安全です。");
  }

  return notes.length > 0 ? notes : ["記録を続けると、暴食トリガーの輪郭がもっと明確になります。"];
}

export function summarizeWeek(
  weekStart: Date,
  progressLogs: ProgressLike[],
  checkins: CheckinLike[],
) {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const logs = progressLogs.filter((item) => item.day >= weekStart && item.day <= weekEnd);
  const entries = checkins.filter((item) => item.day >= weekStart && item.day <= weekEnd);
  const totalMeters = logs.reduce((sum, item) => sum + item.totalMeters, 0);
  const gymCount = entries.filter((item) => "didGym" in item && (item as DailyCheckin).didGym).length;
  const bingeCount = entries.filter((item) => item.bingeAte).length;

  const wins = [
    gymCount > 0 ? `ジムに${gymCount}回行けた` : "記録を継続できた",
    entries.filter((item) => !item.bingeAte).length >= 5
      ? "暴飲暴食なしの日が多かった"
      : "Bプランでゼロを避けた日があった",
  ];

  const risks = [
    bingeCount > 0 ? `暴飲暴食が${bingeCount}回発生` : "大崩れは少なかった",
    entries.some((item) => item.sleepHours < 6)
      ? "睡眠不足の日は負荷を上げすぎない"
      : "引き続き朝の流れを固定する",
  ];

  return {
    label: `${format(weekStart, "M/d", { locale: ja })}週`,
    totalMeters,
    wins,
    risks,
    focus:
      bingeCount > 0
        ? "食欲暴走リスクが高い日は、最初からBプランに切り替える"
        : "朝のジム導線を維持して、通常プランの日を少しずつ増やす",
  };
}

export function buildWeeklyMetersSeries(progressLogs: ProgressLike[]) {
  if (progressLogs.length === 0) {
    return [];
  }

  const start = startOfWeek(progressLogs[0].day, { weekStartsOn: 1 });
  const end = endOfWeek(progressLogs[progressLogs.length - 1].day, { weekStartsOn: 1 });

  return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map((currentWeekStart) => {
    const totalMeters = progressLogs
      .filter(
        (item) =>
          item.day >= currentWeekStart &&
          item.day <= endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
      )
      .reduce((sum, item) => sum + item.totalMeters, 0);

    return {
      week: format(currentWeekStart, "M/d", { locale: ja }),
      totalMeters,
    };
  });
}

export function estimateGoalProgress(
  profile: Pick<UserProfile, "startWeightKg" | "targetWeightKg">,
  currentWeightKg: number | null,
  cumulativeMeters: number,
) {
  const progressByMountain = calculateProgressPercent(cumulativeMeters);
  const totalWeightDelta = profile.startWeightKg - profile.targetWeightKg;
  const weightProgress =
    currentWeightKg && totalWeightDelta > 0
      ? ((profile.startWeightKg - currentWeightKg) / totalWeightDelta) * 100
      : 0;

  return Math.max(0, Math.min(100, progressByMountain * 0.55 + weightProgress * 0.45));
}
