const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.update({
  where: { email: 'nityashetty21@gmail.com' },
  data: { passwordHash: '' }
})
.then(res => { console.log('Updated password'); return prisma.$disconnect(); })
.catch(err => { console.error(err); return prisma.$disconnect(); });
