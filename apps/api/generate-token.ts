import { PrismaClient } from '@prisma/client';
import { sign } from 'jsonwebtoken';

async function main() {
  const p = new PrismaClient();
  const u = await p.user.findFirst({ where: { email: 'admin@weconnect.com' } });
  if (u) {
    const token = sign({ sub: u.id, email: u.email, role: u.role }, 'super-secret');
    console.log(token);
  } else {
    console.log('no admin');
  }
  await p.$disconnect();
}
main();
