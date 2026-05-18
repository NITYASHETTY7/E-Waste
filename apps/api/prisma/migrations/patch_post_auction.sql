-- ============================================================
--  PATCH: Post-Auction Flow — new columns, enums, Rating table
--  Safe to run multiple times (all IF NOT EXISTS / DO blocks)
--  Run with: npx prisma db execute --file prisma/migrations/patch_post_auction.sql
-- ============================================================

-- 1. New PickupStatus enum values
ALTER TYPE "PickupStatus" ADD VALUE IF NOT EXISTS 'GATE_PASS_ISSUED';
ALTER TYPE "PickupStatus" ADD VALUE IF NOT EXISTS 'VENDOR_ACKNOWLEDGED';
ALTER TYPE "PickupStatus" ADD VALUE IF NOT EXISTS 'IN_TRANSIT';
ALTER TYPE "PickupStatus" ADD VALUE IF NOT EXISTS 'RECONCILIATION_DONE';
ALTER TYPE "PickupStatus" ADD VALUE IF NOT EXISTS 'INVOICE_GENERATED';

-- 2. New DocumentType enum values
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'WORK_ORDER';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'PURCHASE_ORDER';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'AGREEMENT';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'DELIVERY_CHALLAN';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'ASSET_HANDOVER_FORM';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'MATERIAL_ACKNOWLEDGEMENT';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'DATA_DESTRUCTION_CERTIFICATE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'EWASTE_RECYCLING_CERTIFICATE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'EWAY_BILL';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'E_WASTE_MANIFEST';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'INVOICE';

-- 3. New Pickup columns
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "gatePassNumber"       TEXT;
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "gatePassIssuedAt"     TIMESTAMP(3);
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "vehicleNumber"        TEXT;
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "driverName"           TEXT;
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "pickupNotes"          TEXT;
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "vendorAcknowledgedAt" TIMESTAMP(3);
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "finalWeight"          DOUBLE PRECISION;
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "reconciliationNotes"  TEXT;
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "finalAmount"          DOUBLE PRECISION;
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "invoiceNumber"        TEXT;
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "invoiceGeneratedAt"   TIMESTAMP(3);
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "invoiceS3Key"         TEXT;

-- 4. Other missing columns from previous sessions
ALTER TABLE "Auction" ADD COLUMN IF NOT EXISTS "liveApprovalStatus"  TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Auction" ADD COLUMN IF NOT EXISTS "liveApprovalRemarks" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paymentProofUrl"     TEXT;
ALTER TABLE "Bid"     ADD COLUMN IF NOT EXISTS "isShortlisted"       BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Bid"     ADD COLUMN IF NOT EXISTS "clientStatus"        TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Bid"     ADD COLUMN IF NOT EXISTS "clientRemarks"       TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "isLocked"            BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "lockReason"          TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "penaltyAmount"       DOUBLE PRECISION;
ALTER TABLE "Requirement" ADD COLUMN IF NOT EXISTS "acceptedVendorIds"       TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Requirement" ADD COLUMN IF NOT EXISTS "declinedVendorIds"       TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Requirement" ADD COLUMN IF NOT EXISTS "auditApprovedVendorIds"  TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Requirement" ADD COLUMN IF NOT EXISTS "sealedBidEventCreatedAt" TIMESTAMP(3);
ALTER TABLE "Requirement" ADD COLUMN IF NOT EXISTS "sealedBidDeadline"       TIMESTAMP(3);
ALTER TABLE "Requirement" ADD COLUMN IF NOT EXISTS "clientDocuments"         JSONB DEFAULT '[]';

-- 5. Rating table
CREATE TABLE IF NOT EXISTS "Rating" (
  "id"            TEXT         NOT NULL,
  "auctionId"     TEXT         NOT NULL,
  "fromCompanyId" TEXT         NOT NULL,
  "toCompanyId"   TEXT         NOT NULL,
  "score"         INTEGER      NOT NULL,
  "comment"       TEXT,
  "type"          TEXT         NOT NULL,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Rating_auctionId_fromCompanyId_type_key"
  ON "Rating"("auctionId", "fromCompanyId", "type");

-- 6. Rating foreign keys
DO $$ BEGIN
  ALTER TABLE "Rating" ADD CONSTRAINT "Rating_auctionId_fkey"
    FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Rating" ADD CONSTRAINT "Rating_fromCompanyId_fkey"
    FOREIGN KEY ("fromCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Rating" ADD CONSTRAINT "Rating_toCompanyId_fkey"
    FOREIGN KEY ("toCompanyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
