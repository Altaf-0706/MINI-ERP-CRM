import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('admin123', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@minierp.com' },
    update: {},
    create: {
      email: 'admin@minierp.com',
      name: 'Admin User',
      password,
      role: 'ADMIN',
    },
  });

  const passwordSales = await bcrypt.hash('sales123', salt);
  const sales = await prisma.user.upsert({
    where: { email: 'sales@minierp.com' },
    update: {},
    create: {
      email: 'sales@minierp.com',
      name: 'Sales Rep',
      password: passwordSales,
      role: 'SALES',
    },
  });

  console.log({ admin, sales });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
