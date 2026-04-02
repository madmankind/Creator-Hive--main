-- Add BookingOrderStatus enum
CREATE TYPE "creatorhive"."BookingOrderStatus" AS ENUM (
  'DRAFT', 'SENT', 'TALENT_PENDING', 'TALENT_CONFIRMED',
  'CLIENT_APPROVED', 'CLIENT_REPLACEMENT_REQUESTED', 'CANCELLED'
);

-- Extend BookingStatus enum with new values
ALTER TYPE "creatorhive"."BookingStatus" ADD VALUE IF NOT EXISTS 'TALENT_CONFIRMED';
ALTER TYPE "creatorhive"."BookingStatus" ADD VALUE IF NOT EXISTS 'TALENT_REPLACED';
ALTER TYPE "creatorhive"."BookingStatus" ADD VALUE IF NOT EXISTS 'CLIENT_APPROVED';

-- Create booking_orders table
CREATE TABLE IF NOT EXISTS "creatorhive"."booking_orders" (
  "id"                  TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "bookingRequestId"    TEXT NOT NULL,
  "orderRef"            TEXT NOT NULL,
  "campaignId"          TEXT,
  "clientName"          TEXT NOT NULL,
  "clientEmail"         TEXT NOT NULL,
  "clientCompany"       TEXT,
  "packageLabel"        TEXT,
  "budgetAed"           INTEGER NOT NULL,
  "vatAed"              INTEGER NOT NULL,
  "totalAed"            INTEGER NOT NULL,
  "paymentSchedule"     TEXT NOT NULL DEFAULT 'milestone_50_50',
  "scope"               JSONB,
  "pdfStoragePath"      TEXT,
  "pdfPublicUrl"        TEXT,
  "status"              "creatorhive"."BookingOrderStatus" NOT NULL DEFAULT 'DRAFT',
  "confirmedTalentIds"  TEXT[] NOT NULL DEFAULT '{}',
  "replacedTalentIds"   TEXT[] NOT NULL DEFAULT '{}',
  "clientActionToken"   TEXT UNIQUE,
  "clientActionAt"      TIMESTAMP(3),
  "clientAction"        TEXT,
  "sentAt"              TIMESTAMP(3),
  "talentConfirmedAt"   TIMESTAMP(3),
  "expiresAt"           TIMESTAMP(3),
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "booking_orders_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "booking_orders_bookingRequestId_fkey"
    FOREIGN KEY ("bookingRequestId") REFERENCES "creatorhive"."booking_requests"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "booking_orders_bookingRequestId_key" ON "creatorhive"."booking_orders"("bookingRequestId");
CREATE UNIQUE INDEX IF NOT EXISTS "booking_orders_orderRef_key"          ON "creatorhive"."booking_orders"("orderRef");
CREATE UNIQUE INDEX IF NOT EXISTS "booking_orders_clientActionToken_key" ON "creatorhive"."booking_orders"("clientActionToken");
CREATE INDEX IF NOT EXISTS "booking_orders_campaignId_idx"              ON "creatorhive"."booking_orders"("campaignId");
