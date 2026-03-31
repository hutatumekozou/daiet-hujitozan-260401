import { z } from "zod";

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    return value;
  }, schema.optional());

export const profileSchema = z.object({
  age: z.coerce.number().int().min(18).max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  heightCm: z.coerce.number().int().min(120).max(230),
  startWeightKg: z.coerce.number().min(30).max(250),
  startBodyFatPct: emptyToUndefined(z.coerce.number().min(1).max(60)),
  targetWeightKg: z.coerce.number().min(30).max(250),
  targetBodyFatPct: emptyToUndefined(z.coerce.number().min(1).max(60)),
  goalDate: z.string().min(1),
  currentStrengthLevel: z.string().min(5).max(200),
  currentCardioLevel: z.string().min(5).max(200),
  gymTime: z.string().min(1),
  morningWorkout: z.boolean(),
  workoutContext: emptyToUndefined(z.string().max(240)),
});

export const checkinSchema = z.object({
  day: z.string().min(1),
  weightKg: z.coerce.number().min(30).max(250),
  bodyFatPct: emptyToUndefined(z.coerce.number().min(1).max(60)),
  sleepHours: z.coerce.number().min(0).max(24),
  conditionScore: z.coerce.number().int().min(1).max(5),
  moodScore: z.coerce.number().int().min(1).max(5),
  bingeRiskScore: z.coerce.number().int().min(1).max(5),
  didGym: z.boolean(),
  completedPlan: z.boolean(),
  completedBPlan: z.boolean(),
  workoutPerformed: emptyToUndefined(z.string().max(280)),
  steps: emptyToUndefined(z.coerce.number().int().min(0).max(100000)),
  mealScore: z.coerce.number().int().min(1).max(5),
  ateOut: z.boolean(),
  bingeAte: z.boolean(),
  comment: emptyToUndefined(z.string().max(600)),
});

export const settingsSchema = z.object({
  aiTone: z.enum(["balanced", "gentle", "firm"]),
  aiProvider: z.enum(["mock", "openai"]),
  gymVisitMeters: z.coerce.number().int().min(0).max(100),
  planCompletedMeters: z.coerce.number().int().min(0).max(100),
  bPlanMeters: z.coerce.number().int().min(0).max(100),
  weightLogMeters: z.coerce.number().int().min(0).max(30),
  checkinMeters: z.coerce.number().int().min(0).max(30),
  noBingeMeters: z.coerce.number().int().min(0).max(50),
  healthyAteOutMeters: z.coerce.number().int().min(0).max(50),
  stepBonusThreshold: z.coerce.number().int().min(1000).max(30000),
  stepBonusMeters: z.coerce.number().int().min(0).max(30),
  bingePenaltyMeters: z.coerce.number().int().min(-100).max(0),
  skipPenaltyMeters: z.coerce.number().int().min(-100).max(0),
  minimumActiveDayMeters: z.coerce.number().int().min(0).max(30),
});

export const dailyPlanResponseSchema = z.object({
  summary: z.string().min(1),
  today_plan: z.object({
    warmup: z.string().min(1),
    strength: z.string().min(1),
    cardio: z.string().min(1),
    cooldown: z.string().min(1),
  }),
  b_plan: z.string().min(1),
  food_advice: z.string().min(1),
  motivation: z.string().min(1),
  caution_level: z.coerce.number().int().min(1).max(5),
});

export const weeklySummaryResponseSchema = z.object({
  summary: z.string().min(1),
  wins: z.array(z.string()).min(1),
  risks: z.array(z.string()).min(1),
  focus: z.string().min(1),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type CheckinInput = z.infer<typeof checkinSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type DailyPlanResponse = z.infer<typeof dailyPlanResponseSchema>;
export type WeeklySummaryResponse = z.infer<typeof weeklySummaryResponseSchema>;
