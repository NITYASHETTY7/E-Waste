# How to Apply the Database Migration

You have two options. Pick whichever is easiest.

---

## Option A — Fix VPC Routing (then `npx prisma migrate deploy` works normally)

This is a one-time AWS Console change. After it the database is publicly reachable
and you can use normal Prisma commands forever.

1. **Open AWS Console → VPC → Your VPCs**
   Find the VPC your RDS instance lives in (check RDS → your instance → Connectivity tab).

2. **Subnets → find the RDS subnet**
   Go to VPC → Subnets. Filter by your VPC ID.
   Look for the subnet listed under the RDS instance's Connectivity tab.

3. **Check the Route Table**
   Click the subnet → "Route table" tab → click the route table link.

4. **Add an Internet Gateway route**
   - Routes tab → "Edit routes" → "Add route"
   - Destination: `0.0.0.0/0`
   - Target: select **Internet Gateway** → pick the IGW attached to your VPC
     (if none exists: VPC → Internet Gateways → Create → Attach to your VPC first)
   - Save changes.

5. **Back in your terminal** — run:
   ```bash
   cd apps/api
   npx prisma migrate deploy
   ```
   Prisma will apply the two pending migration files automatically.

---

## Option B — Apply `migrate_all.sql` directly via psql

Use this if you have any psql client available (local install, EC2, RDS Query Editor, etc.).

### Via AWS RDS Query Editor (no psql install needed)
1. AWS Console → RDS → Query Editor
2. Connect to your database (use master username/password)
3. Copy-paste the contents of `migrate_all.sql` and run it.
   > The file is fully idempotent — safe to run multiple times.

### Via local psql
```bash
# Install psql if needed: brew install postgresql  (Mac) or apt install postgresql-client (Linux)
psql "postgresql://USER:PASSWORD@YOUR-RDS-HOST:5432/ecoloop" -f apps/api/prisma/migrations/migrate_all.sql
```
Replace USER, PASSWORD, YOUR-RDS-HOST with values from your `.env` DATABASE_URL.

### Via EC2 in the same VPC
```bash
# SSH into any EC2 in the same VPC
ssh -i key.pem ec2-user@<ec2-ip>

# Install psql
sudo yum install -y postgresql15

# Run the migration (paste DATABASE_URL from your .env)
psql "postgresql://USER:PASSWORD@YOUR-RDS-HOST:5432/ecoloop" \
  -c "$(cat migrate_all.sql)"
```

---

## What the migration does

| Change | Table/Enum |
|--------|-----------|
| Creates all tables if they don't exist | All |
| Adds `bankAccountHolder`, `bankName`, `bankAccountNumber`, `bankIfscCode`, `bankAccountType` | `Company` |
| Adds `invitedVendorIds TEXT[]`, `sealedPhaseStart`, `sealedPhaseEnd`, `adminApprovedAt`, `adminApprovedById` | `Requirement` |
| Adds `processedS3Key` | `Requirement` |
| Adds 18 new document types | `DocumentType` enum |
| Registers migrations in `_prisma_migrations` so Prisma doesn't re-run them | `_prisma_migrations` |

After applying, run `npx prisma generate` (no DB needed) to refresh the Prisma client:
```bash
cd apps/api
npx prisma generate
```
