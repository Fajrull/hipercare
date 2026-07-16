const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  errorFormat: 'minimal',
  // Paksa pakai binary engine, bukan library engine
  // Lebih stabil di shared hosting
  __internal: {
    engine: {
      cwd: process.cwd(),
    },
  },
});

// Handle disconnect saat app mati
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;