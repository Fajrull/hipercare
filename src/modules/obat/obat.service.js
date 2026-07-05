const prisma = require("../../config/database");

// =============================================
// OBAT-01: CRUD Master Obat
// =============================================
const getAllMasterObat = async () => {
  return await prisma.masterObat.findMany({
    orderBy: { nama_obat: "asc" },
  });
};

const getMasterObatById = async (id) => {
  const obat = await prisma.masterObat.findUnique({
    where: { id: parseInt(id) },
  });
  if (!obat) throw new Error("Master obat tidak ditemukan");
  return obat;
};

const createMasterObat = async (data) => {
  const { nama_obat, dosis } = data;
  if (!nama_obat) throw new Error("Nama obat wajib diisi");

  return await prisma.masterObat.create({
    data: { nama_obat, dosis },
  });
};

const updateMasterObat = async (id, data) => {
  const obat = await prisma.masterObat.findUnique({
    where: { id: parseInt(id) },
  });
  if (!obat) throw new Error("Master obat tidak ditemukan");

  return await prisma.masterObat.update({
    where: { id: parseInt(id) },
    data: { nama_obat: data.nama_obat, dosis: data.dosis },
  });
};

const deleteMasterObat = async (id) => {
  const obat = await prisma.masterObat.findUnique({
    where: { id: parseInt(id) },
  });
  if (!obat) throw new Error("Master obat tidak ditemukan");

  // Cek apakah masih dipakai oleh pasien
  const dipakai = await prisma.obatPasien.findFirst({
    where: { master_obat_id: parseInt(id) },
  });
  if (dipakai)
    throw new Error(
      "Obat tidak dapat dihapus karena masih digunakan oleh pasien",
    );

  await prisma.masterObat.delete({ where: { id: parseInt(id) } });
  return true;
};

// =============================================
// OBAT-02: Tambah Obat Pasien
// =============================================
const tambahObatPasien = async (pasienId, data) => {
  const { master_obat_id, jumlah_stok, kategori_waktu, dosis } = data;

  if (!master_obat_id || !jumlah_stok || !kategori_waktu) {
    throw new Error(
      "master_obat_id, jumlah_stok, dan kategori_waktu wajib diisi",
    );
  }

  const validWaktu = ["Pagi", "Siang", "Malam"];
  if (!validWaktu.includes(kategori_waktu)) {
    throw new Error("kategori_waktu harus Pagi, Siang, atau Malam");
  }

  // Cek master obat ada
  const masterObat = await prisma.masterObat.findUnique({
    where: { id: parseInt(master_obat_id) },
  });
  if (!masterObat) throw new Error("Master obat tidak ditemukan");

  // Cek pasien ada
  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
  });
  if (!pasien) throw new Error("Pasien tidak ditemukan");

  // Cek apakah obat + waktu yang sama sudah ada untuk pasien ini
  const existing = await prisma.obatPasien.findFirst({
    where: {
      pasien_id: parseInt(pasienId),
      master_obat_id: parseInt(master_obat_id),
      kategori_waktu,
    },
  });
  if (existing) {
    throw new Error(`Obat ini sudah terdaftar untuk jadwal ${kategori_waktu}`);
  }

  return await prisma.obatPasien.create({
    data: {
      pasien_id: parseInt(pasienId),
      master_obat_id: parseInt(master_obat_id),
      jumlah_stok: parseInt(jumlah_stok),
      kategori_waktu,
      dosis,
    },
    include: { master_obat: true },
  });
};

// =============================================
// OBAT-03: Get Daftar Obat Pasien
// =============================================
const getObatPasien = async (pasienId) => {
  const obatList = await prisma.obatPasien.findMany({
    where: { pasien_id: parseInt(pasienId) },
    include: { master_obat: true },
    orderBy: [{ kategori_waktu: "asc" }, { created_at: "desc" }],
  });

  // OBAT-11: Tandai stok menipis (H-3 = stok <= 3)
  return obatList.map((obat) => ({
    ...obat,
    stok_menipis: obat.jumlah_stok <= 3,
  }));
};

// =============================================
// OBAT-04: Update Obat Pasien
// =============================================
const updateObatPasien = async (obatPasienId, pasienId, data) => {
  const obat = await prisma.obatPasien.findFirst({
    where: { id: parseInt(obatPasienId), pasien_id: parseInt(pasienId) },
  });
  if (!obat) throw new Error("Data obat pasien tidak ditemukan");

  const { jumlah_stok, kategori_waktu, dosis } = data;

  if (kategori_waktu) {
    const validWaktu = ["Pagi", "Siang", "Malam"];
    if (!validWaktu.includes(kategori_waktu)) {
      throw new Error("kategori_waktu harus Pagi, Siang, atau Malam");
    }
  }

  return await prisma.obatPasien.update({
    where: { id: parseInt(obatPasienId) },
    data: {
      jumlah_stok:
        jumlah_stok !== undefined ? parseInt(jumlah_stok) : undefined,
      kategori_waktu,
      dosis,
    },
    include: { master_obat: true },
  });
};

// =============================================
// OBAT-05: Hapus Obat Pasien (Soft Delete via flag)
// =============================================
const deleteObatPasien = async (obatPasienId, pasienId) => {
  const obat = await prisma.obatPasien.findFirst({
    where: { id: parseInt(obatPasienId), pasien_id: parseInt(pasienId) },
  });
  if (!obat) throw new Error("Data obat pasien tidak ditemukan");

  await prisma.obatPasien.delete({ where: { id: parseInt(obatPasienId) } });
  return true;
};

// =============================================
// OBAT-06 & OBAT-07: Konfirmasi Minum Obat
// =============================================
const konfirmasiMinum = async (pasienId, data) => {
  const { obat_pasien_id, tanggal, kategori_waktu, status, alasan } = data;

  if (!obat_pasien_id || !tanggal || !kategori_waktu || !status) {
    throw new Error(
      "obat_pasien_id, tanggal, kategori_waktu, dan status wajib diisi",
    );
  }

  const validStatus = ["diminum", "tidak_diminum"];
  if (!validStatus.includes(status)) {
    throw new Error("Status harus diminum atau tidak_diminum");
  }

  // OBAT-07: Validasi alasan jika tidak diminum
  if (status === "tidak_diminum" && !alasan) {
    throw new Error("Alasan wajib diisi jika obat tidak diminum");
  }

  // Cek obat pasien valid
  const obatPasien = await prisma.obatPasien.findFirst({
    where: {
      id: parseInt(obat_pasien_id),
      pasien_id: parseInt(pasienId),
      kategori_waktu,
    },
  });
  if (!obatPasien) throw new Error("Data obat pasien tidak ditemukan");

  // Cek apakah sudah pernah konfirmasi di tanggal & waktu yang sama
  const existingLog = await prisma.logKepatuhanObat.findFirst({
    where: {
      obat_pasien_id: parseInt(obat_pasien_id),
      tanggal: new Date(tanggal),
      kategori_waktu,
      status: { in: ["diminum", "tidak_diminum"] },
    },
  });
  if (existingLog) {
    throw new Error(
      "Konfirmasi untuk obat ini sudah pernah dilakukan pada sesi ini",
    );
  }

  const skor = status === "diminum" ? 1 : 0;

  const result = await prisma.$transaction(async (tx) => {
    // Simpan log kepatuhan
    const log = await tx.logKepatuhanObat.create({
      data: {
        obat_pasien_id: parseInt(obat_pasien_id),
        pasien_id: parseInt(pasienId),
        tanggal: new Date(tanggal),
        kategori_waktu,
        status,
        alasan: status === "tidak_diminum" ? alasan : null,
        skor,
      },
    });

    // OBAT-06: Potong stok jika diminum
    if (status === "diminum") {
      await tx.obatPasien.update({
        where: { id: parseInt(obat_pasien_id) },
        data: { jumlah_stok: { decrement: 1 } },
      });
    }

    return log;
  });

  // OBAT-11: Cek stok setelah dikurangi, return warning jika menipis
  const updatedObat = await prisma.obatPasien.findUnique({
    where: { id: parseInt(obat_pasien_id) },
    include: { master_obat: true },
  });

  return {
    log: result,
    stok_tersisa: updatedObat.jumlah_stok,
    stok_menipis: updatedObat.jumlah_stok <= 3,
    nama_obat: updatedObat.master_obat.nama_obat,
  };
};

// =============================================
// OBAT-08: Logika Obat Belum Dikonfirmasi
// Ambil obat yang belum dikonfirmasi dari sesi sebelumnya
// =============================================
const getObatBelumDikonfirmasi = async (pasienId) => {
  const sekarang = new Date();
  const hariIni = new Date(sekarang.toDateString());

  // Tentukan sesi sebelumnya berdasarkan jam sekarang
  // Pagi: 06.00-11.59 | Siang: 12.00-17.59 | Malam: 18.00-05.59
  const jam = sekarang.getHours();
  let sesiLalu = [];

  if (jam >= 6 && jam < 12) {
    // Sesi pagi → cek sesi malam kemarin yang belum dikonfirmasi
    const kemarin = new Date(hariIni);
    kemarin.setDate(kemarin.getDate() - 1);
    sesiLalu = [{ tanggal: kemarin, kategori_waktu: "Malam" }];
  } else if (jam >= 12 && jam < 18) {
    // Sesi siang → cek sesi pagi hari ini
    sesiLalu = [{ tanggal: hariIni, kategori_waktu: "Pagi" }];
  } else {
    // Sesi malam → cek sesi siang hari ini
    sesiLalu = [{ tanggal: hariIni, kategori_waktu: "Siang" }];
  }

  const belumDikonfirmasi = [];

  for (const sesi of sesiLalu) {
    // Cari obat yang seharusnya diminum di sesi ini
    const obatSesi = await prisma.obatPasien.findMany({
      where: {
        pasien_id: parseInt(pasienId),
        kategori_waktu: sesi.kategori_waktu,
      },
      include: { master_obat: true },
    });

    for (const obat of obatSesi) {
      // Cek apakah sudah ada log konfirmasi
      const sudahKonfirmasi = await prisma.logKepatuhanObat.findFirst({
        where: {
          obat_pasien_id: obat.id,
          tanggal: sesi.tanggal,
          kategori_waktu: sesi.kategori_waktu,
          status: { in: ["diminum", "tidak_diminum"] },
        },
      });

      if (!sudahKonfirmasi) {
        belumDikonfirmasi.push({
          ...obat,
          sesi_tanggal: sesi.tanggal,
          sesi_waktu: sesi.kategori_waktu,
          status: "belum_dikonfirmasi",
        });
      }
    }
  }

  return belumDikonfirmasi;
};

// =============================================
// OBAT-09: Riwayat Kepatuhan
// =============================================
const getRiwayatKepatuhan = async (pasienId, filter) => {
  const sekarang = new Date();
  let startDate;

  if (filter === "mingguan") {
    startDate = new Date(sekarang);
    startDate.setDate(startDate.getDate() - 7);
  } else if (filter === "bulanan") {
    startDate = new Date(sekarang);
    startDate.setMonth(startDate.getMonth() - 1);
  }

  const where = {
    pasien_id: parseInt(pasienId),
    ...(startDate && { tanggal: { gte: startDate } }),
  };

  const logs = await prisma.logKepatuhanObat.findMany({
    where,
    include: {
      obat_pasien: { include: { master_obat: true } },
    },
    orderBy: [{ tanggal: "desc" }, { kategori_waktu: "asc" }],
  });

  return logs;
};

// =============================================
// OBAT-10: Grafik Kepatuhan
// =============================================
const getGrafikKepatuhan = async (pasienId, filter = "mingguan") => {
  const sekarang = new Date();
  let startDate;
  let groupFormat;

  if (filter === "mingguan") {
    startDate = new Date(sekarang);
    startDate.setDate(startDate.getDate() - 7);
    groupFormat = "hari";
  } else {
    startDate = new Date(sekarang);
    startDate.setMonth(startDate.getMonth() - 1);
    groupFormat = "minggu";
  }

  const logs = await prisma.logKepatuhanObat.findMany({
    where: {
      pasien_id: parseInt(pasienId),
      tanggal: { gte: startDate },
    },
    orderBy: { tanggal: "asc" },
  });

  // Group by tanggal
  const grouped = {};
  for (const log of logs) {
    const key = log.tanggal.toISOString().split("T")[0];
    if (!grouped[key]) {
      grouped[key] = { tanggal: key, total: 0, patuh: 0, tidak_patuh: 0 };
    }
    grouped[key].total += 1;
    if (log.skor === 1) grouped[key].patuh += 1;
    else grouped[key].tidak_patuh += 1;
  }

  // Hitung persentase kepatuhan per hari
  const grafik = Object.values(grouped).map((item) => ({
    ...item,
    persentase_kepatuhan:
      item.total > 0 ? Math.round((item.patuh / item.total) * 100) : 0,
  }));

  // Summary keseluruhan
  const totalLog = logs.length;
  const totalPatuh = logs.filter((l) => l.skor === 1).length;

  return {
    filter,
    periode: {
      dari: startDate.toISOString().split("T")[0],
      sampai: sekarang.toISOString().split("T")[0],
    },
    summary: {
      total_konfirmasi: totalLog,
      total_patuh: totalPatuh,
      total_tidak_patuh: totalLog - totalPatuh,
      persentase_kepatuhan:
        totalLog > 0 ? Math.round((totalPatuh / totalLog) * 100) : 0,
    },
    grafik,
  };
};

module.exports = {
  getAllMasterObat,
  getMasterObatById,
  createMasterObat,
  updateMasterObat,
  deleteMasterObat,
  tambahObatPasien,
  getObatPasien,
  updateObatPasien,
  deleteObatPasien,
  konfirmasiMinum,
  getObatBelumDikonfirmasi,
  getRiwayatKepatuhan,
  getGrafikKepatuhan,
};
