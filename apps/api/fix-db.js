const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.update({
  where: { email: 'nityashetty21@gmail.com' },
  data: { role: 'ADMIN', isActive: true, companyId: null }
})
.then(res => { console.log('Fixed DB user:', res); prisma.$disconnect(); })
.catch(err => { console.error(err); prisma.$disconnect(); });
