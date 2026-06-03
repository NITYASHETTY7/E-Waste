const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  console.log('Users:', users);

  const notifications = await prisma.inAppNotification.findMany();
  console.log('Total Notifications:', notifications.length);
  
  if (notifications.length > 0) {
    console.log('First 5 Notifications:', notifications.slice(0, 5));
  }
  
  await prisma.$disconnect();
}

check();
