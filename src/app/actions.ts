"use server";

import { addDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import type { ActionState } from "@/lib/action-state";
import { formatDayKey, parseDayString } from "@/lib/date";
import {
  ensureDailyPlan,
  saveDailyCheckin,
  saveSettings,
  saveUserProfile,
} from "@/lib/server/app-data";
import {
  checkinSchema,
  profileSchema,
  settingsSchema,
} from "@/lib/schemas";

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function parseZodError(error: ZodError): ActionState {
  return {
    status: "error",
    message: "入力内容を確認してください。",
    fieldErrors: error.flatten().fieldErrors,
  };
}

export async function saveProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = profileSchema.parse({
      age: formData.get("age"),
      gender: formData.get("gender"),
      heightCm: formData.get("heightCm"),
      startWeightKg: formData.get("startWeightKg"),
      startBodyFatPct: formData.get("startBodyFatPct"),
      targetWeightKg: formData.get("targetWeightKg"),
      targetBodyFatPct: formData.get("targetBodyFatPct"),
      goalDate: formData.get("goalDate"),
      currentStrengthLevel: formData.get("currentStrengthLevel"),
      currentCardioLevel: formData.get("currentCardioLevel"),
      gymTime: formData.get("gymTime"),
      morningWorkout: getBoolean(formData, "morningWorkout"),
      workoutContext: formData.get("workoutContext"),
    });

    await saveUserProfile(parsed);
    revalidatePath("/");
    revalidatePath("/dashboard");

    return {
      status: "success",
      message: "プロフィールを保存しました。",
      redirectTo: "/dashboard",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return parseZodError(error);
    }

    return {
      status: "error",
      message: error instanceof Error ? error.message : "プロフィール保存に失敗しました。",
    };
  }
}

export async function saveCheckinAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = checkinSchema.parse({
      day: formData.get("day"),
      weightKg: formData.get("weightKg"),
      bodyFatPct: formData.get("bodyFatPct"),
      sleepHours: formData.get("sleepHours"),
      conditionScore: formData.get("conditionScore"),
      moodScore: formData.get("moodScore"),
      bingeRiskScore: formData.get("bingeRiskScore"),
      didGym: getBoolean(formData, "didGym"),
      completedPlan: getBoolean(formData, "completedPlan"),
      completedBPlan: getBoolean(formData, "completedBPlan"),
      workoutPerformed: formData.get("workoutPerformed"),
      steps: formData.get("steps"),
      mealScore: formData.get("mealScore"),
      ateOut: getBoolean(formData, "ateOut"),
      bingeAte: getBoolean(formData, "bingeAte"),
      comment: formData.get("comment"),
    });

    await saveDailyCheckin(parsed);
    const nextPlanDay = addDays(parseDayString(parsed.day), 1);
    await ensureDailyPlan(nextPlanDay, true);

    revalidatePath("/dashboard");
    revalidatePath("/checkin");
    revalidatePath("/history");
    revalidatePath("/analytics");
    revalidatePath("/plan");

    return {
      status: "success",
      message: "今日の記録を保存しました。",
      redirectTo: `/plan?day=${formatDayKey(nextPlanDay)}&from=checkin`,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return parseZodError(error);
    }

    return {
      status: "error",
      message: error instanceof Error ? error.message : "記録の保存に失敗しました。",
    };
  }
}

export async function saveSettingsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = settingsSchema.parse({
      aiTone: formData.get("aiTone"),
      aiProvider: formData.get("aiProvider"),
      gymVisitMeters: formData.get("gymVisitMeters"),
      planCompletedMeters: formData.get("planCompletedMeters"),
      bPlanMeters: formData.get("bPlanMeters"),
      weightLogMeters: formData.get("weightLogMeters"),
      checkinMeters: formData.get("checkinMeters"),
      noBingeMeters: formData.get("noBingeMeters"),
      healthyAteOutMeters: formData.get("healthyAteOutMeters"),
      stepBonusThreshold: formData.get("stepBonusThreshold"),
      stepBonusMeters: formData.get("stepBonusMeters"),
      bingePenaltyMeters: formData.get("bingePenaltyMeters"),
      skipPenaltyMeters: formData.get("skipPenaltyMeters"),
      minimumActiveDayMeters: formData.get("minimumActiveDayMeters"),
    });

    await saveSettings(parsed);

    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/history");
    revalidatePath("/analytics");

    return {
      status: "success",
      message: "設定を保存しました。",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return parseZodError(error);
    }

    return {
      status: "error",
      message: error instanceof Error ? error.message : "設定の保存に失敗しました。",
    };
  }
}

export async function refreshDailyPlanAction(formData: FormData) {
  const day = parseDayString(String(formData.get("day") || ""));

  await ensureDailyPlan(day, true);
  revalidatePath("/dashboard");
  revalidatePath("/plan");
  redirect(`/plan?day=${formatDayKey(day)}&refreshed=1`);
}
