export const APP_NAME = "Fuji Climb Diet";
export const APP_DESCRIPTION =
  "富士山登山メタファーで、毎日の小さな前進を可視化するAIダイエット伴走アプリ。";

export const FUJI_ALTITUDE_METERS = 3776;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "現在地" },
  { href: "/checkin", label: "記録" },
  { href: "/plan", label: "今日の提案" },
  { href: "/history", label: "履歴" },
  { href: "/analytics", label: "分析" },
  { href: "/settings", label: "設定" },
] as const;

export const GENDER_OPTIONS = [
  { value: "MALE", label: "男性" },
  { value: "FEMALE", label: "女性" },
  { value: "OTHER", label: "その他" },
] as const;

export const PLAN_MODE_LABELS: Record<string, string> = {
  STANDARD: "通常プラン",
  LIGHT: "軽量プラン",
  B_PLAN: "Bプラン",
  RECOVERY: "回復優先",
};

export const CONDITION_OPTIONS = [
  { value: "1", label: "1 とても悪い" },
  { value: "2", label: "2 悪い" },
  { value: "3", label: "3 普通" },
  { value: "4", label: "4 良い" },
  { value: "5", label: "5 とても良い" },
] as const;

export const AI_TONE_OPTIONS = [
  { value: "balanced", label: "標準" },
  { value: "gentle", label: "やさしめ" },
  { value: "firm", label: "少し背中を押す" },
] as const;

export const AI_PROVIDER_OPTIONS = [
  { value: "mock", label: "モック" },
  { value: "openai", label: "OpenAI" },
] as const;

export const DEFAULT_SCORE_SETTINGS = {
  aiTone: "balanced",
  aiProvider: "mock",
  gymVisitMeters: 30,
  planCompletedMeters: 40,
  bPlanMeters: 15,
  weightLogMeters: 5,
  checkinMeters: 5,
  noBingeMeters: 10,
  healthyAteOutMeters: 10,
  stepBonusThreshold: 8000,
  stepBonusMeters: 10,
  bingePenaltyMeters: -20,
  skipPenaltyMeters: -15,
  minimumActiveDayMeters: 8,
} as const;
