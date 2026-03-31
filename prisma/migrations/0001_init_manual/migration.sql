PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "UserProfile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "age" INTEGER NOT NULL,
  "gender" TEXT NOT NULL,
  "heightCm" INTEGER NOT NULL,
  "startWeightKg" REAL NOT NULL,
  "startBodyFatPct" REAL,
  "targetWeightKg" REAL NOT NULL,
  "targetBodyFatPct" REAL,
  "goalDate" DATETIME NOT NULL,
  "currentStrengthLevel" TEXT NOT NULL,
  "currentCardioLevel" TEXT NOT NULL,
  "gymTime" TEXT NOT NULL,
  "morningWorkout" BOOLEAN NOT NULL DEFAULT true,
  "workoutContext" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AppSettings" (
  "id" TEXT NOT NULL PRIMARY KEY,
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
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AppSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "AppSettings_userId_key" ON "AppSettings"("userId");

CREATE TABLE IF NOT EXISTS "DailyCheckin" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "day" DATETIME NOT NULL,
  "weightKg" REAL NOT NULL,
  "bodyFatPct" REAL,
  "sleepHours" REAL NOT NULL,
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
  "planMode" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DailyCheckin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "DailyCheckin_userId_day_key" ON "DailyCheckin"("userId", "day");
CREATE INDEX IF NOT EXISTS "DailyCheckin_userId_day_idx" ON "DailyCheckin"("userId", "day");

CREATE TABLE IF NOT EXISTS "DailyPlan" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "day" DATETIME NOT NULL,
  "planMode" TEXT NOT NULL,
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
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DailyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "DailyPlan_userId_day_key" ON "DailyPlan"("userId", "day");
CREATE INDEX IF NOT EXISTS "DailyPlan_userId_day_idx" ON "DailyPlan"("userId", "day");

CREATE TABLE IF NOT EXISTS "ActivityLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "checkinId" TEXT,
  "day" DATETIME NOT NULL,
  "type" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "metersDelta" INTEGER NOT NULL,
  "note" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActivityLog_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "DailyCheckin" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ActivityLog_userId_day_idx" ON "ActivityLog"("userId", "day");

CREATE TABLE IF NOT EXISTS "ProgressScoreLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "checkinId" TEXT UNIQUE,
  "day" DATETIME NOT NULL,
  "totalMeters" INTEGER NOT NULL,
  "cumulativeMeters" INTEGER NOT NULL,
  "note" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProgressScoreLog_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "DailyCheckin" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "ProgressScoreLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProgressScoreLog_userId_day_key" ON "ProgressScoreLog"("userId", "day");
CREATE INDEX IF NOT EXISTS "ProgressScoreLog_userId_day_idx" ON "ProgressScoreLog"("userId", "day");

CREATE TABLE IF NOT EXISTS "WeeklySummary" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "weekStart" DATETIME NOT NULL,
  "weekEnd" DATETIME NOT NULL,
  "totalMeters" INTEGER NOT NULL,
  "deltaVsPrevious" INTEGER NOT NULL,
  "successfulActions" TEXT NOT NULL,
  "derailers" TEXT NOT NULL,
  "nextFocus" TEXT NOT NULL,
  "summaryText" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WeeklySummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "WeeklySummary_userId_weekStart_key" ON "WeeklySummary"("userId", "weekStart");
CREATE INDEX IF NOT EXISTS "WeeklySummary_userId_weekStart_idx" ON "WeeklySummary"("userId", "weekStart");

CREATE TABLE IF NOT EXISTS "CoachMessage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "checkinId" TEXT,
  "dailyPlanId" TEXT,
  "day" DATETIME NOT NULL,
  "kind" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CoachMessage_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "DailyCheckin" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "CoachMessage_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "DailyPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "CoachMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CoachMessage_userId_day_idx" ON "CoachMessage"("userId", "day");

CREATE TABLE IF NOT EXISTS "GoalSnapshot" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "weightKg" REAL,
  "bodyFatPct" REAL,
  "cumulativeMeters" INTEGER NOT NULL,
  "estimatedGoalProgress" REAL NOT NULL,
  "note" TEXT,
  CONSTRAINT "GoalSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "GoalSnapshot_userId_capturedAt_idx" ON "GoalSnapshot"("userId", "capturedAt");
