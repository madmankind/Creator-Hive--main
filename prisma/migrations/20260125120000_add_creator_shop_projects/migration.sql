-- CreateEnum
CREATE TYPE "CreatorShopProjectMode" AS ENUM ('LAUNCH', 'GROW');

-- CreateEnum
CREATE TYPE "CreatorShopProjectStatus" AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'QUALIFIED',
  'TEAM_ASSEMBLING',
  'IN_BUILD',
  'LAUNCH_READY',
  'LIVE',
  'SCALING'
);

-- CreateTable
CREATE TABLE "creator_shop_projects" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "agencyId" TEXT,
    "mode" "CreatorShopProjectMode" NOT NULL,
    "productType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "CreatorShopProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "briefPayload" JSONB NOT NULL,
    "budgetBand" TEXT,
    "desiredLaunchDate" TIMESTAMP(3),
    "currentPlatform" TEXT,
    "audienceContext" TEXT,
    "notes" TEXT,
    "statusHistory" JSONB,
    "commercialModelNotes" TEXT,
    "latestUpdateAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_shop_projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "creator_shop_projects_ownerUserId_idx" ON "creator_shop_projects"("ownerUserId");

-- CreateIndex
CREATE INDEX "creator_shop_projects_agencyId_idx" ON "creator_shop_projects"("agencyId");

-- CreateIndex
CREATE INDEX "creator_shop_projects_status_idx" ON "creator_shop_projects"("status");

-- CreateIndex
CREATE INDEX "creator_shop_projects_createdAt_idx" ON "creator_shop_projects"("createdAt");

-- AddForeignKey
ALTER TABLE "creator_shop_projects" ADD CONSTRAINT "creator_shop_projects_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_shop_projects" ADD CONSTRAINT "creator_shop_projects_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agency_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
