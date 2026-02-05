const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function connect() {
  await prisma.$connect();
}

module.exports = { prisma, connect };
