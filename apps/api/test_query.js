const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reqs = await prisma.requirement.findMany({
    include: {
      auction: true
    }
  });
  console.log("Requirements:", JSON.stringify(reqs.map(r => ({
    id: r.id,
    title: r.title,
    invitedVendorIds: r.invitedVendorIds,
    status: r.status,
    auctionPhase: r.auction?.status
  })), null, 2));

  const users = await prisma.user.findMany({
    where: { role: 'VENDOR' },
    select: { id: true, email: true, name: true }
  });
  console.log("Vendors:", JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
