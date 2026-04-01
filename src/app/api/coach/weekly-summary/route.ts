import { NextResponse } from "next/server";
import { generateWeeklyCoachSummary } from "@/lib/server/app-data";

export const dynamic = "force-dynamic";

export async function POST() {
  const summary = await generateWeeklyCoachSummary();
  return NextResponse.json({ summary });
}
