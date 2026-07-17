const prisma = require('../../config/database');

// =============================================
// BADGE-01: CRUD Badge Motivasi
// =============================================
const getAllBadge = async () => {
  return await prisma.badgeMotivasi.findMany({
    orderBy: { created_at: 'desc' },
  });
};

const getBadgeById = async (id) => {
  const badge = await prisma.badgeMotivasi.findUnique({
    where: { id: parseInt(id) },
  });
  if (!badge) throw new Error('Badge tidak ditemukan');
  return badge;
};

const createBadge = async (data) => {
  const { judul, deskripsi } = data;
  if (!judul) throw new Error('Judul badge wajib diisi');

  return await prisma.badgeMotivasi.create({
    data: { judul, deskripsi },
  });
};

const updateBadge = async (id, data) => {
  const badge = await prisma.badgeMotivasi.findUnique({
    where: { id: parseInt(id) },
  });
  if (!badge) throw new Error('Badge tidak ditemukan');

  return await prisma.badgeMotivasi.update({
    where: { id: parseInt(id) },
    data: { judul: data.judul, deskripsi: data.deskripsi },
  });
};

const deleteBadge = async (id) => {
  const badge = await prisma.badgeMotivasi.findUnique({
    where: { id: parseInt(id) },
  });
  if (!badge) throw new Error('Badge tidak ditemukan');

  await prisma.badgeMotivasi.delete({ where: { id: parseInt(id) } });
  return true;
};

// =============================================
// BADGE-02: Get Badge untuk Pasien
// Menentukan badge mana yang layak diterima
// berdasarkan persentase kepatuhan
// =============================================
const getBadgePasien = async (pasienId) => {
  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
  });
  if (!pasien) throw new Error('Pasien tidak ditemukan');

  // Hitung persentase kepatuhan 7 hari terakhir
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const logs = await prisma.logKepatuhanObat.findMany({
    where: {
      pasien_id: parseInt(pasienId),
      tanggal: { gte: sevenDaysAgo },
    },
  });

  const total = logs.length;
  const patuh = logs.filter((l) => l.skor === 1).length;
  const persentase = total > 0 ? Math.round((patuh / total) * 100) : 0;

  // Tentukan badge yang layak berdasarkan persentase
  let badgeLayak = null;
  const semuaBadge = await prisma.badgeMotivasi.findMany({
    orderBy: { created_at: 'asc' },
  });

  if (persentase === 100 && semuaBadge.length >= 1) {
    badgeLayak = semuaBadge[0]; // Badge terbaik
  } else if (persentase >= 80 && semuaBadge.length >= 2) {
    badgeLayak = semuaBadge[1];
  } else if (persentase >= 50 && semuaBadge.length >= 3) {
    badgeLayak = semuaBadge[2];
  }

  return {
    persentase_kepatuhan: persentase,
    total_konfirmasi: total,
    total_patuh: patuh,
    badge: badgeLayak,
    semua_badge: semuaBadge,
  };
};

module.exports = {
  getAllBadge,
  getBadgeById,
  createBadge,
  updateBadge,
  deleteBadge,
  getBadgePasien,
};