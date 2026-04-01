import "dotenv/config";
import { Gender } from "@prisma/client";
import { prisma } from "@/lib/prisma";

async function main() {
  const existingProfile = await prisma.userProfile.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  const profile =
    existingProfile ??
    (await prisma.userProfile.create({
      data: {
        age: 41,
        gender: Gender.MALE,
        heightCm: 160,
        startWeightKg: 63,
        startBodyFatPct: 23,
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
    }));

  await prisma.appSettings.upsert({
    where: {
      userId: profile.id,
    },
    update: {},
    create: {
      userId: profile.id,
      aiTone: "balanced",
      aiProvider: "mock",
    },
  });

  if (existingProfile) {
    console.log("Seed skipped profile creation because a user profile already exists.");
    return;
  }

  console.log("Seed created initial profile and app settings.");
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
