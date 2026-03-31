"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveProfileAction } from "@/app/actions";
import { FieldErrors } from "@/components/forms/field-errors";
import { SubmitButton } from "@/components/forms/submit-button";
import { GENDER_OPTIONS } from "@/lib/constants";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";

type ProfileDefaults = {
  age: number;
  gender: string;
  heightCm: number;
  startWeightKg: number;
  startBodyFatPct?: number | null;
  targetWeightKg: number;
  targetBodyFatPct?: number | null;
  goalDate: string;
  currentStrengthLevel: string;
  currentCardioLevel: string;
  gymTime: string;
  morningWorkout: boolean;
  workoutContext?: string | null;
};

export function ProfileForm({ defaultValues }: { defaultValues: ProfileDefaults }) {
  const router = useRouter();
  const [state, formAction] = useActionState(saveProfileAction, INITIAL_ACTION_STATE);

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [router, state]);

  return (
    <form action={formAction} className="page-grid">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="age">
            年齢
          </label>
          <input className="field-input" defaultValue={defaultValues.age} id="age" name="age" type="number" />
          <FieldErrors errors={state.fieldErrors?.age} />
        </div>
        <div>
          <label className="field-label" htmlFor="gender">
            性別
          </label>
          <select className="field-input" defaultValue={defaultValues.gender} id="gender" name="gender">
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldErrors errors={state.fieldErrors?.gender} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="heightCm">
            身長(cm)
          </label>
          <input className="field-input" defaultValue={defaultValues.heightCm} id="heightCm" name="heightCm" type="number" />
          <FieldErrors errors={state.fieldErrors?.heightCm} />
        </div>
        <div>
          <label className="field-label" htmlFor="startWeightKg">
            開始体重(kg)
          </label>
          <input className="field-input" defaultValue={defaultValues.startWeightKg} id="startWeightKg" name="startWeightKg" step="0.1" type="number" />
          <FieldErrors errors={state.fieldErrors?.startWeightKg} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="startBodyFatPct">
            開始体脂肪率(%)
          </label>
          <input className="field-input" defaultValue={defaultValues.startBodyFatPct ?? ""} id="startBodyFatPct" name="startBodyFatPct" placeholder="空欄可" step="0.1" type="number" />
          <FieldErrors errors={state.fieldErrors?.startBodyFatPct} />
        </div>
        <div>
          <label className="field-label" htmlFor="goalDate">
            目標日
          </label>
          <input className="field-input" defaultValue={defaultValues.goalDate} id="goalDate" name="goalDate" type="date" />
          <FieldErrors errors={state.fieldErrors?.goalDate} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="targetWeightKg">
            目標体重(kg)
          </label>
          <input className="field-input" defaultValue={defaultValues.targetWeightKg} id="targetWeightKg" name="targetWeightKg" step="0.1" type="number" />
          <FieldErrors errors={state.fieldErrors?.targetWeightKg} />
        </div>
        <div>
          <label className="field-label" htmlFor="targetBodyFatPct">
            目標体脂肪率(%)
          </label>
          <input className="field-input" defaultValue={defaultValues.targetBodyFatPct ?? ""} id="targetBodyFatPct" name="targetBodyFatPct" step="0.1" type="number" />
          <FieldErrors errors={state.fieldErrors?.targetBodyFatPct} />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="currentStrengthLevel">
          現在の筋力レベル
        </label>
        <textarea className="field-input min-h-24" defaultValue={defaultValues.currentStrengthLevel} id="currentStrengthLevel" name="currentStrengthLevel" />
        <FieldErrors errors={state.fieldErrors?.currentStrengthLevel} />
      </div>

      <div>
        <label className="field-label" htmlFor="currentCardioLevel">
          現在の有酸素レベル
        </label>
        <textarea className="field-input min-h-24" defaultValue={defaultValues.currentCardioLevel} id="currentCardioLevel" name="currentCardioLevel" />
        <FieldErrors errors={state.fieldErrors?.currentCardioLevel} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="gymTime">
            ジム想定時刻
          </label>
          <input className="field-input" defaultValue={defaultValues.gymTime} id="gymTime" name="gymTime" type="time" />
          <FieldErrors errors={state.fieldErrors?.gymTime} />
        </div>
        <label className="soft-card flex items-center gap-3 rounded-[22px] px-4 py-3">
          <input defaultChecked={defaultValues.morningWorkout} name="morningWorkout" type="checkbox" />
          <span className="text-sm font-medium">朝に運動する前提で進める</span>
        </label>
      </div>

      <div>
        <label className="field-label" htmlFor="workoutContext">
          補足メモ
        </label>
        <textarea
          className="field-input min-h-24"
          defaultValue={defaultValues.workoutContext ?? ""}
          id="workoutContext"
          name="workoutContext"
          placeholder="例: 朝に意志力が落ちる前にジムへ行きたい"
        />
      </div>

      {state.message ? (
        <div className={`rounded-[20px] px-4 py-3 text-sm ${state.status === "error" ? "bg-red-50 text-[var(--danger)]" : "bg-emerald-50 text-[var(--success)]"}`}>
          {state.message}
        </div>
      ) : null}

      <SubmitButton label="プロフィールを保存" pendingLabel="保存しています..." />
    </form>
  );
}
