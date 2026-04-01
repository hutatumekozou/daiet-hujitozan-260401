import { CalendarRange } from "lucide-react";
import { CheckinForm } from "@/components/forms/checkin-form";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/date";
import { getCheckinPageData } from "@/lib/server/app-data";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const data = await getCheckinPageData();

  if (!data) {
    return (
      <Card>
        <h2 className="section-title">先にプロフィール設定が必要です</h2>
      </Card>
    );
  }

  return (
    <>
      <Card className="app-gradient">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="mini-label">Step 2 / 毎日の記録</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {formatDate(new Date(), "M月d日(E)")} のチェックイン
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              全項目を満点で埋める必要はありません。今日の状態を雑でも残すことが、明日の再開を助けます。
            </p>
          </div>
          <div className="pill">
            <CalendarRange className="h-4 w-4" />
            2分で完了
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="section-title">記録入力</h3>
        <div className="mt-5">
          <CheckinForm defaultValues={data.defaults} />
        </div>
      </Card>
    </>
  );
}
