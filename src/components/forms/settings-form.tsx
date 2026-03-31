"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "@/app/actions";
import { FieldErrors } from "@/components/forms/field-errors";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  AI_PROVIDER_OPTIONS,
  AI_TONE_OPTIONS,
} from "@/lib/constants";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";

type SettingsDefaults = {
  aiTone: string;
  aiProvider: string;
  gymVisitMeters: number;
  planCompletedMeters: number;
  bPlanMeters: number;
  weightLogMeters: number;
  checkinMeters: number;
  noBingeMeters: number;
  healthyAteOutMeters: number;
  stepBonusThreshold: number;
  stepBonusMeters: number;
  bingePenaltyMeters: number;
  skipPenaltyMeters: number;
  minimumActiveDayMeters: number;
};

export function SettingsForm({ defaultValues }: { defaultValues: SettingsDefaults }) {
  const [state, formAction] = useActionState(saveSettingsAction, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="page-grid">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="aiTone">
            AIトーン
          </label>
          <select className="field-input" defaultValue={defaultValues.aiTone} id="aiTone" name="aiTone">
            {AI_TONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldErrors errors={state.fieldErrors?.aiTone} />
        </div>
        <div>
          <label className="field-label" htmlFor="aiProvider">
            AIプロバイダ
          </label>
          <select className="field-input" defaultValue={defaultValues.aiProvider} id="aiProvider" name="aiProvider">
            {AI_PROVIDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldErrors errors={state.fieldErrors?.aiProvider} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          ["gymVisitMeters", "ジムへ行った"],
          ["planCompletedMeters", "提案メニュー完了"],
          ["bPlanMeters", "Bプラン実施"],
          ["weightLogMeters", "体重記録"],
          ["checkinMeters", "チェックイン基礎点"],
          ["noBingeMeters", "暴飲暴食なし"],
          ["healthyAteOutMeters", "良い外食選択"],
          ["stepBonusMeters", "歩数ボーナス"],
          ["stepBonusThreshold", "歩数ボーナス閾値"],
          ["bingePenaltyMeters", "暴飲暴食ペナルティ"],
          ["skipPenaltyMeters", "無断スキップ"],
          ["minimumActiveDayMeters", "最低救済ライン"],
        ].map(([name, label]) => (
          <div key={name}>
            <label className="field-label" htmlFor={name}>
              {label}
            </label>
            <input
              className="field-input"
              defaultValue={defaultValues[name as keyof SettingsDefaults]}
              id={name}
              name={name}
              type="number"
            />
            <FieldErrors errors={state.fieldErrors?.[name]} />
          </div>
        ))}
      </div>

      {state.message ? (
        <div className={`rounded-[20px] px-4 py-3 text-sm ${state.status === "error" ? "bg-red-50 text-[var(--danger)]" : "bg-emerald-50 text-[var(--success)]"}`}>
          {state.message}
        </div>
      ) : null}

      <SubmitButton label="設定を保存" pendingLabel="保存しています..." />
    </form>
  );
}
