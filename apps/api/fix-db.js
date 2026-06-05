const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.auctionDocument.deleteMany({
    where: {
      s3Bucket: 'ecoloop-docs'
    }
  });
  console.log(`Deleted ${result.count} documents with invalid bucket ecoloop-docs`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
