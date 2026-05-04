-- Add vendor invite fields to Requirement table
-- Run this migration when the database is accessible:
--   npx prisma migrate deploy
--   OR apply manually via psql

ALTER TABLE "Requirement"
  ADD COLUMN IF NOT EXISTS "invitedVendorIds" TEXT[]    NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "sealedPhaseStart"  TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "sealedPhaseEnd"    TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "adminApprovedAt"   TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "adminApprovedById" TEXT;
