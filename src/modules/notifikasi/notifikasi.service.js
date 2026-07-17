const prisma = require('../../config/database');

// =============================================
// NOTIF-08: Get Riwayat Notifikasi
// =============================================
const getRiwayatNotifikasi = async (userId) => {
  return await prisma.notifikasi.findMany({
    where: { user_id: parseInt(userId) },
    orderBy: { created_at: 'desc' },
  });
};

// =============================================
// NOTIF-09: Tandai Notifikasi Dibaca
// =============================================
const tandaiDibaca = async (notifId, userId) => {
  const notif = await prisma.notifikasi.findFirst({
    where: { id: parseInt(notifId), user_id: parseInt(userId) },
  });
  if (!notif) throw new Error('Notifikasi tidak ditemukan');

  return await prisma.notifikasi.update({
    where: { id: parseInt(notifId) },
    data: { is_read: true },
  });
};

// Tandai semua notifikasi dibaca
const tandaiSemuaDibaca = async (userId) => {
  await prisma.notifikasi.updateMany({
    where: { user_id: parseInt(userId), is_read: false },
    data: { is_read: true },
  });
  return true;
};

// Hitung notifikasi belum dibaca
const countBelumDibaca = async (userId) => {
  return await prisma.notifikasi.count({
    where: { user_id: parseInt(userId), is_read: false },
  });
};

module.exports = {
  getRiwayatNotifikasi,
  tandaiDibaca,
  tandaiSemuaDibaca,
  countBelumDibaca,
};