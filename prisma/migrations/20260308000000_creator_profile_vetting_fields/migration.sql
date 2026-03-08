-- Add vetting and display fields to creator_profiles
-- These fields support the admin moderation flow and talent privacy layer

ALTER TABLE "creatorhive"."creator_profiles"
  ADD COLUMN IF NOT EXISTS "displayName"   TEXT,
  ADD COLUMN IF NOT EXISTS "qualityScore"  INTEGER,
  ADD COLUMN IF NOT EXISTS "talentStatus"  TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "source"        TEXT;
