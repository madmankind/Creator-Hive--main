-- AlterTable
ALTER TABLE "creatorhive"."users" ADD COLUMN IF NOT EXISTS "legalAcceptedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "legalVersion" TEXT;
