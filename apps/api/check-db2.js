const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.auctionDocument.findMany({
    where: { auctionId: 'cmpez17tc0003u8s410gi23oe' }
  });
  console.log("Documents for cmpez:", JSON.stringify(docs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
