import { Flag, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

export function MountainProgress({
  progressPercent,
  cumulativeMeters,
  remainingMeters,
  todayMeters,
}: {
  progressPercent: number;
  cumulativeMeters: number;
  remainingMeters: number;
  todayMeters: number;
}) {
  const dotTop = 74 - progressPercent * 0.5;
  const dotLeft = 24 + progressPercent * 0.42;

  return (
    <Card className="mountain-shell p-0">
      <div className="relative z-10 flex min-h-[300px] flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mini-label">富士山進捗</p>
            <h2 className="section-title mt-1">現在地は標高 {cumulativeMeters}m</h2>
          </div>
          <div className="pill bg-[rgba(255,255,255,0.9)]">
            <TrendingUp className="h-4 w-4" />
            今日 +{todayMeters}m
          </div>
        </div>

        <div
          className="climber-dot"
          style={{
            top: `${dotTop}%`,
            left: `${dotLeft}%`,
          }}
        />

        <div className="relative z-10 grid grid-cols-2 gap-3">
          <div className="soft-card rounded-[22px] p-4">
            <p className="mini-label">進捗率</p>
            <p className="metric-value mt-2">{progressPercent.toFixed(0)}%</p>
          </div>
          <div className="soft-card rounded-[22px] p-4">
            <p className="mini-label">頂上まで</p>
            <p className="metric-value mt-2">{remainingMeters}m</p>
            <p className="mini-label mt-2 flex items-center gap-1">
              <Flag className="h-3.5 w-3.5" />
              焦らず少しずつ
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
