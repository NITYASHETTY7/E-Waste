-- =============================================================================
--  EcoLoop / WeConnect — MASTER MIGRATION SCRIPT
--  Idempotent: safe to run on a fresh database OR one that already has tables.
--  Apply with:
--      psql "$DATABASE_URL" -f migrate_all.sql
--  or split into sections and run interactively in psql.
-- =============================================================================

-- ─────────────────────────────────────────────
--  STEP 1 — ENUMS
--  Must come before any table that references them.
-- ─────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('ADMIN','CLIENT','VENDOR','USER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CompanyStatus" AS ENUM ('PENDING','APPROVED','REJECTED','BLOCKED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CompanyType" AS ENUM ('CLIENT','VENDOR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "RequirementStatus" AS ENUM ('UPLOADED','PROCESSING','CLIENT_REVIEW','FINALIZED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AuditStatus" AS ENUM ('INVITED','ACCEPTED','REJECTED','SCHEDULED','COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "AuctionStatus" AS ENUM ('DRAFT','UPCOMING','SEALED_PHASE','OPEN_PHASE','PENDING_SELECTION','COMPLETED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BidPhase" AS ENUM ('SEALED','OPEN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDING','SUBMITTED','CONFIRMED','FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PickupStatus" AS ENUM ('PENDING','SCHEDULED','DOCUMENTS_UPLOADED','COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "DocumentType" AS ENUM (
    'GST_CERTIFICATE','PAN_CARD','PCB_AUTHORIZATION','EPR_AUTHORIZATION',
    'POLLUTION_CERTIFICATE','TRADE_LICENSE','PRICE_SHEET','FINAL_QUOTE',
    'LETTERHEAD_QUOTATION','PAYMENT_PROOF','FORM_6','WEIGHT_SLIP_EMPTY',
    'WEIGHT_SLIP_LOADED','RECYCLING_CERTIFICATE','DISPOSAL_CERTIFICATE',
    'AUDIT_GEO_PHOTO',
    'CERTIFICATE_OF_INCORPORATION','COMPANY_PAN','DIRECTOR_PAN',
    'AUTHORIZED_SIGNATORY_ID','BOARD_RESOLUTION','KYC_FORM','EMD_PROOF',
    'TERMS_ACCEPTANCE','RECYCLER_LICENSE','FACTORY_LICENSE','BUSINESS_INSURANCE',
    'VENDOR_ONBOARDING_FORM','AUTHORIZATION_LETTER','ADDRESS_PROOF',
    'E_WASTE_DECLARATION','AADHAR_CARD','CANCELLED_CHEQUE','OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- If DocumentType already exists but is missing newer values, add them:
-- (ALTER TYPE ADD VALUE cannot run inside a transaction — these are safe to
--  run individually; duplicates are silently ignored with IF NOT EXISTS)
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'CERTIFICATE_OF_INCORPORATION';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'COMPANY_PAN';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'DIRECTOR_PAN';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'AUTHORIZED_SIGNATORY_ID';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'BOARD_RESOLUTION';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'KYC_FORM';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'EMD_PROOF';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'TERMS_ACCEPTANCE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'RECYCLER_LICENSE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'FACTORY_LICENSE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'BUSINESS_INSURANCE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'VENDOR_ONBOARDING_FORM';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'AUTHORIZATION_LETTER';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'ADDRESS_PROOF';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'E_WASTE_DECLARATION';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'AADHAR_CARD';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'CANCELLED_CHEQUE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'OTHER';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'AUDIT_GEO_PHOTO';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'PRICE_SHEET';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'FINAL_QUOTE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'LETTERHEAD_QUOTATION';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'PAYMENT_PROOF';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'FORM_6';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'WEIGHT_SLIP_EMPTY';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'WEIGHT_SLIP_LOADED';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'RECYCLING_CERTIFICATE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'DISPOSAL_CERTIFICATE';

-- ─────────────────────────────────────────────
--  STEP 2 — TABLES (CREATE IF NOT EXISTS)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Company" (
  "id"                TEXT          NOT NULL,
  "name"              TEXT          NOT NULL,
  "type"              "CompanyType" NOT NULL,
  "status"            "CompanyStatus" NOT NULL DEFAULT 'PENDING',
  "gstNumber"         TEXT,
  "panNumber"         TEXT,
  "address"           TEXT,
  "city"              TEXT,
  "state"             TEXT,
  "pincode"           TEXT,
  "rating"            DOUBLE PRECISION DEFAULT 0,
  "ratingCount"       INTEGER       NOT NULL DEFAULT 0,
  "bankAccountHolder" TEXT,
  "bankName"          TEXT,
  "bankAccountNumber" TEXT,
  "bankIfscCode"      TEXT,
  "bankAccountType"   TEXT,
  "createdAt"         TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "User" (
  "id"            TEXT          NOT NULL,
  "email"         TEXT          NOT NULL,
  "passwordHash"  TEXT          NOT NULL,
  "name"          TEXT          NOT NULL,
  "phone"         TEXT,
  "role"          "UserRole"    NOT NULL DEFAULT 'USER',
  "companyId"     TEXT,
  "createdAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "emailVerified" BOOLEAN       NOT NULL DEFAULT false,
  "isActive"      BOOLEAN       NOT NULL DEFAULT false,
  "otpAttempts"   INTEGER       NOT NULL DEFAULT 0,
  "otpCode"       TEXT,
  "otpExpiresAt"  TIMESTAMP(3),
  "otpType"       TEXT,
  "phoneVerified" BOOLEAN       NOT NULL DEFAULT false,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

CREATE TABLE IF NOT EXISTS "KycDocument" (
  "id"         TEXT          NOT NULL,
  "type"       "DocumentType" NOT NULL,
  "s3Key"      TEXT          NOT NULL,
  "s3Bucket"   TEXT          NOT NULL,
  "fileName"   TEXT          NOT NULL,
  "mimeType"   TEXT,
  "companyId"  TEXT          NOT NULL,
  "uploadedAt" TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Requirement" (
  "id"                TEXT                NOT NULL,
  "title"             TEXT                NOT NULL,
  "description"       TEXT,
  "status"            "RequirementStatus" NOT NULL DEFAULT 'UPLOADED',
  "rawS3Key"          TEXT,
  "processedS3Key"    TEXT,
  "targetPrice"       DOUBLE PRECISION,
  "totalWeight"       DOUBLE PRECISION,
  "category"          TEXT,
  "clientId"          TEXT                NOT NULL,
  "invitedVendorIds"  TEXT[]              NOT NULL DEFAULT '{}',
  "sealedPhaseStart"  TIMESTAMP(3),
  "sealedPhaseEnd"    TIMESTAMP(3),
  "adminApprovedAt"   TIMESTAMP(3),
  "adminApprovedById" TEXT,
  "createdAt"         TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AuditInvitation" (
  "id"            TEXT          NOT NULL,
  "status"        "AuditStatus" NOT NULL DEFAULT 'INVITED',
  "requirementId" TEXT          NOT NULL,
  "vendorId"      TEXT          NOT NULL,
  "siteAddress"   TEXT,
  "spocName"      TEXT,
  "spocPhone"     TEXT,
  "scheduledAt"   TIMESTAMP(3),
  "createdAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditInvitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AuditInvitation_requirementId_vendorId_key"
  ON "AuditInvitation"("requirementId","vendorId");

CREATE TABLE IF NOT EXISTS "AuditReport" (
  "id"           TEXT         NOT NULL,
  "invitationId" TEXT         NOT NULL,
  "productMatch" BOOLEAN,
  "remarks"      TEXT,
  "completedAt"  TIMESTAMP(3),
  "vendorUserId" TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AuditReport_invitationId_key" ON "AuditReport"("invitationId");

CREATE TABLE IF NOT EXISTS "AuditPhoto" (
  "id"            TEXT         NOT NULL,
  "s3Key"         TEXT         NOT NULL,
  "s3Bucket"      TEXT         NOT NULL,
  "fileName"      TEXT         NOT NULL,
  "mimeType"      TEXT,
  "auditReportId" TEXT         NOT NULL,
  "uploadedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditPhoto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Auction" (
  "id"               TEXT            NOT NULL,
  "title"            TEXT            NOT NULL,
  "category"         TEXT            NOT NULL,
  "description"      TEXT,
  "status"           "AuctionStatus" NOT NULL DEFAULT 'DRAFT',
  "basePrice"        DOUBLE PRECISION NOT NULL,
  "targetPrice"      DOUBLE PRECISION,
  "tickSize"         DOUBLE PRECISION NOT NULL DEFAULT 1000,
  "maxTicks"         INTEGER          NOT NULL DEFAULT 24,
  "extensionMinutes" INTEGER          NOT NULL DEFAULT 3,
  "sealedPhaseStart" TIMESTAMP(3),
  "sealedPhaseEnd"   TIMESTAMP(3),
  "openPhaseStart"   TIMESTAMP(3),
  "openPhaseEnd"     TIMESTAMP(3),
  "extensionCount"   INTEGER          NOT NULL DEFAULT 0,
  "clientId"         TEXT             NOT NULL,
  "winnerId"         TEXT,
  "requirementId"    TEXT,
  "quoteApproved"    BOOLEAN,
  "quoteRemarks"     TEXT,
  "createdAt"        TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Auction_requirementId_key" ON "Auction"("requirementId");

CREATE TABLE IF NOT EXISTS "AuctionDocument" (
  "id"         TEXT           NOT NULL,
  "type"       "DocumentType" NOT NULL,
  "s3Key"      TEXT           NOT NULL,
  "s3Bucket"   TEXT           NOT NULL,
  "fileName"   TEXT           NOT NULL,
  "mimeType"   TEXT,
  "auctionId"  TEXT           NOT NULL,
  "uploadedAt" TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuctionDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Bid" (
  "id"                 TEXT         NOT NULL,
  "amount"             DOUBLE PRECISION NOT NULL,
  "phase"              "BidPhase"   NOT NULL,
  "remarks"            TEXT,
  "rank"               INTEGER,
  "auctionId"          TEXT         NOT NULL,
  "vendorId"           TEXT         NOT NULL,
  "priceSheetS3Key"    TEXT,
  "priceSheetS3Bucket" TEXT,
  "priceSheetFileName" TEXT,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Bid_auctionId_amount_idx" ON "Bid"("auctionId","amount");

CREATE TABLE IF NOT EXISTS "Payment" (
  "id"               TEXT            NOT NULL,
  "status"           "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "clientAmount"     DOUBLE PRECISION NOT NULL,
  "commissionAmount" DOUBLE PRECISION NOT NULL,
  "totalAmount"      DOUBLE PRECISION NOT NULL,
  "utrNumber"        TEXT,
  "proofS3Key"       TEXT,
  "proofS3Bucket"    TEXT,
  "auctionId"        TEXT            NOT NULL,
  "adminNotes"       TEXT,
  "createdAt"        TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_auctionId_key" ON "Payment"("auctionId");

CREATE TABLE IF NOT EXISTS "Pickup" (
  "id"            TEXT           NOT NULL,
  "status"        "PickupStatus" NOT NULL DEFAULT 'PENDING',
  "scheduledDate" TIMESTAMP(3),
  "auctionId"     TEXT           NOT NULL,
  "paymentId"     TEXT,
  "adminNotes"    TEXT,
  "createdAt"     TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Pickup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Pickup_auctionId_key"  ON "Pickup"("auctionId");
CREATE UNIQUE INDEX IF NOT EXISTS "Pickup_paymentId_key"  ON "Pickup"("paymentId");

CREATE TABLE IF NOT EXISTS "PickupDocument" (
  "id"         TEXT           NOT NULL,
  "type"       "DocumentType" NOT NULL,
  "s3Key"      TEXT           NOT NULL,
  "s3Bucket"   TEXT           NOT NULL,
  "fileName"   TEXT           NOT NULL,
  "mimeType"   TEXT,
  "pickupId"   TEXT           NOT NULL,
  "uploadedAt" TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PickupDocument_pkey" PRIMARY KEY ("id")
);

-- ─────────────────────────────────────────────
--  STEP 3 — FOREIGN KEYS (ADD IF NOT EXISTS)
--  We wrap each in a DO block to skip duplicates.
-- ─────────────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "KycDocument" ADD CONSTRAINT "KycDocument_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AuditInvitation" ADD CONSTRAINT "AuditInvitation_requirementId_fkey"
    FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AuditInvitation" ADD CONSTRAINT "AuditInvitation_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AuditReport" ADD CONSTRAINT "AuditReport_invitationId_fkey"
    FOREIGN KEY ("invitationId") REFERENCES "AuditInvitation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AuditReport" ADD CONSTRAINT "AuditReport_vendorUserId_fkey"
    FOREIGN KEY ("vendorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AuditPhoto" ADD CONSTRAINT "AuditPhoto_auditReportId_fkey"
    FOREIGN KEY ("auditReportId") REFERENCES "AuditReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Auction" ADD CONSTRAINT "Auction_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Auction" ADD CONSTRAINT "Auction_winnerId_fkey"
    FOREIGN KEY ("winnerId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Auction" ADD CONSTRAINT "Auction_requirementId_fkey"
    FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AuctionDocument" ADD CONSTRAINT "AuctionDocument_auctionId_fkey"
    FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionId_fkey"
    FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Bid" ADD CONSTRAINT "Bid_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Pickup" ADD CONSTRAINT "Pickup_auctionId_fkey"
    FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Pickup" ADD CONSTRAINT "Pickup_paymentId_fkey"
    FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "PickupDocument" ADD CONSTRAINT "PickupDocument_pickupId_fkey"
    FOREIGN KEY ("pickupId") REFERENCES "Pickup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────
--  STEP 4 — INCREMENTAL COLUMN ADDITIONS
--  (for databases that already have the base tables)
-- ─────────────────────────────────────────────

-- Company: bank details
ALTER TABLE "Company"
  ADD COLUMN IF NOT EXISTS "bankAccountHolder" TEXT,
  ADD COLUMN IF NOT EXISTS "bankName"          TEXT,
  ADD COLUMN IF NOT EXISTS "bankAccountNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "bankIfscCode"      TEXT,
  ADD COLUMN IF NOT EXISTS "bankAccountType"   TEXT;

-- Requirement: vendor invite + phase window + admin approval tracking
ALTER TABLE "Requirement"
  ADD COLUMN IF NOT EXISTS "invitedVendorIds"  TEXT[]       NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "sealedPhaseStart"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "sealedPhaseEnd"    TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "adminApprovedAt"   TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "adminApprovedById" TEXT;

-- Requirement: processed sheet key
ALTER TABLE "Requirement"
  ADD COLUMN IF NOT EXISTS "processedS3Key" TEXT;

-- ─────────────────────────────────────────────
--  STEP 5 — PRISMA MIGRATION TRACKING
--  Record these migrations in _prisma_migrations so
--  `prisma migrate deploy` does not try to re-apply them.
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id"                   VARCHAR(36)  NOT NULL,
  "checksum"             VARCHAR(64)  NOT NULL,
  "finished_at"          TIMESTAMPTZ,
  "migration_name"       VARCHAR(255) NOT NULL,
  "logs"                 TEXT,
  "rolled_back_at"       TIMESTAMPTZ,
  "started_at"           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "applied_steps_count"  INTEGER      NOT NULL DEFAULT 0,
  CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

INSERT INTO "_prisma_migrations" ("id","checksum","finished_at","migration_name","applied_steps_count")
VALUES
  (gen_random_uuid()::text, 'manual', now(), '20260501_add_requirement_vendor_invite_fields', 1),
  (gen_random_uuid()::text, 'manual', now(), '20260502_bank_details_and_document_types', 1)
ON CONFLICT DO NOTHING;
