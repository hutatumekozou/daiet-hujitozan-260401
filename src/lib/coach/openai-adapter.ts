import { OpenAI } from "openai";
import {
  dailyPlanResponseSchema,
  weeklySummaryResponseSchema,
} from "@/lib/schemas";
import { applyStrengthLoadGuidance } from "@/lib/coach/strength-guidance";
import {
  buildDailyPlanPrompt,
  buildWeeklySummaryPrompt,
} from "@/lib/coach/prompts";
import type {
  CoachAdapter,
  GenerateDailyPlanInput,
  GenerateWeeklySummaryInput,
} from "@/lib/coach/types";

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

async function getStructuredJson(prompt: string) {
  if (!client) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
    input: prompt,
    text: {
      format: {
        type: "json_object",
      },
    },
  });

  const output = response.output_text;

  if (!output) {
    throw new Error("OpenAI response was empty.");
  }

  return JSON.parse(output) as unknown;
}

export const openAICoachAdapter: CoachAdapter = {
  async generateDailyPlan(input: GenerateDailyPlanInput) {
    const json = await getStructuredJson(buildDailyPlanPrompt(input));
    return applyStrengthLoadGuidance(
      dailyPlanResponseSchema.parse(json),
      input.profile,
    );
  },

  async generateWeeklySummary(input: GenerateWeeklySummaryInput) {
    const json = await getStructuredJson(buildWeeklySummaryPrompt(input));
    return weeklySummaryResponseSchema.parse(json);
  },
};
