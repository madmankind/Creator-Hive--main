-- Align creator_profiles with schema.prisma: PRISM, onboarding JSON, talent-fit arrays,
-- availability metrics, and social flags. Safe to re-run on partially migrated DBs.

ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "tiktok" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "youtube" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "fullName" TEXT;

ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "prismArchetype" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "prismArchetypeSecondary" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "primaryRole" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "rankedIndustries" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "yearsExperienceBand" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "preferredProjectTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "preferredPace" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "feedbackStyle" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "workEnvironmentFit" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "howIWorkBest" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "suitedTeamScale" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "availabilityType" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "workModeOpenness" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "brandFitPreferences" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "clientValueStrengths" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "teamSetupPreference" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "generatedMatchTags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "onboardingTranscriptJson" JSONB;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "onboardingAiSummary" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "onboardingCompletedAt" TIMESTAMP(3);

ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "availabilityStatus" TEXT NOT NULL DEFAULT 'AVAILABLE';
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "profileViews" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "totalEarned" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "responseRate" DOUBLE PRECISION;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "avgResponseHours" INTEGER;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "instagramVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "tiktokVerified" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS "creator_profiles_referralCode_key" ON "creator_profiles"("referralCode");
CREATE UNIQUE INDEX IF NOT EXISTS "creator_profiles_stripeAccountId_key" ON "creator_profiles"("stripeAccountId");
CREATE INDEX IF NOT EXISTS "creator_profiles_availabilityStatus_idx" ON "creator_profiles"("availabilityStatus");
