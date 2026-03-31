import { SettingsForm } from "@/components/forms/settings-form";
import { Card } from "@/components/ui/card";
import { DEFAULT_SCORE_SETTINGS } from "@/lib/constants";
import { getSettingsPageData } from "@/lib/server/app-data";

export default async function SettingsPage() {
  const data = await getSettingsPageData();

  if (!data) {
    return (
      <Card>
        <h2 className="section-title">設定の前にプロフィールを作成してください</h2>
      </Card>
    );
  }

  const defaults = {
    ...DEFAULT_SCORE_SETTINGS,
    ...data.settings,
  };

  return (
    <>
      <Card className="app-gradient">
        <p className="mini-label">設定</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">配点とAIトーンを調整</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          点数は固定ではなく、続けやすさに合わせてあとから調整できます。
        </p>
      </Card>

      <Card>
        <h3 className="section-title">スコアリング設定</h3>
        <div className="mt-5">
          <SettingsForm defaultValues={defaults} />
        </div>
      </Card>
    </>
  );
}
