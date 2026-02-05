require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    create: {
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin',
      role: 'ADMIN',
    },
    update: {},
  });
  console.log('Admin user ready: admin@example.com / admin123');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
