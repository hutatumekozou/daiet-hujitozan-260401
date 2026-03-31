import { NextResponse } from "next/server";
import { parseDayString } from "@/lib/date";
import { ensureDailyPlan } from "@/lib/server/app-data";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    day?: string;
    forceRefresh?: boolean;
  };

  const plan = await ensureDailyPlan(
    body.day ? parseDayString(body.day) : undefined,
    body.forceRefresh ?? false,
  );

  return NextResponse.json({ plan });
}
