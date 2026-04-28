import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo users...');

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // Admin
  const adminHash = await hash('password');
  await prisma.user.upsert({
    where: { email: 'admin@weconnect.com' },
    update: { passwordHash: adminHash, isActive: true, emailVerified: true },
    create: {
      email: 'admin@weconnect.com',
      name: 'Super Admin',
      passwordHash: adminHash,
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✅ Admin seeded: admin@weconnect.com / password');

  // Vendor company
  let vendorCompany = await prisma.company.findFirst({ where: { name: 'Green Recyclers Pvt Ltd' } });
  if (!vendorCompany) {
    vendorCompany = await prisma.company.create({
      data: { name: 'Green Recyclers Pvt Ltd', type: 'VENDOR', status: 'APPROVED' },
    });
  }

  const vendorHash = await hash('password');
  await prisma.user.upsert({
    where: { email: 'vendor@weconnect.com' },
    update: { passwordHash: vendorHash, isActive: true, emailVerified: true, phoneVerified: true, companyId: vendorCompany.id },
    create: {
      email: 'vendor@weconnect.com',
      name: 'Green Recyclers Pvt Ltd',
      passwordHash: vendorHash,
      role: 'VENDOR',
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
      companyId: vendorCompany.id,
    },
  });
  console.log('✅ Vendor seeded: vendor@weconnect.com / password');

  // Client company
  let clientCompany = await prisma.company.findFirst({ where: { name: 'Tech Corp Ltd' } });
  if (!clientCompany) {
    clientCompany = await prisma.company.create({
      data: { name: 'Tech Corp Ltd', type: 'CLIENT', status: 'APPROVED' },
    });
  }

  const clientHash = await hash('password');
  await prisma.user.upsert({
    where: { email: 'client@weconnect.com' },
    update: { passwordHash: clientHash, isActive: true, emailVerified: true, phoneVerified: true, companyId: clientCompany.id },
    create: {
      email: 'client@weconnect.com',
      name: 'Tech Corp Ltd',
      passwordHash: clientHash,
      role: 'CLIENT',
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
      companyId: clientCompany.id,
    },
  });
  console.log('✅ Client seeded: client@weconnect.com / password');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
