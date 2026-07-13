const prisma = require("../../config/database");

// =============================================
// KLINIS-01: Input Keluhan Klinis
// =============================================
const inputKeluhan = async (pasienId, data, requesterUserId, requesterRole) => {
  const { tanggal, keluhan } = data;

  if (!tanggal || !keluhan) {
    throw new Error("Tanggal dan keluhan wajib diisi");
  }

  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
    include: {
      perawat_pasien: {
        include: {
          perawat: {
            include: { user: { select: { id: true, device_id: true } } },
          },
        },
      },
    },
  });
  if (!pasien) throw new Error("Pasien tidak ditemukan");

  const keluhan_record = await prisma.keluhanKlinis.create({
    data: {
      pasien_id: parseInt(pasienId),
      input_oleh_role: requesterRole,
      input_oleh_user_id: requesterUserId,
      tanggal: new Date(tanggal),
      keluhan,
    },
  });

  // Ambil device_id perawat untuk notifikasi
  const perawatTargets = pasien.perawat_pasien.map((pp) => ({
    user_id: pp.perawat.user.id,
    device_id: pp.perawat.user.device_id,
  }));

  return { keluhan_record, perawatTargets };
};

// =============================================
// KLINIS-02: Get Riwayat Keluhan
// =============================================
const getRiwayatKeluhan = async (pasienId) => {
  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
  });
  if (!pasien) throw new Error("Pasien tidak ditemukan");

  return await prisma.keluhanKlinis.findMany({
    where: { pasien_id: parseInt(pasienId) },
    include: {
      input_oleh: { select: { id: true, username: true, role: true } },
    },
    orderBy: { tanggal: "desc" },
  });
};

// =============================================
// KLINIS-03: Update Keluhan
// =============================================
const updateKeluhan = async (
  keluhanId,
  pasienId,
  data,
  requesterUserId,
  requesterRole,
) => {
  const keluhan = await prisma.keluhanKlinis.findFirst({
    where: { id: parseInt(keluhanId), pasien_id: parseInt(pasienId) },
  });
  if (!keluhan) throw new Error("Keluhan tidak ditemukan");

  // Hanya yang input bisa update, kecuali admin
  if (
    requesterRole !== "admin" &&
    keluhan.input_oleh_user_id !== requesterUserId
  ) {
    throw new Error("Anda tidak memiliki akses untuk mengubah keluhan ini");
  }

  return await prisma.keluhanKlinis.update({
    where: { id: parseInt(keluhanId) },
    data: {
      tanggal: data.tanggal ? new Date(data.tanggal) : undefined,
      keluhan: data.keluhan,
    },
  });
};

// =============================================
// KLINIS-03: Delete Keluhan
// =============================================
const deleteKeluhan = async (
  keluhanId,
  pasienId,
  requesterUserId,
  requesterRole,
) => {
  const keluhan = await prisma.keluhanKlinis.findFirst({
    where: { id: parseInt(keluhanId), pasien_id: parseInt(pasienId) },
  });
  if (!keluhan) throw new Error("Keluhan tidak ditemukan");

  if (
    requesterRole !== "admin" &&
    keluhan.input_oleh_user_id !== requesterUserId
  ) {
    throw new Error("Anda tidak memiliki akses untuk menghapus keluhan ini");
  }

  await prisma.keluhanKlinis.delete({ where: { id: parseInt(keluhanId) } });
  return true;
};

module.exports = {
  inputKeluhan,
  getRiwayatKeluhan,
  updateKeluhan,
  deleteKeluhan,
};
