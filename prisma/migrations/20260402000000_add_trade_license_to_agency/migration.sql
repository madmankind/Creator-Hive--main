-- Add trade license fields to agency_accounts
ALTER TABLE "creatorhive"."agency_accounts"
  ADD COLUMN IF NOT EXISTS "tradeLicenseUrl"        TEXT,
  ADD COLUMN IF NOT EXISTS "tradeLicenseFilename"   TEXT,
  ADD COLUMN IF NOT EXISTS "tradeLicenseUploadedAt" TIMESTAMP(3);
