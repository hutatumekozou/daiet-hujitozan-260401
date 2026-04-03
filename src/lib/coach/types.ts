import type { CheckinInput, DailyPlanResponse, WeeklySummaryResponse } from "@/lib/schemas";

export type CoachProfile = {
  age: number;
  gender: string;
  heightCm: number;
  startWeightKg: number;
  targetWeightKg: number;
  targetBodyFatPct?: number | null;
  gymTime: string;
  morningWorkout: boolean;
  currentStrengthLevel: string;
  currentCardioLevel: string;
};

export type RecentLogEntry = {
  day: string;
  weightKg: number;
  sleepHours: number;
  conditionScore: number;
  moodScore: number;
  bingeRiskScore: number;
  mealScore: number;
  didGym: boolean;
  completedPlan: boolean;
  completedBPlan: boolean;
  bingeAte: boolean;
  workoutPerformed?: string;
  comment?: string;
  totalMeters?: number;
};

export type GenerateDailyPlanInput = {
  profile: CoachProfile;
  aiTone: string;
  today: string;
  todayCheckin: Partial<CheckinInput> | null;
  recentLogs: RecentLogEntry[];
};

export type GenerateWeeklySummaryInput = {
  profile: CoachProfile;
  aiTone: string;
  weekLabel: string;
  recentLogs: RecentLogEntry[];
};

export type CoachAdapter = {
  generateDailyPlan(input: GenerateDailyPlanInput): Promise<DailyPlanResponse>;
  generateWeeklySummary(
    input: GenerateWeeklySummaryInput,
  ): Promise<WeeklySummaryResponse>;
};
