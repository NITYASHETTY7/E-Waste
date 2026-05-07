const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findUnique({ where: { email: 'nityashetty21@gmail.com' } })
  .then(res => { console.log(res); return prisma.$disconnect(); })
  .catch(err => { console.error(err); return prisma.$disconnect(); });
