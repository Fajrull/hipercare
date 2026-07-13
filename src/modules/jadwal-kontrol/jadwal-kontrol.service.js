const prisma = require("../../config/database");

// =============================================
// KONTROL-01: Tambah Jadwal Kontrol
// =============================================
const tambahJadwal = async (pasienId, data) => {
  const { tanggal, jam, lokasi_faskes, nama_dokter } = data;

  if (!tanggal || !jam) {
    throw new Error("Tanggal dan jam wajib diisi");
  }

  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
    include: {
      keluarga: {
        include: { user: { select: { id: true, device_id: true } } },
      },
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

  // Gabungkan tanggal + jam menjadi datetime
  const jadwalDatetime = new Date(`${tanggal}T${jam}:00`);
  if (isNaN(jadwalDatetime))
    throw new Error("Format tanggal atau jam tidak valid");

  // Cek jadwal tidak boleh di masa lalu
  if (jadwalDatetime < new Date()) {
    throw new Error("Jadwal kontrol tidak boleh di masa lalu");
  }

  const jadwal = await prisma.jadwalKontrol.create({
    data: {
      pasien_id: parseInt(pasienId),
      tanggal: new Date(tanggal),
      jam: jadwalDatetime,
      lokasi_faskes,
      nama_dokter,
    },
  });

  // Kumpulkan targets notifikasi (pasien + keluarga + perawat)
  const pasienUser = await prisma.users.findUnique({
    where: { id: pasien.user_id },
    select: { id: true, device_id: true },
  });

  const notifTargets = [
    // Pasien sendiri
    { user_id: pasienUser.id, device_id: pasienUser.device_id },
    // Keluarga
    ...pasien.keluarga.map((k) => ({
      user_id: k.user.id,
      device_id: k.user.device_id,
    })),
    // Perawat
    ...pasien.perawat_pasien.map((pp) => ({
      user_id: pp.perawat.user.id,
      device_id: pp.perawat.user.device_id,
    })),
  ];

  return { jadwal, notifTargets };
};

// =============================================
// KONTROL-02: Get Jadwal Kontrol
// =============================================
const getJadwal = async (pasienId) => {
  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
  });
  if (!pasien) throw new Error("Pasien tidak ditemukan");

  const sekarang = new Date();

  const jadwalList = await prisma.jadwalKontrol.findMany({
    where: { pasien_id: parseInt(pasienId) },
    orderBy: { tanggal: "asc" },
  });

  // Tambahkan info H- untuk setiap jadwal
  return jadwalList.map((jadwal) => {
    const selisihMs = jadwal.tanggal - sekarang;
    const selisihHari = Math.ceil(selisihMs / (1000 * 60 * 60 * 24));

    let status;
    if (selisihHari < 0) status = "sudah_lewat";
    else if (selisihHari === 0) status = "hari_ini";
    else if (selisihHari <= 3) status = `H-${selisihHari}`;
    else status = "akan_datang";

    return { ...jadwal, selisih_hari: selisihHari, status };
  });
};

// =============================================
// KONTROL-03: Delete Jadwal Kontrol
// =============================================
const deleteJadwal = async (jadwalId, pasienId) => {
  const jadwal = await prisma.jadwalKontrol.findFirst({
    where: { id: parseInt(jadwalId), pasien_id: parseInt(pasienId) },
  });
  if (!jadwal) throw new Error("Jadwal kontrol tidak ditemukan");

  await prisma.jadwalKontrol.delete({ where: { id: parseInt(jadwalId) } });
  return true;
};

// =============================================
// Helper: Ambil jadwal yang perlu diingatkan
// Dipakai oleh scheduler notifikasi (NOTIF-06)
// =============================================
const getJadwalUntukReminder = async () => {
  const sekarang = new Date();

  const h3 = new Date(sekarang);
  h3.setDate(h3.getDate() + 3);

  const h1 = new Date(sekarang);
  h1.setDate(h1.getDate() + 1);

  // Ambil jadwal yang tanggalnya H-3, H-1, atau H-0 (hari ini)
  const targets = [h3, h1, sekarang];

  const jadwalList = [];

  for (const target of targets) {
    const startOfDay = new Date(target);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(target);
    endOfDay.setHours(23, 59, 59, 999);

    const jadwals = await prisma.jadwalKontrol.findMany({
      where: {
        tanggal: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        pasien: {
          include: {
            user: { select: { id: true, device_id: true } },
            keluarga: {
              include: { user: { select: { id: true, device_id: true } } },
            },
          },
        },
      },
    });

    const selisihHari = Math.round(
      (startOfDay - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24),
    );

    jadwals.forEach((j) =>
      jadwalList.push({ ...j, selisih_hari: selisihHari }),
    );
  }

  return jadwalList;
};

module.exports = {
  tambahJadwal,
  getJadwal,
  deleteJadwal,
  getJadwalUntukReminder,
};
