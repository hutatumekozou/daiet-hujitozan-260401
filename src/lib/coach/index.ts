import { mockCoachAdapter } from "@/lib/coach/mock-adapter";
import { openAICoachAdapter } from "@/lib/coach/openai-adapter";
import type {
  GenerateDailyPlanInput,
  GenerateWeeklySummaryInput,
} from "@/lib/coach/types";

function getAdapter(provider?: string) {
  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    return openAICoachAdapter;
  }

  return mockCoachAdapter;
}

export async function generateDailyPlan(
  input: GenerateDailyPlanInput,
  provider?: string,
) {
  return getAdapter(provider).generateDailyPlan(input);
}

export async function generateWeeklySummary(
  input: GenerateWeeklySummaryInput,
  provider?: string,
) {
  return getAdapter(provider).generateWeeklySummary(input);
}
