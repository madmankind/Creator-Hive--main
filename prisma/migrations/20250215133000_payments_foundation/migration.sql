-- CreateEnum
CREATE TYPE "StripeOnboardingStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'COMPLETE');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('PAYMENT_INTENT', 'TRANSFER', 'PAYOUT', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "WalletDirection" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "WalletStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- AlterTable
ALTER TABLE "creator_profiles" ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeOnboardingStatus" "StripeOnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creatorProfileId" TEXT,
    "agencyAccountId" TEXT,
    "campaignId" TEXT,
    "type" "WalletTransactionType" NOT NULL,
    "direction" "WalletDirection" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "WalletStatus" NOT NULL,
    "stripeObjectType" TEXT NOT NULL,
    "stripeObjectId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wallet_transactions_userId_idx" ON "wallet_transactions"("userId");

-- CreateIndex
CREATE INDEX "wallet_transactions_creatorProfileId_idx" ON "wallet_transactions"("creatorProfileId");

-- CreateIndex
CREATE INDEX "wallet_transactions_agencyAccountId_idx" ON "wallet_transactions"("agencyAccountId");

-- CreateIndex
CREATE INDEX "wallet_transactions_campaignId_idx" ON "wallet_transactions"("campaignId");

-- CreateIndex
CREATE INDEX "wallet_transactions_stripeObjectId_idx" ON "wallet_transactions"("stripeObjectId");

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_creatorProfileId_fkey" FOREIGN KEY ("creatorProfileId") REFERENCES "creator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_agencyAccountId_fkey" FOREIGN KEY ("agencyAccountId") REFERENCES "agency_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
