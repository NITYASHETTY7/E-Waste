const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.auctionDocument.findMany({
    orderBy: { uploadedAt: 'desc' },
    take: 10
  });
  console.log("Recent documents:", JSON.stringify(docs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
