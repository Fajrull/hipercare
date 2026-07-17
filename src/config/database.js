const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// Pakai koneksi pooled (pgbouncer/Supavisor) yang sama seperti sebelumnya
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({
  adapter,
  errorFormat: 'minimal',
});

// Handle disconnect saat app mati
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;