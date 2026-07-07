const prisma = require("../../config/database");

// =============================================
// DIET-01: CRUD Master Diet DASH
// =============================================
const getAllMasterDiet = async () => {
  return await prisma.masterDietDash.findMany({
    orderBy: { nama_makanan: "asc" },
  });
};

const getMasterDietById = async (id) => {
  const diet = await prisma.masterDietDash.findUnique({
    where: { id: parseInt(id) },
  });
  if (!diet) throw new Error("Master diet tidak ditemukan");
  return diet;
};

const createMasterDiet = async (data) => {
  const { nama_makanan, foto, kandungan_gizi, resep_makanan } = data;
  if (!nama_makanan) throw new Error("Nama makanan wajib diisi");

  return await prisma.masterDietDash.create({
    data: { nama_makanan, foto, kandungan_gizi, resep_makanan },
  });
};

const updateMasterDiet = async (id, data) => {
  const diet = await prisma.masterDietDash.findUnique({
    where: { id: parseInt(id) },
  });
  if (!diet) throw new Error("Master diet tidak ditemukan");

  return await prisma.masterDietDash.update({
    where: { id: parseInt(id) },
    data: {
      nama_makanan: data.nama_makanan,
      foto: data.foto,
      kandungan_gizi: data.kandungan_gizi,
      resep_makanan: data.resep_makanan,
    },
  });
};

const deleteMasterDiet = async (id) => {
  const diet = await prisma.masterDietDash.findUnique({
    where: { id: parseInt(id) },
  });
  if (!diet) throw new Error("Master diet tidak ditemukan");

  await prisma.masterDietDash.delete({ where: { id: parseInt(id) } });
  return true;
};

// =============================================
// DIET-02: Get Rekomendasi Menu Harian
// =============================================
const getRekomendasiMenu = async () => {
  // Ambil semua master diet sebagai rekomendasi
  // Bisa dikembangkan lebih lanjut dengan logika rekomendasi berdasarkan kondisi pasien
  return await prisma.masterDietDash.findMany({
    orderBy: { nama_makanan: "asc" },
    select: {
      id: true,
      nama_makanan: true,
      foto: true,
      kandungan_gizi: true,
      resep_makanan: true,
    },
  });
};

// =============================================
// DIET-03: Input Log Konsumsi Makanan
// =============================================
const inputLogKonsumsi = async (pasienId, data) => {
  const { master_diet_id, nama_makanan, kategori_makan, foto, tanggal } = data;

  if (!kategori_makan || !tanggal) {
    throw new Error("kategori_makan dan tanggal wajib diisi");
  }

  const validKategori = ["Pagi", "Siang", "Malam"];
  if (!validKategori.includes(kategori_makan)) {
    throw new Error("kategori_makan harus Pagi, Siang, atau Malam");
  }

  // Wajib salah satu: dari master atau input manual
  if (!master_diet_id && !nama_makanan) {
    throw new Error("Isi master_diet_id atau nama_makanan");
  }

  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
  });
  if (!pasien) throw new Error("Pasien tidak ditemukan");

  // Jika dari master, validasi master_diet_id ada
  if (master_diet_id) {
    const masterDiet = await prisma.masterDietDash.findUnique({
      where: { id: parseInt(master_diet_id) },
    });
    if (!masterDiet) throw new Error("Master diet tidak ditemukan");
  }

  return await prisma.logKonsumsiMakanan.create({
    data: {
      pasien_id: parseInt(pasienId),
      master_diet_id: master_diet_id ? parseInt(master_diet_id) : null,
      nama_makanan: master_diet_id ? null : nama_makanan,
      kategori_makan,
      foto,
      tanggal: new Date(tanggal),
    },
    include: {
      master_diet: true,
    },
  });
};

// =============================================
// DIET-04: Get Log Konsumsi Makanan
// =============================================
const getLogKonsumsi = async (pasienId, tanggal) => {
  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
  });
  if (!pasien) throw new Error("Pasien tidak ditemukan");

  const where = { pasien_id: parseInt(pasienId) };

  if (tanggal) {
    const start = new Date(tanggal);
    const end = new Date(tanggal);
    end.setDate(end.getDate() + 1);
    where.tanggal = { gte: start, lt: end };
  }

  const logs = await prisma.logKonsumsiMakanan.findMany({
    where,
    include: { master_diet: true },
    orderBy: [{ tanggal: "desc" }, { kategori_makan: "asc" }],
  });

  // Group by tanggal & kategori untuk kemudahan frontend
  const grouped = {};
  for (const log of logs) {
    const key = log.tanggal.toISOString().split("T")[0];
    if (!grouped[key]) {
      grouped[key] = { tanggal: key, Pagi: [], Siang: [], Malam: [] };
    }
    grouped[key][log.kategori_makan].push(log);
  }

  return {
    logs,
    grouped: Object.values(grouped),
  };
};

// =============================================
// DIET-05: Update Log Konsumsi
// =============================================
const updateLogKonsumsi = async (logId, pasienId, data) => {
  const log = await prisma.logKonsumsiMakanan.findFirst({
    where: { id: parseInt(logId), pasien_id: parseInt(pasienId) },
  });
  if (!log) throw new Error("Log konsumsi tidak ditemukan");

  if (data.kategori_makan) {
    const validKategori = ["Pagi", "Siang", "Malam"];
    if (!validKategori.includes(data.kategori_makan)) {
      throw new Error("kategori_makan harus Pagi, Siang, atau Malam");
    }
  }

  return await prisma.logKonsumsiMakanan.update({
    where: { id: parseInt(logId) },
    data: {
      master_diet_id: data.master_diet_id
        ? parseInt(data.master_diet_id)
        : undefined,
      nama_makanan: data.nama_makanan,
      kategori_makan: data.kategori_makan,
      foto: data.foto,
      tanggal: data.tanggal ? new Date(data.tanggal) : undefined,
    },
    include: { master_diet: true },
  });
};

// =============================================
// DIET-05: Delete Log Konsumsi
// =============================================
const deleteLogKonsumsi = async (logId, pasienId) => {
  const log = await prisma.logKonsumsiMakanan.findFirst({
    where: { id: parseInt(logId), pasien_id: parseInt(pasienId) },
  });
  if (!log) throw new Error("Log konsumsi tidak ditemukan");

  await prisma.logKonsumsiMakanan.delete({ where: { id: parseInt(logId) } });
  return true;
};

module.exports = {
  getAllMasterDiet,
  getMasterDietById,
  createMasterDiet,
  updateMasterDiet,
  deleteMasterDiet,
  getRekomendasiMenu,
  inputLogKonsumsi,
  getLogKonsumsi,
  updateLogKonsumsi,
  deleteLogKonsumsi,
};
