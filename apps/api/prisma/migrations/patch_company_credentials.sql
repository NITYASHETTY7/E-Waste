-- Manual Patch: Add missing business credentials to Company table
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "cpcbNo" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "processingCapacity" TEXT;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "companyRegistrationNo" TEXT;
