import type {
  AppSettings,
  DailyPlan,
  UserProfile,
} from "@prisma/client";
import {
  ActivityType,
  CoachMessageKind,
  Prisma,
} from "@prisma/client";
import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfDay,
} from "date-fns";
import { ja } from "date-fns/locale";
import { buildTriggerNotes, buildWeeklyMetersSeries, computeStreakDays, currentWeekMeters, estimateGoalProgress, summarizeWeek } from "@/lib/analytics";
import { PLAN_MODE_LABELS } from "@/lib/constants";
import { formatDayKey, parseDayString, today, weekStart } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { calculateDailyProgress, calculateProgressPercent, calculateSkipDayProgress, resolveScoreSettings } from "@/lib/scoring";
import type { CheckinInput, ProfileInput, SettingsInput } from "@/lib/schemas";
import { generateDailyPlan, generateWeeklySummary } from "@/lib/coach";

type UserWithSettings = UserProfile & { settings: AppSettings | null };

async function getUserProfile() {
  return prisma.userProfile.findFirst({
    include: {
      settings: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

function toCoachProfile(profile: UserWithSettings) {
  return {
    age: profile.age,
    gender: profile.gender,
    heightCm: profile.heightCm,
    startWeightKg: profile.startWeightKg,
    targetWeightKg: profile.targetWeightKg,
    targetBodyFatPct: profile.targetBodyFatPct,
    gymTime: profile.gymTime,
    morningWorkout: profile.morningWorkout,
    currentStrengthLevel: profile.currentStrengthLevel,
    currentCardioLevel: profile.currentCardioLevel,
  };
}

async function getRecentLogs(userId: string, days = 7) {
  const baseDate = today();
  const since = addDays(baseDate, -(days - 1));
  const checkins = await prisma.dailyCheckin.findMany({
    where: {
      userId,
      day: {
        gte: since,
      },
    },
    orderBy: {
      day: "asc",
    },
    include: {
      progressLog: true,
    },
  });

  return checkins.map((item) => ({
    day: formatDayKey(item.day),
    weightKg: item.weightKg,
    sleepHours: item.sleepHours,
    conditionScore: item.conditionScore,
    moodScore: item.moodScore,
    bingeRiskScore: item.bingeRiskScore,
    mealScore: item.mealScore,
    didGym: item.didGym,
    completedPlan: item.completedPlan,
    completedBPlan: item.completedBPlan,
    bingeAte: item.bingeAte,
    totalMeters: item.progressLog?.totalMeters,
  }));
}

export async function rebuildDerivedData(userId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    include: { settings: true },
  });

  if (!profile) {
    return;
  }

  const checkins = await prisma.dailyCheckin.findMany({
    where: { userId },
    orderBy: { day: "asc" },
  });

  await prisma.activityLog.deleteMany({ where: { userId } });
  await prisma.progressScoreLog.deleteMany({ where: { userId } });
  await prisma.weeklySummary.deleteMany({ where: { userId } });
  await prisma.goalSnapshot.deleteMany({ where: { userId } });

  if (checkins.length === 0) {
    return;
  }

  const settings = resolveScoreSettings(profile.settings);
  const firstDay = startOfDay(checkins[0].day);
  const lastDay = startOfDay(today());
  const checkinMap = new Map(checkins.map((item) => [formatDayKey(item.day), item]));
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });

  let cumulativeMeters = 0;
  const activityRows: Prisma.ActivityLogCreateManyInput[] = [];
  const progressRows: Prisma.ProgressScoreLogCreateManyInput[] = [];
  const snapshotRows: Prisma.GoalSnapshotCreateManyInput[] = [];

  for (const day of days) {
    const checkin = checkinMap.get(formatDayKey(day));
    const result = checkin
      ? calculateDailyProgress(checkin, settings)
      : calculateSkipDayProgress(settings);

    cumulativeMeters = Math.max(0, cumulativeMeters + result.totalMeters);

    for (const entry of result.breakdown) {
      activityRows.push({
        userId,
        checkinId: checkin?.id,
        day,
        type: (entry.type in ActivityType
          ? entry.type
          : entry.type === "RESCUE"
            ? ActivityType.CHECKIN
            : ActivityType.SKIP_PENALTY) as ActivityType,
        label: entry.label,
        metersDelta: entry.metersDelta,
        note: entry.note,
      });
    }

    progressRows.push({
      userId,
      checkinId: checkin?.id,
      day,
      totalMeters: result.totalMeters,
      cumulativeMeters,
      note: checkin ? "記録あり" : "記録なし",
    });

    if (checkin) {
      snapshotRows.push({
        userId,
        capturedAt: day,
        weightKg: checkin.weightKg,
        bodyFatPct: checkin.bodyFatPct,
        cumulativeMeters,
        estimatedGoalProgress: estimateGoalProgress(profile, checkin.weightKg, cumulativeMeters),
        note: "日次スナップショット",
      });
    }
  }

  await prisma.activityLog.createMany({ data: activityRows });
  await prisma.progressScoreLog.createMany({ data: progressRows });
  await prisma.goalSnapshot.createMany({ data: snapshotRows });

  const createdProgressLogs = await prisma.progressScoreLog.findMany({
    where: { userId },
    orderBy: { day: "asc" },
  });

  const createdCheckins = await prisma.dailyCheckin.findMany({
    where: { userId },
    orderBy: { day: "asc" },
  });

  if (createdProgressLogs.length === 0) {
    return;
  }

  const weekStarts = Array.from(
    new Set(createdProgressLogs.map((item) => weekStart(item.day).toISOString())),
  ).map((item) => new Date(item));

  for (const currentWeekStart of weekStarts) {
    const summary = summarizeWeek(currentWeekStart, createdProgressLogs, createdCheckins);
    const previousWeekStart = addDays(currentWeekStart, -7);
    const previousWeekTotal = createdProgressLogs
      .filter(
        (item) =>
          item.day >= previousWeekStart &&
          item.day <= endOfWeek(previousWeekStart, { weekStartsOn: 1 }),
      )
      .reduce((sum, item) => sum + item.totalMeters, 0);

    await prisma.weeklySummary.create({
      data: {
        userId,
        weekStart: currentWeekStart,
        weekEnd: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
        totalMeters: summary.totalMeters,
        deltaVsPrevious: summary.totalMeters - previousWeekTotal,
        successfulActions: summary.wins.join("\n"),
        derailers: summary.risks.join("\n"),
        nextFocus: summary.focus,
        summaryText: `${summary.label}は合計${summary.totalMeters}m前進。`,
      },
    });
  }
}

export async function saveUserProfile(input: ProfileInput) {
  const existing = await prisma.userProfile.findFirst({
    include: {
      settings: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const data = {
    age: input.age,
    gender: input.gender,
    heightCm: input.heightCm,
    startWeightKg: input.startWeightKg,
    startBodyFatPct: input.startBodyFatPct,
    targetWeightKg: input.targetWeightKg,
    targetBodyFatPct: input.targetBodyFatPct,
    goalDate: parseDayString(input.goalDate),
    currentStrengthLevel: input.currentStrengthLevel,
    currentCardioLevel: input.currentCardioLevel,
    gymTime: input.gymTime,
    morningWorkout: input.morningWorkout,
    workoutContext: input.workoutContext,
  };

  const profile = existing
    ? await prisma.userProfile.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.userProfile.create({
        data,
      });

  await prisma.appSettings.upsert({
    where: { userId: profile.id },
    update: {},
    create: {
      userId: profile.id,
    },
  });

  return profile;
}

export async function saveDailyCheckin(input: CheckinInput) {
  const profile = await getUserProfile();

  if (!profile) {
    throw new Error("プロフィールが未設定です。先にオンボーディングを完了してください。");
  }

  const day = parseDayString(input.day);

  const checkin = await prisma.dailyCheckin.upsert({
    where: {
      userId_day: {
        userId: profile.id,
        day,
      },
    },
    update: {
      weightKg: input.weightKg,
      bodyFatPct: input.bodyFatPct,
      sleepHours: input.sleepHours,
      conditionScore: input.conditionScore,
      moodScore: input.moodScore,
      bingeRiskScore: input.bingeRiskScore,
      didGym: input.didGym,
      completedPlan: input.completedPlan,
      completedBPlan: input.completedBPlan,
      workoutPerformed: input.workoutPerformed,
      steps: input.steps,
      mealScore: input.mealScore,
      ateOut: input.ateOut,
      bingeAte: input.bingeAte,
      comment: input.comment,
    },
    create: {
      userId: profile.id,
      day,
      weightKg: input.weightKg,
      bodyFatPct: input.bodyFatPct,
      sleepHours: input.sleepHours,
      conditionScore: input.conditionScore,
      moodScore: input.moodScore,
      bingeRiskScore: input.bingeRiskScore,
      didGym: input.didGym,
      completedPlan: input.completedPlan,
      completedBPlan: input.completedBPlan,
      workoutPerformed: input.workoutPerformed,
      steps: input.steps,
      mealScore: input.mealScore,
      ateOut: input.ateOut,
      bingeAte: input.bingeAte,
      comment: input.comment,
    },
  });

  await prisma.dailyPlan.deleteMany({
    where: {
      userId: profile.id,
      day,
    },
  });

  await prisma.coachMessage.deleteMany({
    where: {
      userId: profile.id,
      day,
    },
  });

  await rebuildDerivedData(profile.id);

  return checkin;
}

export async function saveSettings(input: SettingsInput) {
  const profile = await getUserProfile();

  if (!profile) {
    throw new Error("プロフィールが未設定です。");
  }

  const settings = await prisma.appSettings.upsert({
    where: { userId: profile.id },
    update: input,
    create: {
      userId: profile.id,
      ...input,
    },
  });

  await rebuildDerivedData(profile.id);

  return settings;
}

export async function ensureDailyPlan(planDate = today(), forceRefresh = false) {
  const profile = await getUserProfile();

  if (!profile) {
    return null;
  }

  const day = startOfDay(planDate);

  if (!forceRefresh) {
    const existing = await prisma.dailyPlan.findUnique({
      where: {
        userId_day: {
          userId: profile.id,
          day,
        },
      },
    });

    if (existing) {
      return existing;
    }
  }

  const todayCheckin = await prisma.dailyCheckin.findUnique({
    where: {
      userId_day: {
        userId: profile.id,
        day,
      },
    },
  });

  const recentLogs = await getRecentLogs(profile.id, 7);
  const response = await generateDailyPlan(
    {
      profile: toCoachProfile(profile),
      aiTone: profile.settings?.aiTone ?? "balanced",
      today: formatDayKey(day),
      todayCheckin: todayCheckin
        ? {
            day: formatDayKey(todayCheckin.day),
            weightKg: todayCheckin.weightKg,
            bodyFatPct: todayCheckin.bodyFatPct ?? undefined,
            sleepHours: todayCheckin.sleepHours,
            conditionScore: todayCheckin.conditionScore,
            moodScore: todayCheckin.moodScore,
            bingeRiskScore: todayCheckin.bingeRiskScore,
            didGym: todayCheckin.didGym,
            completedPlan: todayCheckin.completedPlan,
            completedBPlan: todayCheckin.completedBPlan,
            workoutPerformed: todayCheckin.workoutPerformed ?? undefined,
            steps: todayCheckin.steps ?? undefined,
            mealScore: todayCheckin.mealScore,
            ateOut: todayCheckin.ateOut,
            bingeAte: todayCheckin.bingeAte,
            comment: todayCheckin.comment ?? undefined,
          }
        : null,
      recentLogs,
    },
    profile.settings?.aiProvider ?? process.env.AI_PROVIDER ?? "mock",
  );

  if (forceRefresh) {
    await prisma.coachMessage.deleteMany({
      where: {
        userId: profile.id,
        day,
      },
    });
  }

  const modeKey = response.summary.includes("回復")
    ? "RECOVERY"
    : response.summary.includes("Bプラン")
      ? "B_PLAN"
      : response.summary.includes("軽量")
        ? "LIGHT"
        : "STANDARD";

  const plan = await prisma.dailyPlan.upsert({
    where: {
      userId_day: {
        userId: profile.id,
        day,
      },
    },
    update: {
      planMode: modeKey,
      summary: response.summary,
      warmup: response.today_plan.warmup,
      strength: response.today_plan.strength,
      cardio: response.today_plan.cardio,
      cooldown: response.today_plan.cooldown,
      bPlan: response.b_plan,
      foodAdvice: response.food_advice,
      motivation: response.motivation,
      cautionLevel: response.caution_level,
      rawResponse: JSON.stringify(response),
    },
    create: {
      userId: profile.id,
      day,
      planMode: modeKey,
      summary: response.summary,
      warmup: response.today_plan.warmup,
      strength: response.today_plan.strength,
      cardio: response.today_plan.cardio,
      cooldown: response.today_plan.cooldown,
      bPlan: response.b_plan,
      foodAdvice: response.food_advice,
      motivation: response.motivation,
      cautionLevel: response.caution_level,
      rawResponse: JSON.stringify(response),
    },
  });

  await prisma.coachMessage.createMany({
    data: [
      {
        userId: profile.id,
        checkinId: todayCheckin?.id,
        dailyPlanId: plan.id,
        day,
        kind: CoachMessageKind.SUMMARY,
        content: response.summary,
      },
      {
        userId: profile.id,
        checkinId: todayCheckin?.id,
        dailyPlanId: plan.id,
        day,
        kind: CoachMessageKind.FOOD_ADVICE,
        content: response.food_advice,
      },
      {
        userId: profile.id,
        checkinId: todayCheckin?.id,
        dailyPlanId: plan.id,
        day,
        kind: CoachMessageKind.MOTIVATION,
        content: response.motivation,
      },
    ],
  });

  return plan;
}

export async function generateWeeklyCoachSummary(currentWeekStart = weekStart(today())) {
  const profile = await getUserProfile();

  if (!profile) {
    return null;
  }

  const entries = await getRecentLogs(profile.id, 7);

  return generateWeeklySummary(
    {
      profile: toCoachProfile(profile),
      aiTone: profile.settings?.aiTone ?? "balanced",
      weekLabel: `${format(currentWeekStart, "M/d", { locale: ja })}週`,
      recentLogs: entries,
    },
    profile.settings?.aiProvider ?? process.env.AI_PROVIDER ?? "mock",
  );
}

export async function getDashboardPageData() {
  const profile = await getUserProfile();

  if (!profile) {
    return null;
  }

  const [checkins, progressLogs, plan, weeklySummary] = await Promise.all([
    prisma.dailyCheckin.findMany({
      where: { userId: profile.id },
      orderBy: { day: "desc" },
      take: 21,
      include: { progressLog: true },
    }),
    prisma.progressScoreLog.findMany({
      where: { userId: profile.id },
      orderBy: { day: "desc" },
      take: 30,
    }),
    ensureDailyPlan(today()),
    prisma.weeklySummary.findFirst({
      where: { userId: profile.id },
      orderBy: { weekStart: "desc" },
    }),
  ]);

  const latestCheckin = checkins[0] ?? null;
  const todaysCheckin = checkins.find((item) => isSameDay(item.day, today())) ?? null;
  const todaysProgress = progressLogs.find((item) => isSameDay(item.day, today())) ?? null;
  const cumulativeMeters = progressLogs[0]?.cumulativeMeters ?? 0;
  const progressPercent = calculateProgressPercent(cumulativeMeters);

  return {
    profile,
    plan,
    weeklySummary,
    streakDays: computeStreakDays(checkins),
    weekMeters: currentWeekMeters(progressLogs),
    cumulativeMeters,
    progressPercent,
    remainingMeters: Math.max(0, 3776 - cumulativeMeters),
    todayMeters: todaysProgress?.totalMeters ?? 0,
    todayStatus: todaysCheckin
      ? todaysCheckin.completedPlan
        ? "通常プランを完了"
        : todaysCheckin.completedBPlan
          ? "Bプランで前進"
          : "記録済み。まだ少し登れる"
      : "まだ未チェックイン",
    latestWeightKg: latestCheckin?.weightKg ?? profile.startWeightKg,
    latestBodyFatPct: latestCheckin?.bodyFatPct ?? profile.startBodyFatPct,
  };
}

export async function getOnboardingPageData() {
  return getUserProfile();
}

export async function getCheckinPageData() {
  const profile = await getUserProfile();

  if (!profile) {
    return null;
  }

  const existing = await prisma.dailyCheckin.findUnique({
    where: {
      userId_day: {
        userId: profile.id,
        day: today(),
      },
    },
  });

  const latest = existing
    ? existing
    : await prisma.dailyCheckin.findFirst({
        where: { userId: profile.id },
        orderBy: { day: "desc" },
      });

  return {
    profile,
    checkin: existing,
    defaults: {
      day: formatDayKey(today()),
      weightKg: existing?.weightKg ?? latest?.weightKg ?? profile.startWeightKg,
      bodyFatPct: existing?.bodyFatPct ?? latest?.bodyFatPct ?? profile.startBodyFatPct,
      sleepHours: existing?.sleepHours ?? 6.5,
      conditionScore: existing?.conditionScore ?? 3,
      moodScore: existing?.moodScore ?? 3,
      bingeRiskScore: existing?.bingeRiskScore ?? 3,
      didGym: existing?.didGym ?? false,
      completedPlan: existing?.completedPlan ?? false,
      completedBPlan: existing?.completedBPlan ?? false,
      workoutPerformed: existing?.workoutPerformed ?? "",
      steps: existing?.steps ?? undefined,
      mealScore: existing?.mealScore ?? 3,
      ateOut: existing?.ateOut ?? false,
      bingeAte: existing?.bingeAte ?? false,
      comment: existing?.comment ?? "",
    },
  };
}

export async function getHistoryPageData() {
  const profile = await getUserProfile();

  if (!profile) {
    return null;
  }

  const [checkins, weeklySummaries, activities] = await Promise.all([
    prisma.dailyCheckin.findMany({
      where: { userId: profile.id },
      orderBy: { day: "desc" },
      take: 45,
      include: { progressLog: true },
    }),
    prisma.weeklySummary.findMany({
      where: { userId: profile.id },
      orderBy: { weekStart: "desc" },
      take: 8,
    }),
    prisma.activityLog.findMany({
      where: { userId: profile.id },
      orderBy: { day: "desc" },
      take: 40,
    }),
  ]);

  return { profile, checkins, weeklySummaries, activities };
}

export async function getAnalyticsPageData() {
  const profile = await getUserProfile();

  if (!profile) {
    return null;
  }

  const [checkins, progressLogs, weeklySummaries] = await Promise.all([
    prisma.dailyCheckin.findMany({
      where: { userId: profile.id },
      orderBy: { day: "asc" },
      take: 60,
    }),
    prisma.progressScoreLog.findMany({
      where: { userId: profile.id },
      orderBy: { day: "asc" },
      take: 60,
    }),
    prisma.weeklySummary.findMany({
      where: { userId: profile.id },
      orderBy: { weekStart: "asc" },
      take: 12,
    }),
  ]);

  return {
    profile,
    checkins,
    progressLogs,
    weeklySummaries,
    triggerNotes: buildTriggerNotes(checkins),
    weeklyMetersSeries: buildWeeklyMetersSeries(progressLogs),
  };
}

export async function getSettingsPageData() {
  const profile = await getUserProfile();

  if (!profile) {
    return null;
  }

  return {
    profile,
    settings: profile.settings,
  };
}

export function getPlanModeLabel(plan: DailyPlan | null) {
  if (!plan) {
    return "未生成";
  }

  return PLAN_MODE_LABELS[plan.planMode] ?? plan.planMode;
}
