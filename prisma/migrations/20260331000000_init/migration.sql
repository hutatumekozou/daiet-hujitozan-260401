-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "PlanMode" AS ENUM ('STANDARD', 'LIGHT', 'B_PLAN', 'RECOVERY');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CHECKIN', 'GYM_VISIT', 'PLAN_COMPLETED', 'B_PLAN_COMPLETED', 'WEIGHT_LOG', 'NO_BINGE', 'HEALTHY_ATE_OUT', 'STEP_BONUS', 'BINGE_PENALTY', 'SKIP_PENALTY', 'RECOVERY_DAY');

-- CreateEnum
CREATE TYPE "CoachMessageKind" AS ENUM ('SUMMARY', 'MOTIVATION', 'FOOD_ADVICE', 'WEEKLY_REVIEW');

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "heightCm" INTEGER NOT NULL,
    "startWeightKg" DOUBLE PRECISION NOT NULL,
    "startBodyFatPct" DOUBLE PRECISION,
    "targetWeightKg" DOUBLE PRECISION NOT NULL,
    "targetBodyFatPct" DOUBLE PRECISION,
    "goalDate" TIMESTAMP(3) NOT NULL,
    "currentStrengthLevel" TEXT NOT NULL,
    "currentCardioLevel" TEXT NOT NULL,
    "gymTime" TEXT NOT NULL,
    "morningWorkout" BOOLEAN NOT NULL DEFAULT true,
    "workoutContext" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aiTone" TEXT NOT NULL DEFAULT 'balanced',
    "aiProvider" TEXT NOT NULL DEFAULT 'mock',
    "gymVisitMeters" INTEGER NOT NULL DEFAULT 30,
    "planCompletedMeters" INTEGER NOT NULL DEFAULT 40,
    "bPlanMeters" INTEGER NOT NULL DEFAULT 15,
    "weightLogMeters" INTEGER NOT NULL DEFAULT 5,
    "checkinMeters" INTEGER NOT NULL DEFAULT 5,
    "noBingeMeters" INTEGER NOT NULL DEFAULT 10,
    "healthyAteOutMeters" INTEGER NOT NULL DEFAULT 10,
    "stepBonusThreshold" INTEGER NOT NULL DEFAULT 8000,
    "stepBonusMeters" INTEGER NOT NULL DEFAULT 10,
    "bingePenaltyMeters" INTEGER NOT NULL DEFAULT -20,
    "skipPenaltyMeters" INTEGER NOT NULL DEFAULT -15,
    "minimumActiveDayMeters" INTEGER NOT NULL DEFAULT 8,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCheckin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "bodyFatPct" DOUBLE PRECISION,
    "sleepHours" DOUBLE PRECISION NOT NULL,
    "conditionScore" INTEGER NOT NULL,
    "moodScore" INTEGER NOT NULL,
    "bingeRiskScore" INTEGER NOT NULL,
    "didGym" BOOLEAN NOT NULL DEFAULT false,
    "completedPlan" BOOLEAN NOT NULL DEFAULT false,
    "completedBPlan" BOOLEAN NOT NULL DEFAULT false,
    "workoutPerformed" TEXT,
    "steps" INTEGER,
    "mealScore" INTEGER NOT NULL,
    "ateOut" BOOLEAN NOT NULL DEFAULT false,
    "bingeAte" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "planMode" "PlanMode",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyCheckin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "planMode" "PlanMode" NOT NULL,
    "summary" TEXT NOT NULL,
    "warmup" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "cardio" TEXT NOT NULL,
    "cooldown" TEXT NOT NULL,
    "bPlan" TEXT NOT NULL,
    "foodAdvice" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "cautionLevel" INTEGER NOT NULL,
    "rawResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkinId" TEXT,
    "day" TIMESTAMP(3) NOT NULL,
    "type" "ActivityType" NOT NULL,
    "label" TEXT NOT NULL,
    "metersDelta" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressScoreLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkinId" TEXT,
    "day" TIMESTAMP(3) NOT NULL,
    "totalMeters" INTEGER NOT NULL,
    "cumulativeMeters" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressScoreLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklySummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "totalMeters" INTEGER NOT NULL,
    "deltaVsPrevious" INTEGER NOT NULL,
    "successfulActions" TEXT NOT NULL,
    "derailers" TEXT NOT NULL,
    "nextFocus" TEXT NOT NULL,
    "summaryText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkinId" TEXT,
    "dailyPlanId" TEXT,
    "day" TIMESTAMP(3) NOT NULL,
    "kind" "CoachMessageKind" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weightKg" DOUBLE PRECISION,
    "bodyFatPct" DOUBLE PRECISION,
    "cumulativeMeters" INTEGER NOT NULL,
    "estimatedGoalProgress" DOUBLE PRECISION NOT NULL,
    "note" TEXT,

    CONSTRAINT "GoalSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppSettings_userId_key" ON "AppSettings"("userId");

-- CreateIndex
CREATE INDEX "DailyCheckin_userId_day_idx" ON "DailyCheckin"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCheckin_userId_day_key" ON "DailyCheckin"("userId", "day");

-- CreateIndex
CREATE INDEX "DailyPlan_userId_day_idx" ON "DailyPlan"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPlan_userId_day_key" ON "DailyPlan"("userId", "day");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_day_idx" ON "ActivityLog"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "ProgressScoreLog_checkinId_key" ON "ProgressScoreLog"("checkinId");

-- CreateIndex
CREATE INDEX "ProgressScoreLog_userId_day_idx" ON "ProgressScoreLog"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "ProgressScoreLog_userId_day_key" ON "ProgressScoreLog"("userId", "day");

-- CreateIndex
CREATE INDEX "WeeklySummary_userId_weekStart_idx" ON "WeeklySummary"("userId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklySummary_userId_weekStart_key" ON "WeeklySummary"("userId", "weekStart");

-- CreateIndex
CREATE INDEX "CoachMessage_userId_day_idx" ON "CoachMessage"("userId", "day");

-- CreateIndex
CREATE INDEX "GoalSnapshot_userId_capturedAt_idx" ON "GoalSnapshot"("userId", "capturedAt");

-- AddForeignKey
ALTER TABLE "AppSettings" ADD CONSTRAINT "AppSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCheckin" ADD CONSTRAINT "DailyCheckin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlan" ADD CONSTRAINT "DailyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "DailyCheckin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressScoreLog" ADD CONSTRAINT "ProgressScoreLog_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "DailyCheckin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressScoreLog" ADD CONSTRAINT "ProgressScoreLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklySummary" ADD CONSTRAINT "WeeklySummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachMessage" ADD CONSTRAINT "CoachMessage_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "DailyCheckin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachMessage" ADD CONSTRAINT "CoachMessage_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "DailyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachMessage" ADD CONSTRAINT "CoachMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalSnapshot" ADD CONSTRAINT "GoalSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

