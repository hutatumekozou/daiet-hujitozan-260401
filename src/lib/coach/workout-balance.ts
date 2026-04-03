import type { RecentLogEntry } from "@/lib/coach/types";

export type WorkoutFocus = "UPPER" | "LOWER" | "FULL_BODY" | "CARDIO" | "UNKNOWN";
export type NextStrengthFocus = "UPPER" | "LOWER";

const UPPER_KEYWORDS = [
  "上半身",
  "胸",
  "背中",
  "肩",
  "腕",
  "チェスト",
  "プレス",
  "ベンチ",
  "ショルダー",
  "ロー",
  "ラット",
  "アーム",
  "懸垂",
  "腕立て",
  "push",
  "press",
  "bench",
  "row",
  "lat",
  "pull",
  "shoulder",
  "chest",
  "biceps",
  "triceps",
];

const LOWER_KEYWORDS = [
  "下半身",
  "脚",
  "足",
  "尻",
  "臀",
  "もも",
  "ハム",
  "ふくらはぎ",
  "スクワット",
  "ランジ",
  "レッグ",
  "ヒップ",
  "ブルガリアン",
  "カーフ",
  "デッド",
  "squat",
  "lunge",
  "leg",
  "hip",
  "calf",
  "hamstring",
  "glute",
  "deadlift",
];

const CARDIO_KEYWORDS = [
  "有酸素",
  "トレッドミル",
  "ウォーキング",
  "ジョグ",
  "ラン",
  "バイク",
  "ステッパー",
  "クロストレーナー",
  "cardio",
  "walk",
  "jog",
  "run",
  "bike",
  "treadmill",
];

function includesKeyword(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

export function detectWorkoutFocus(workoutPerformed?: string | null): WorkoutFocus {
  const text = workoutPerformed?.toLowerCase().trim();

  if (!text) {
    return "UNKNOWN";
  }

  const hasUpper = includesKeyword(text, UPPER_KEYWORDS);
  const hasLower = includesKeyword(text, LOWER_KEYWORDS);
  const hasCardio = includesKeyword(text, CARDIO_KEYWORDS);

  if (hasUpper && hasLower) {
    return "FULL_BODY";
  }

  if (hasUpper) {
    return "UPPER";
  }

  if (hasLower) {
    return "LOWER";
  }

  if (hasCardio) {
    return "CARDIO";
  }

  return "UNKNOWN";
}

export function getLatestWorkoutSummary(recentLogs: RecentLogEntry[]) {
  const latestWorkout = [...recentLogs]
    .reverse()
    .find((item) => item.workoutPerformed?.trim());

  if (!latestWorkout?.workoutPerformed) {
    return null;
  }

  const focus = detectWorkoutFocus(latestWorkout.workoutPerformed);

  if (focus === "UPPER") {
    return "前回は上半身寄りだったので、今回は下半身寄りでバランスを取ります。";
  }

  if (focus === "LOWER") {
    return "前回は下半身寄りだったので、今回は上半身寄りでバランスを取ります。";
  }

  if (focus === "FULL_BODY") {
    return "前回は全身を使っているので、今回は追い込みすぎず部位の負担を分散します。";
  }

  if (focus === "CARDIO") {
    return "前回は有酸素中心だったので、今回は筋トレを軸にしてバランスを取ります。";
  }

  return "前回の運動内容も踏まえて、同じ部位の連続負荷を避けます。";
}

export function resolveNextStrengthFocus(recentLogs: RecentLogEntry[]): NextStrengthFocus {
  const latestWithWorkout = [...recentLogs]
    .reverse()
    .find((item) => item.workoutPerformed?.trim());

  const latestFocus = detectWorkoutFocus(latestWithWorkout?.workoutPerformed);

  if (latestFocus === "UPPER") {
    return "LOWER";
  }

  if (latestFocus === "LOWER") {
    return "UPPER";
  }

  const previousFocusedWorkout = [...recentLogs]
    .reverse()
    .map((item) => detectWorkoutFocus(item.workoutPerformed))
    .find((focus) => focus === "UPPER" || focus === "LOWER");

  if (previousFocusedWorkout === "UPPER") {
    return "LOWER";
  }

  if (previousFocusedWorkout === "LOWER") {
    return "UPPER";
  }

  return "LOWER";
}
