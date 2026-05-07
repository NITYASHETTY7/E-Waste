const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findUnique({ where: { email: 'nityashetty21@gmail.com' } })
  .then(res => { console.log(JSON.stringify(res, null, 2)); prisma.$disconnect(); })
  .catch(err => { console.error(err); prisma.$disconnect(); });
