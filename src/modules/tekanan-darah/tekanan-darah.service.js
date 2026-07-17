const prisma = require("../../config/database");

// =============================================
// Helper: Klasifikasi Tekanan Darah
// =============================================
const klasifikasiTD = (sistolik, diastolik) => {
  if (sistolik > 180 || diastolik > 120)
    return { label: "Krisis HT", is_emergency: true };
  if (sistolik >= 160 || diastolik >= 100)
    return { label: "HT Grade 2", is_emergency: true };
  if (sistolik >= 140 || diastolik >= 90)
    return { label: "HT Grade 1", is_emergency: false };
  if (sistolik >= 120 || diastolik >= 80)
    return { label: "Pre-HT", is_emergency: false };
  return { label: "Normal", is_emergency: false };
};

// =============================================
// TD-01: Input Tekanan Darah
// TD-02: Auto Klasifikasi
// TD-03: Emergency Warning
// =============================================
const inputTekananDarah = async (pasienId, data, inputterUserId) => {
  const { tanggal, sistolik, diastolik } = data;

  if (!tanggal || !sistolik || !diastolik) {
    throw new Error("Tanggal, sistolik, dan diastolik wajib diisi");
  }

  if (sistolik < 50 || sistolik > 300)
    throw new Error("Nilai sistolik tidak valid (50-300)");
  if (diastolik < 30 || diastolik > 200)
    throw new Error("Nilai diastolik tidak valid (30-200)");

  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
  });
  if (!pasien) throw new Error("Pasien tidak ditemukan");

  // Validasi 1 hari hanya bisa input 1x tekanan darah
  const existingTD = await prisma.tekananDarah.findFirst({
    where: {
      pasien_id: parseInt(pasienId),
      tanggal: new Date(tanggal),
    },
  });
  if (existingTD) {
    throw new Error(
      "Tekanan darah untuk tanggal ini sudah diinput. Gunakan fitur edit jika ingin mengubah.",
    );
  }

  const { label, is_emergency } = klasifikasiTD(
    parseInt(sistolik),
    parseInt(diastolik),
  );

  const record = await prisma.tekananDarah.create({
    data: {
      pasien_id: parseInt(pasienId),
      tanggal: new Date(tanggal),
      sistolik: parseInt(sistolik),
      diastolik: parseInt(diastolik),
      klasifikasi: label,
      is_emergency,
    },
  });

  return {
    ...record,
    is_emergency,
    klasifikasi: label,
    perlu_notifikasi: is_emergency,
  };
};

// =============================================
// TD-04: Get Riwayat Tekanan Darah
// =============================================
const getRiwayatTD = async (pasienId, filter) => {
  const sekarang = new Date();
  let startDate;

  if (filter === "mingguan") {
    startDate = new Date(sekarang);
    startDate.setDate(startDate.getDate() - 7);
  } else if (filter === "bulanan") {
    startDate = new Date(sekarang);
    startDate.setMonth(startDate.getMonth() - 1);
  }

  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
  });
  if (!pasien) throw new Error("Pasien tidak ditemukan");

  return await prisma.tekananDarah.findMany({
    where: {
      pasien_id: parseInt(pasienId),
      ...(startDate && { tanggal: { gte: startDate } }),
    },
    orderBy: { tanggal: "desc" },
  });
};

// =============================================
// TD-05: Grafik Tekanan Darah
// =============================================
const getGrafikTD = async (pasienId, filter = "mingguan") => {
  const sekarang = new Date();
  let startDate;

  if (filter === "mingguan") {
    startDate = new Date(sekarang);
    startDate.setDate(startDate.getDate() - 7);
  } else {
    startDate = new Date(sekarang);
    startDate.setMonth(startDate.getMonth() - 1);
  }

  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
  });
  if (!pasien) throw new Error("Pasien tidak ditemukan");

  const records = await prisma.tekananDarah.findMany({
    where: {
      pasien_id: parseInt(pasienId),
      tanggal: { gte: startDate },
    },
    orderBy: { tanggal: "asc" },
    select: {
      id: true,
      tanggal: true,
      sistolik: true,
      diastolik: true,
      klasifikasi: true,
      is_emergency: true,
    },
  });

  // Hitung summary
  const total = records.length;
  const countPerKlasifikasi = {
    Normal: 0,
    "Pre-HT": 0,
    "HT Grade 1": 0,
    "HT Grade 2": 0,
    "Krisis HT": 0,
  };

  for (const r of records) {
    if (countPerKlasifikasi[r.klasifikasi] !== undefined) {
      countPerKlasifikasi[r.klasifikasi] += 1;
    }
  }

  // Rata-rata sistolik & diastolik
  const avgSistolik =
    total > 0
      ? Math.round(records.reduce((sum, r) => sum + r.sistolik, 0) / total)
      : 0;
  const avgDiastolik =
    total > 0
      ? Math.round(records.reduce((sum, r) => sum + r.diastolik, 0) / total)
      : 0;

  return {
    filter,
    periode: {
      dari: startDate.toISOString().split("T")[0],
      sampai: sekarang.toISOString().split("T")[0],
    },
    summary: {
      total_input: total,
      rata_rata_sistolik: avgSistolik,
      rata_rata_diastolik: avgDiastolik,
      klasifikasi_rata_rata: klasifikasiTD(avgSistolik, avgDiastolik).label,
      distribusi: countPerKlasifikasi,
    },
    grafik: records,
  };
};

// =============================================
// TD-06: Update Tekanan Darah
// =============================================
const updateTekananDarah = async (id, pasienId, data) => {
  const record = await prisma.tekananDarah.findFirst({
    where: { id: parseInt(id), pasien_id: parseInt(pasienId) },
  });
  if (!record) throw new Error("Data tekanan darah tidak ditemukan");

  const sistolik = data.sistolik ? parseInt(data.sistolik) : record.sistolik;
  const diastolik = data.diastolik
    ? parseInt(data.diastolik)
    : record.diastolik;

  if (sistolik < 50 || sistolik > 300)
    throw new Error("Nilai sistolik tidak valid (50-300)");
  if (diastolik < 30 || diastolik > 200)
    throw new Error("Nilai diastolik tidak valid (30-200)");

  // Recalculate klasifikasi setelah update
  const { label, is_emergency } = klasifikasiTD(sistolik, diastolik);

  return await prisma.tekananDarah.update({
    where: { id: parseInt(id) },
    data: {
      tanggal: data.tanggal ? new Date(data.tanggal) : undefined,
      sistolik,
      diastolik,
      klasifikasi: label,
      is_emergency,
    },
  });
};

// =============================================
// TD-06: Delete Tekanan Darah
// =============================================
const deleteTekananDarah = async (id, pasienId) => {
  const record = await prisma.tekananDarah.findFirst({
    where: { id: parseInt(id), pasien_id: parseInt(pasienId) },
  });
  if (!record) throw new Error("Data tekanan darah tidak ditemukan");

  await prisma.tekananDarah.delete({ where: { id: parseInt(id) } });
  return true;
};

// =============================================
// Helper: Ambil device_id keluarga & perawat
// untuk keperluan notifikasi di controller
// =============================================
const getNotifTargets = async (pasienId) => {
  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
    include: {
      keluarga: { include: { user: { select: { device_id: true } } } },
      perawat_pasien: {
        include: {
          perawat: { include: { user: { select: { device_id: true } } } },
        },
      },
    },
  });

  const deviceIds = [
    ...pasien.keluarga.map((k) => k.user.device_id),
    ...pasien.perawat_pasien.map((pp) => pp.perawat.user.device_id),
  ].filter(Boolean);

  return deviceIds;
};

module.exports = {
  inputTekananDarah,
  getRiwayatTD,
  getGrafikTD,
  updateTekananDarah,
  deleteTekananDarah,
  getNotifTargets,
};
