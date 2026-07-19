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
  return await prisma.masterObat.create({ data: { nama_obat, dosis } });
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

  // Support single string atau array
  const waktuList = Array.isArray(kategori_waktu)
    ? kategori_waktu
    : [kategori_waktu];

  const validWaktu = ["Pagi", "Siang", "Malam"];
  for (const waktu of waktuList) {
    if (!validWaktu.includes(waktu)) {
      throw new Error(
        `kategori_waktu "${waktu}" tidak valid. Harus Pagi, Siang, atau Malam`,
      );
    }
  }

  // Cek duplikat dalam input
  const uniqueWaktu = [...new Set(waktuList)];
  if (uniqueWaktu.length !== waktuList.length) {
    throw new Error("Terdapat duplikat kategori_waktu dalam input");
  }

  const masterObat = await prisma.masterObat.findUnique({
    where: { id: parseInt(master_obat_id) },
  });
  if (!masterObat) throw new Error("Master obat tidak ditemukan");

  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
  });
  if (!pasien) throw new Error("Pasien tidak ditemukan");

  // Cek apakah obat yang sama sudah ada untuk pasien ini
  const existing = await prisma.obatPasien.findFirst({
    where: {
      pasien_id: parseInt(pasienId),
      master_obat_id: parseInt(master_obat_id),
    },
  });
  if (existing) throw new Error("Obat ini sudah terdaftar untuk pasien ini");

  return await prisma.obatPasien.create({
    data: {
      pasien_id: parseInt(pasienId),
      master_obat_id: parseInt(master_obat_id),
      jumlah_stok: parseInt(jumlah_stok),
      kategori_waktu: uniqueWaktu, // simpan sebagai array
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
    orderBy: { created_at: "desc" },
  });

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

  if (data.kategori_waktu) {
    const waktuList = Array.isArray(data.kategori_waktu)
      ? data.kategori_waktu
      : [data.kategori_waktu];
    const validWaktu = ["Pagi", "Siang", "Malam"];
    for (const waktu of waktuList) {
      if (!validWaktu.includes(waktu)) {
        throw new Error(`kategori_waktu "${waktu}" tidak valid`);
      }
    }
    data.kategori_waktu = [...new Set(waktuList)];
  }

  return await prisma.obatPasien.update({
    where: { id: parseInt(obatPasienId) },
    data: {
      jumlah_stok:
        data.jumlah_stok !== undefined ? parseInt(data.jumlah_stok) : undefined,
      kategori_waktu: data.kategori_waktu,
      dosis: data.dosis,
    },
    include: { master_obat: true },
  });
};

// =============================================
// OBAT-05: Hapus Obat Pasien
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

  if (status === "tidak_diminum" && !alasan) {
    throw new Error("Alasan wajib diisi jika obat tidak diminum");
  }

  // Cek obat pasien valid dan kategori_waktu ada di array
  const obatPasien = await prisma.obatPasien.findFirst({
    where: {
      id: parseInt(obat_pasien_id),
      pasien_id: parseInt(pasienId),
    },
  });
  if (!obatPasien) throw new Error("Data obat pasien tidak ditemukan");

  // Validasi kategori_waktu ada di array obat pasien
  if (!obatPasien.kategori_waktu.includes(kategori_waktu)) {
    throw new Error(`Obat ini tidak dijadwalkan untuk waktu ${kategori_waktu}`);
  }

  // Cek apakah sudah pernah konfirmasi
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

    if (status === "diminum") {
      await tx.obatPasien.update({
        where: { id: parseInt(obat_pasien_id) },
        data: { jumlah_stok: { decrement: 1 } },
      });
    }

    return log;
  });

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
// =============================================
const getObatBelumDikonfirmasi = async (pasienId) => {
  const sekarang = new Date();
  const hariIni = new Date(sekarang.toDateString());

  const jam = sekarang.getHours();
  let sesiLalu = [];

  if (jam >= 6 && jam < 12) {
    const kemarin = new Date(hariIni);
    kemarin.setDate(kemarin.getDate() - 1);
    sesiLalu = [{ tanggal: kemarin, kategori_waktu: "Malam" }];
  } else if (jam >= 12 && jam < 18) {
    sesiLalu = [{ tanggal: hariIni, kategori_waktu: "Pagi" }];
  } else {
    sesiLalu = [{ tanggal: hariIni, kategori_waktu: "Siang" }];
  }

  const belumDikonfirmasi = [];

  for (const sesi of sesiLalu) {
    // Cari obat yang kategori_waktu array-nya mengandung sesi.kategori_waktu
    const obatSesi = await prisma.obatPasien.findMany({
      where: {
        pasien_id: parseInt(pasienId),
        kategori_waktu: { has: sesi.kategori_waktu }, // filter array contains
      },
      include: { master_obat: true },
    });

    for (const obat of obatSesi) {
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
const getRiwayatKepatuhan = async (pasienId, filter, startDate, endDate) => {
  let dari, sampai;

  if (startDate && endDate) {
    dari = new Date(startDate);
    sampai = new Date(endDate);
    sampai.setHours(23, 59, 59, 999);
  } else if (filter === "mingguan") {
    dari = new Date();
    dari.setDate(dari.getDate() - 7);
    sampai = new Date();
  } else if (filter === "bulanan") {
    dari = new Date();
    dari.setMonth(dari.getMonth() - 1);
    sampai = new Date();
  }

  return await prisma.logKepatuhanObat.findMany({
    where: {
      pasien_id: parseInt(pasienId),
      ...(dari && sampai && { tanggal: { gte: dari, lte: sampai } }),
    },
    include: {
      obat_pasien: { include: { master_obat: true } },
    },
    orderBy: [{ tanggal: "desc" }, { kategori_waktu: "asc" }],
  });
};

// =============================================
// OBAT-10: Grafik Kepatuhan
// =============================================
const getGrafikKepatuhan = async (pasienId, filter, startDate, endDate) => {
  let dari, sampai;

  if (startDate && endDate) {
    dari = new Date(startDate);
    sampai = new Date(endDate);
    sampai.setHours(23, 59, 59, 999);
  } else if (filter === "bulanan") {
    dari = new Date();
    dari.setMonth(dari.getMonth() - 1);
    sampai = new Date();
  } else {
    dari = new Date();
    dari.setDate(dari.getDate() - 7);
    sampai = new Date();
  }

  const logs = await prisma.logKepatuhanObat.findMany({
    where: {
      pasien_id: parseInt(pasienId),
      tanggal: { gte: dari, lte: sampai },
    },
    orderBy: { tanggal: "asc" },
  });

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

  const grafik = Object.values(grouped).map((item) => ({
    ...item,
    persentase_kepatuhan:
      item.total > 0 ? Math.round((item.patuh / item.total) * 100) : 0,
  }));

  const totalLog = logs.length;
  const totalPatuh = logs.filter((l) => l.skor === 1).length;

  return {
    filter: startDate && endDate ? "custom" : filter,
    periode: {
      dari: dari.toISOString().split("T")[0],
      sampai: sampai.toISOString().split("T")[0],
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

// =============================================
// OBAT-11: Update & Delete Log Kepatuhan
// =============================================
const updateLogKepatuhan = async (logId, pasienId, data) => {
  const log = await prisma.logKepatuhanObat.findFirst({
    where: { id: parseInt(logId), pasien_id: parseInt(pasienId) },
  });
  if (!log) throw new Error("Log kepatuhan tidak ditemukan");

  if (data.status) {
    const validStatus = ["diminum", "tidak_diminum"];
    if (!validStatus.includes(data.status)) {
      throw new Error("Status harus diminum atau tidak_diminum");
    }
    if (data.status === "tidak_diminum" && !data.alasan) {
      throw new Error("Alasan wajib diisi jika status tidak_diminum");
    }
  }

  const skor = data.status ? (data.status === "diminum" ? 1 : 0) : log.skor;

  return await prisma.$transaction(async (tx) => {
    if (data.status && data.status !== log.status) {
      if (data.status === "diminum" && log.status === "tidak_diminum") {
        await tx.obatPasien.update({
          where: { id: log.obat_pasien_id },
          data: { jumlah_stok: { decrement: 1 } },
        });
      } else if (data.status === "tidak_diminum" && log.status === "diminum") {
        await tx.obatPasien.update({
          where: { id: log.obat_pasien_id },
          data: { jumlah_stok: { increment: 1 } },
        });
      }
    }

    return await tx.logKepatuhanObat.update({
      where: { id: parseInt(logId) },
      data: {
        status: data.status,
        alasan: data.status === "tidak_diminum" ? data.alasan : null,
        skor,
      },
    });
  });
};

const deleteLogKepatuhan = async (logId, pasienId) => {
  const log = await prisma.logKepatuhanObat.findFirst({
    where: { id: parseInt(logId), pasien_id: parseInt(pasienId) },
  });
  if (!log) throw new Error("Log kepatuhan tidak ditemukan");

  await prisma.$transaction(async (tx) => {
    if (log.status === "diminum") {
      await tx.obatPasien.update({
        where: { id: log.obat_pasien_id },
        data: { jumlah_stok: { increment: 1 } },
      });
    }
    await tx.logKepatuhanObat.delete({ where: { id: parseInt(logId) } });
  });

  return true;
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
  updateLogKepatuhan,
  deleteLogKepatuhan,
};
