-- ============================================================
--  PATCH: Gate pass document upload + vendor logistics fields
--  Safe to run multiple times (all IF NOT EXISTS)
--  Run with: npx prisma db execute --file prisma/migrations/patch_gate_pass_doc.sql --schema prisma/schema.prisma
-- ============================================================

ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "gatePassDocS3Key"    TEXT;
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "gatePassDocBucket"   TEXT;
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "gatePassDocFileName" TEXT;
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "vendorVehicleNumber" TEXT;
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "vendorDriverName"    TEXT;
ALTER TABLE "Pickup" ADD COLUMN IF NOT EXISTS "vendorPreferredDate" TIMESTAMP(3);
