-- CreateTable
CREATE TABLE "campaign_files" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "uploaderUserId" TEXT NOT NULL,
    "storageBucket" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_files_storagePath_key" ON "campaign_files"("storagePath");

-- CreateIndex
CREATE INDEX "campaign_files_campaignId_idx" ON "campaign_files"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_files_uploaderUserId_idx" ON "campaign_files"("uploaderUserId");

-- AddForeignKey
ALTER TABLE "campaign_files" ADD CONSTRAINT "campaign_files_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_files" ADD CONSTRAINT "campaign_files_uploaderUserId_fkey" FOREIGN KEY ("uploaderUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
