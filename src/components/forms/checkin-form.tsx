"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveCheckinAction } from "@/app/actions";
import { FieldErrors } from "@/components/forms/field-errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { CONDITION_OPTIONS } from "@/lib/constants";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";

type CheckinDefaults = {
  day: string;
  weightKg: number;
  bodyFatPct?: number | null;
  sleepHours: number;
  conditionScore: number;
  moodScore: number;
  bingeRiskScore: number;
  didGym: boolean;
  completedPlan: boolean;
  completedBPlan: boolean;
  workoutPerformed?: string;
  steps?: number;
  mealScore: number;
  ateOut: boolean;
  bingeAte: boolean;
  comment?: string;
};

export function CheckinForm({ defaultValues }: { defaultValues: CheckinDefaults }) {
  const router = useRouter();
  const [state, formAction] = useActionState(saveCheckinAction, INITIAL_ACTION_STATE);

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [router, state]);

  return (
    <form action={formAction} className="page-grid">
      <input name="day" type="hidden" value={defaultValues.day} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="weightKg">
            体重(kg)
          </label>
          <input className="field-input" defaultValue={defaultValues.weightKg} id="weightKg" name="weightKg" step="0.1" type="number" />
          <FieldErrors errors={state.fieldErrors?.weightKg} />
        </div>
        <div>
          <label className="field-label" htmlFor="bodyFatPct">
            体脂肪率(%)
          </label>
          <input className="field-input" defaultValue={defaultValues.bodyFatPct ?? ""} id="bodyFatPct" name="bodyFatPct" placeholder="空欄可" step="0.1" type="number" />
          <FieldErrors errors={state.fieldErrors?.bodyFatPct} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="sleepHours">
            睡眠時間
          </label>
          <input className="field-input" defaultValue={defaultValues.sleepHours} id="sleepHours" name="sleepHours" step="0.5" type="number" />
          <FieldErrors errors={state.fieldErrors?.sleepHours} />
        </div>
        <div>
          <label className="field-label" htmlFor="steps">
            歩数
          </label>
          <input className="field-input" defaultValue={defaultValues.steps ?? ""} id="steps" name="steps" placeholder="任意" type="number" />
          <FieldErrors errors={state.fieldErrors?.steps} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="field-label" htmlFor="conditionScore">
            体調
          </label>
          <select className="field-input" defaultValue={String(defaultValues.conditionScore)} id="conditionScore" name="conditionScore">
            {CONDITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="moodScore">
            気分
          </label>
          <select className="field-input" defaultValue={String(defaultValues.moodScore)} id="moodScore" name="moodScore">
            {CONDITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="bingeRiskScore">
            食欲暴走リスク
          </label>
          <select className="field-input" defaultValue={String(defaultValues.bingeRiskScore)} id="bingeRiskScore" name="bingeRiskScore">
            {CONDITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="mealScore">
            食事自己評価
          </label>
          <select className="field-input" defaultValue={String(defaultValues.mealScore)} id="mealScore" name="mealScore">
            {CONDITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="workoutPerformed">
          実施した運動
        </label>
        <textarea className="field-input min-h-24" defaultValue={defaultValues.workoutPerformed ?? ""} id="workoutPerformed" name="workoutPerformed" placeholder="例: スクワット 10回 x 3、トレッドミル 10分" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="soft-card flex items-center gap-3 rounded-[22px] px-4 py-3">
          <input defaultChecked={defaultValues.didGym} name="didGym" type="checkbox" />
          <span className="text-sm font-medium">ジムへ行った</span>
        </label>
        <label className="soft-card flex items-center gap-3 rounded-[22px] px-4 py-3">
          <input defaultChecked={defaultValues.completedPlan} name="completedPlan" type="checkbox" />
          <span className="text-sm font-medium">通常/軽量プラン完了</span>
        </label>
        <label className="soft-card flex items-center gap-3 rounded-[22px] px-4 py-3">
          <input defaultChecked={defaultValues.completedBPlan} name="completedBPlan" type="checkbox" />
          <span className="text-sm font-medium">Bプラン実施</span>
        </label>
        <label className="soft-card flex items-center gap-3 rounded-[22px] px-4 py-3">
          <input defaultChecked={defaultValues.ateOut} name="ateOut" type="checkbox" />
          <span className="text-sm font-medium">外食した</span>
        </label>
        <label className="soft-card col-span-2 flex items-center gap-3 rounded-[22px] px-4 py-3">
          <input defaultChecked={defaultValues.bingeAte} name="bingeAte" type="checkbox" />
          <span className="text-sm font-medium">暴飲暴食した</span>
        </label>
      </div>

      <div>
        <label className="field-label" htmlFor="comment">
          コメントメモ
        </label>
        <textarea className="field-input min-h-28" defaultValue={defaultValues.comment ?? ""} id="comment" name="comment" placeholder="起きたこと、つまずきそうなこと、明日の工夫など" />
      </div>

      {state.message ? (
        <div className={`rounded-[20px] px-4 py-3 text-sm ${state.status === "error" ? "bg-red-50 text-[var(--danger)]" : "bg-emerald-50 text-[var(--success)]"}`}>
          {state.message}
        </div>
      ) : null}

      <SubmitButton label="チェックインを保存" pendingLabel="保存しています..." />
    </form>
  );
}
