-- Client-side PRISM mirror + optional talent onboarding notes for matching
ALTER TABLE "discovery_briefs" ADD COLUMN IF NOT EXISTS "clientFitProfile" JSONB;

ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "onboardingMatchNotes" TEXT;
