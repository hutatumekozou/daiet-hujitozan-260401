import {
  dailyPlanResponseSchema,
  weeklySummaryResponseSchema,
} from "@/lib/schemas";
import { applyStrengthLoadGuidance } from "@/lib/coach/strength-guidance";
import {
  getLatestWorkoutSummary,
  resolveNextStrengthFocus,
} from "@/lib/coach/workout-balance";
import type {
  CoachAdapter,
  GenerateDailyPlanInput,
  GenerateWeeklySummaryInput,
} from "@/lib/coach/types";

function decideMode(input: GenerateDailyPlanInput) {
  const condition = input.todayCheckin?.conditionScore ?? 3;
  const sleep = input.todayCheckin?.sleepHours ?? 6.5;
  const bingeRisk = input.todayCheckin?.bingeRiskScore ?? 3;

  if (condition <= 1 || sleep < 4.5) {
    return "RECOVERY";
  }

  if (condition <= 2 || sleep < 5.5) {
    return "B_PLAN";
  }

  if (bingeRisk >= 4 || sleep < 6.5) {
    return "LIGHT";
  }

  return "STANDARD";
}

function toneLine(tone: string) {
  if (tone === "gentle") {
    return "今日は完璧を狙わず、呼吸が整うところまでで十分です。";
  }

  if (tone === "firm") {
    return "今日は小さくても着実に登る日です。迷ったら最初の5分だけ始めましょう。";
  }

  return "今日は続けることを最優先にして、登れる分だけ登りましょう。";
}

function buildStrengthPlan(mode: string, nextFocus: "UPPER" | "LOWER") {
  if (mode === "RECOVERY") {
    return "筋トレは行わず、痛みがない範囲で姿勢を整える。";
  }

  if (mode === "B_PLAN") {
    if (nextFocus === "LOWER") {
      return "自重スクワット 10回 x 1、ヒップリフト 12回 x 1。今日は下半身を軽く動かしてゼロ回避。";
    }

    return "壁腕立て 8回 x 1、チューブローまたはダンベルロー 8回 x 1。今日は上半身を軽く動かしてゼロ回避。";
  }

  if (mode === "LIGHT") {
    if (nextFocus === "LOWER") {
      return "下半身中心で2種目。自重スクワット 8回 x 2、レッグプレス 30kgで10回 x 2。";
    }

    return "上半身中心で2種目。チェストプレス 15kgで10回 x 2、ダンベルロー 片手6kgで10回 x 2。";
  }

  if (nextFocus === "LOWER") {
    return "下半身中心で2種目。自重スクワット 10回 x 3、レッグプレス 40kgで10回 x 3。";
  }

  return "上半身中心で2種目。チェストプレス 20kgで10回 x 3、ダンベルロー 片手8kgで10回 x 3。";
}

function withBalanceNote(baseText: string, balanceNote: string | null) {
  if (!balanceNote) {
    return baseText;
  }

  return `${baseText} ${balanceNote}`;
}

export const mockCoachAdapter: CoachAdapter = {
  async generateDailyPlan(input: GenerateDailyPlanInput) {
    const mode = decideMode(input);
    const nextFocus = resolveNextStrengthFocus(input.recentLogs);
    const balanceNote = getLatestWorkoutSummary(input.recentLogs);

    const planByMode = {
      STANDARD: {
        summary: withBalanceNote("体調は標準以上。今日はしっかり登れる日です。", balanceNote),
        today_plan: {
          warmup: "トレッドミルで5分歩く。肩・股関節を軽く回して体温を上げる。",
          strength: buildStrengthPlan(mode, nextFocus),
          cardio: "トレッドミルで8.0km/h前後を5分、きつければ早歩きに切り替えて合計12分。",
          cooldown: "ふくらはぎ、もも裏、胸を中心に4分ストレッチ。",
        },
        b_plan: "ストレッチ5分 + スクワット10回 + 5分歩行だけで前進扱い。",
        food_advice:
          "外食なら、最初にたんぱく質と野菜を確保。主食は普段の8割で十分です。",
        motivation: `今日は50m以上登れる余地があります。${toneLine(input.aiTone)}`,
        caution_level: 2,
      },
      LIGHT: {
        summary: withBalanceNote("少し疲れが見えるので、今日は軽量プランで登山道を整えます。", balanceNote),
        today_plan: {
          warmup: "傾斜なしのウォーキング5分。呼吸を乱さず会話できる強度で。",
          strength: buildStrengthPlan(mode, nextFocus),
          cardio: "早歩きまたはゆるいジョグを8〜10分。",
          cooldown: "股関節と背中を中心に4分ストレッチ。",
        },
        b_plan: "5分歩く + スクワット10回 + 記録だけでOK。",
        food_advice: "眠気や疲労で甘いものに寄りやすい日です。先に水分と汁物を入れてください。",
        motivation: `今日は頂上アタックではなく、足場固めの日です。${toneLine(input.aiTone)}`,
        caution_level: 3,
      },
      B_PLAN: {
        summary: withBalanceNote("かなり重い日です。ゼロ回避を最優先にしてBプランで前進します。", balanceNote),
        today_plan: {
          warmup: "首・肩・股関節をゆるめるストレッチ3分。",
          strength: buildStrengthPlan(mode, nextFocus),
          cardio: "5〜8分だけ歩く。ペースはかなり楽でOK。",
          cooldown: "深呼吸をしながら全身を2分ほぐす。",
        },
        b_plan: "ストレッチ5分だけでも今日の前進。記録を残したら十分です。",
        food_advice: "食欲暴走リスクが高い日です。空腹放置を避け、たんぱく質を先に入れてください。",
        motivation: `今日は15mでも登れれば勝ちです。止まらずに、登山道に戻りましょう。${toneLine(input.aiTone)}`,
        caution_level: 4,
      },
      RECOVERY: {
        summary: withBalanceNote("今日は回復を優先。休むことも登山計画の一部です。", balanceNote),
        today_plan: {
          warmup: "深呼吸と軽い首回しを2分。",
          strength: buildStrengthPlan(mode, nextFocus),
          cardio: "室内をゆっくり5分歩くか、完全休養。",
          cooldown: "お風呂上がりに全身ストレッチ5分。",
        },
        b_plan: "記録だけつけて早めに休む。今日はそれで十分です。",
        food_advice: "回復日の極端な食事制限は不要です。消化しやすい食事と水分を優先してください。",
        motivation: `今日は山小屋で整える日です。回復できれば、次の一歩が軽くなります。${toneLine(input.aiTone)}`,
        caution_level: 5,
      },
    } as const;

    return applyStrengthLoadGuidance(
      dailyPlanResponseSchema.parse(planByMode[mode]),
      input.profile,
    );
  },

  async generateWeeklySummary(input: GenerateWeeklySummaryInput) {
    const goodDays = input.recentLogs.filter((item) => !item.bingeAte).length;
    const gymDays = input.recentLogs.filter((item) => item.didGym).length;
    const riskDays = input.recentLogs.filter((item) => item.bingeRiskScore >= 4).length;

    return weeklySummaryResponseSchema.parse({
      summary: `${input.weekLabel}は、富士山の中腹で歩幅を整えた週でした。大勝ちは不要で、止まらなかったこと自体が価値です。`,
      wins: [
        `暴飲暴食を抑えられた日が${goodDays}日ありました。`,
        `ジムに行けた日が${gymDays}日あり、朝の導線が少し固まっています。`,
      ],
      risks: [
        `食欲暴走リスクが高い日が${riskDays}日ありました。`,
        "疲れている日は通常プランに固執せず、Bプランへ早めに切り替えるのが安全です。",
      ],
      focus: "次週は『朝にジムへ向かうまでを自動化する』ことを最優先にしましょう。",
    });
  },
};
