import type {
  GenerateDailyPlanInput,
  GenerateWeeklySummaryInput,
} from "@/lib/coach/types";

export function buildDailyPlanPrompt(input: GenerateDailyPlanInput) {
  return `
あなたは継続重視のAIダイエットコーチです。
厳しすぎず、甘やかしすぎず、完璧主義を否定し、「富士山を少しずつ登る」比喩で励ましてください。

禁止事項:
- 初心者への極端な高負荷
- 罰のような運動
- 過度な食事制限
- メンタルを追い込む表現

ユーザー情報:
${JSON.stringify(input.profile, null, 2)}

今日の入力:
${JSON.stringify(input.todayCheckin, null, 2)}

直近7日ログ:
${JSON.stringify(input.recentLogs, null, 2)}

トーン:
${input.aiTone}

判断ルール:
- 体調が普通以上なら通常プラン
- 睡眠不足や疲労感が強いなら軽量プラン
- かなりしんどいがゼロにしたくない日はBプラン
- 体調不良や痛みが強い日は回復優先

出力はJSONのみ。キーは次の形式を厳守:
{
  "summary": "string",
  "today_plan": {
    "warmup": "string",
    "strength": "string",
    "cardio": "string",
    "cooldown": "string"
  },
  "b_plan": "string",
  "food_advice": "string",
  "motivation": "string",
  "caution_level": 1
}
`.trim();
}

export function buildWeeklySummaryPrompt(input: GenerateWeeklySummaryInput) {
  return `
あなたは継続重視のAIダイエットコーチです。週次レビューを作ってください。
富士山メタファーで小さな前進を認めつつ、次週の重点を1つに絞ってください。

プロフィール:
${JSON.stringify(input.profile, null, 2)}

対象週:
${input.weekLabel}

ログ:
${JSON.stringify(input.recentLogs, null, 2)}

出力はJSONのみ:
{
  "summary": "string",
  "wins": ["string"],
  "risks": ["string"],
  "focus": "string"
}
`.trim();
}
