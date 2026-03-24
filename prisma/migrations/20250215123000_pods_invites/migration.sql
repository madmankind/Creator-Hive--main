-- CreateEnum
CREATE TYPE "CampaignInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateTable
CREATE TABLE "campaign_pods" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "talentIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_pods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_invites" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "creatorProfileId" TEXT NOT NULL,
    "status" "CampaignInviteStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_pods_campaignId_key" ON "campaign_pods"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_pods_campaignId_idx" ON "campaign_pods"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_invites_campaignId_creatorProfileId_key" ON "campaign_invites"("campaignId", "creatorProfileId");

-- CreateIndex
CREATE INDEX "campaign_invites_campaignId_idx" ON "campaign_invites"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_invites_creatorProfileId_idx" ON "campaign_invites"("creatorProfileId");

-- AddForeignKey
ALTER TABLE "campaign_pods" ADD CONSTRAINT "campaign_pods_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_invites" ADD CONSTRAINT "campaign_invites_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_invites" ADD CONSTRAINT "campaign_invites_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "creator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
