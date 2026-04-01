import type { DailyPlanResponse } from "@/lib/schemas";
import type { CoachProfile } from "@/lib/coach/types";

function parseSuggestedDumbbellKg(currentStrengthLevel: string) {
  const match = currentStrengthLevel.match(/(\d+(?:\.\d+)?)\s*kg/i);
  if (!match) {
    return 6;
  }

  const parsed = Number(match[1]);
  if (Number.isNaN(parsed)) {
    return 6;
  }

  return Math.min(Math.max(parsed, 2), 20);
}

export function ensureStrengthLoadGuidance(
  strength: string,
  profile: CoachProfile,
) {
  if (/筋トレは行わず/.test(strength) || /完全休養/.test(strength)) {
    return strength;
  }

  if (/kg/i.test(strength)) {
    return strength;
  }

  const dumbbellKg = parseSuggestedDumbbellKg(profile.currentStrengthLevel);
  const machineKg = Math.max(10, Math.round(dumbbellKg * 2));
  const notes: string[] = [];

  if (/スクワット/.test(strength) && !/自重/.test(strength)) {
    notes.push("スクワットはまず自重");
  }

  if (/ダンベルプレス|ダンベルロー|ダンベル/.test(strength)) {
    notes.push(`ダンベル種目は片手${dumbbellKg}kg前後`);
  }

  if (/チェストプレス|マシン/.test(strength)) {
    notes.push(`マシン種目は${machineKg}kg前後`);
  }

  if (notes.length === 0) {
    notes.push(`重量目安は片手ダンベル${dumbbellKg}kg前後`);
  }

  return `${strength} 目安: ${notes.join("、")}。最後2回がややきつい重さで止める。`;
}

export function applyStrengthLoadGuidance(
  response: DailyPlanResponse,
  profile: CoachProfile,
): DailyPlanResponse {
  return {
    ...response,
    today_plan: {
      ...response.today_plan,
      strength: ensureStrengthLoadGuidance(response.today_plan.strength, profile),
    },
  };
}
