import "dotenv/config";
import { Gender } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rebuildDerivedData, ensureDailyPlan } from "@/lib/server/app-data";

async function main() {
  await prisma.$transaction([
    prisma.coachMessage.deleteMany(),
    prisma.dailyPlan.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.progressScoreLog.deleteMany(),
    prisma.weeklySummary.deleteMany(),
    prisma.goalSnapshot.deleteMany(),
    prisma.dailyCheckin.deleteMany(),
    prisma.appSettings.deleteMany(),
    prisma.userProfile.deleteMany(),
  ]);

  const profile = await prisma.userProfile.create({
    data: {
      age: 41,
      gender: Gender.MALE,
      heightCm: 160,
      startWeightKg: 63,
      startBodyFatPct: 24,
      targetWeightKg: 55,
      targetBodyFatPct: 17,
      goalDate: new Date("2026-09-30"),
      currentStrengthLevel:
        "かなり非力。スクワットは頑張って30回連続、ダンベルは10kgがちょうどくらい。",
      currentCardioLevel:
        "ランニングマシン 8.0km/h を5分でかなりきつい。少し物足りないくらいから積み上げたい。",
      gymTime: "07:00",
      morningWorkout: true,
      workoutContext:
        "昼以降に意志力が落ちやすいので、起床→シャワー→すぐジムの導線を固定したい。",
    },
  });

  await prisma.appSettings.create({
    data: {
      userId: profile.id,
      aiTone: "balanced",
      aiProvider: "mock",
    },
  });

  const sampleCheckins = [
    ["2026-03-17", 63.0, 24.0, 6.0, 3, 3, 3, true, false, true, "ストレッチ5分、スクワット10回、ウォーキング8分", 6200, 3, false, false, "開始前の準備日。Bプランで着地。"],
    ["2026-03-18", 62.8, 23.9, 6.5, 3, 3, 3, true, true, false, "スクワット10回x3、チェストプレス10回x2、歩行10分", 7800, 4, false, false, "朝に動けた。"],
    ["2026-03-19", 62.7, 23.8, 5.5, 2, 2, 4, false, false, true, "ストレッチ5分、歩行5分", 4200, 3, true, false, "眠いのでBプラン。"],
    ["2026-03-20", 62.6, 23.7, 6.5, 4, 4, 2, true, true, false, "スクワット12回x3、ダンベルロー10回x3、ジョグ5分", 8400, 4, false, false, "かなり良い。"],
    ["2026-03-21", 62.5, 23.7, 6.0, 3, 3, 3, false, false, false, "", 5100, 3, true, true, "会食で崩れた。"],
    ["2026-03-22", 62.7, 23.9, 7.0, 3, 3, 2, false, false, true, "ストレッチ5分、スクワット10回", 4600, 3, false, false, "ゼロにはしなかった。"],
    ["2026-03-23", 62.4, 23.6, 6.5, 4, 4, 2, true, true, false, "レッグプレス12回x3、チェストプレス10回x3、早歩き12分", 8900, 4, false, false, "少し余裕。"],
    ["2026-03-24", 62.3, 23.5, 6.0, 3, 3, 3, true, false, true, "歩行10分、ストレッチ", 7000, 3, false, false, "疲労が少し残った。"],
    ["2026-03-25", 62.1, 23.3, 6.5, 4, 4, 2, true, true, false, "スクワット15回x3、ダンベルプレス10回x2、ジョグ6分", 9100, 4, false, false, "良い流れ。"],
    ["2026-03-26", 62.0, 23.2, 5.0, 2, 2, 4, false, false, true, "ストレッチ5分、歩行5分", 3800, 2, true, false, "睡眠不足。"],
    ["2026-03-27", 61.9, 23.1, 6.5, 3, 3, 3, true, true, false, "マシン2種、トレッドミル10分", 8600, 4, false, false, "朝に迷わず行けた。"],
    ["2026-03-28", 61.8, 23.0, 6.0, 3, 3, 4, false, false, true, "ストレッチ5分、スクワット10回", 5000, 3, true, false, "外食ありだが守れた。"],
    ["2026-03-29", 61.7, 22.9, 6.5, 4, 4, 2, true, true, false, "スクワット15回x3、ダンベルロー10回x3、ジョグ8分", 9800, 4, false, false, "今週いちばん良い。"],
    ["2026-03-30", 61.6, 22.8, 6.0, 3, 3, 3, false, false, true, "ストレッチ5分、歩行8分", 6500, 4, false, false, "プレシーズン最終日。4/1から本格スタート。"],
  ] as const;

  await prisma.dailyCheckin.createMany({
    data: sampleCheckins.map((item) => ({
      userId: profile.id,
      day: new Date(item[0]),
      weightKg: item[1],
      bodyFatPct: item[2],
      sleepHours: item[3],
      conditionScore: item[4],
      moodScore: item[5],
      bingeRiskScore: item[6],
      didGym: item[7],
      completedPlan: item[8],
      completedBPlan: item[9],
      workoutPerformed: item[10],
      steps: item[11],
      mealScore: item[12],
      ateOut: item[13],
      bingeAte: item[14],
      comment: item[15],
    })),
  });

  await rebuildDerivedData(profile.id);
  await ensureDailyPlan(new Date("2026-03-30"), true);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
