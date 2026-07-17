const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  errorFormat: 'minimal',
});

// Handle disconnect saat app mati
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;