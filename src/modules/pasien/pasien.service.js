const bcrypt = require("bcryptjs");
const prisma = require("../../config/database");

// =============================================
// Helper: Auto-generate username & password
// =============================================
const generateUsername = (nama) => {
  const base = nama.toLowerCase().replace(/\s+/g, "").slice(0, 8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${base}${random}`;
};

const generatePassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: 10 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
};

// =============================================
// USER-01: Registrasi Pasien (by Perawat)
// =============================================
const registrasiPasien = async (data, perawatUserId) => {
  const {
    nama,
    umur,
    jenis_kelamin,
    pekerjaan,
    pendidikan_terakhir,
    lama_menderita_ht,
    alamat,
    username: inputUsername,
    password: inputPassword,
    auto_generate = false,
  } = data;

  // Tentukan username & password
  const username = auto_generate ? generateUsername(nama) : inputUsername;
  const plainPassword = auto_generate ? generatePassword() : inputPassword;

  if (!username || !plainPassword) {
    throw new Error(
      "Username dan password wajib diisi atau gunakan auto_generate",
    );
  }

  // Cek username sudah ada
  const existing = await prisma.users.findUnique({ where: { username } });
  if (existing) throw new Error(`Username "${username}" sudah digunakan`);

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Buat user & pasien dalam 1 transaksi
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: { username, password: hashedPassword, role: "pasien" },
    });

    const pasien = await tx.pasien.create({
      data: {
        user_id: user.id,
        nama,
        umur,
        jenis_kelamin,
        pekerjaan,
        pendidikan_terakhir,
        lama_menderita_ht,
        alamat,
      },
    });

    // Auto assign perawat yang registrasi ke pasien baru
    const perawat = await tx.perawat.findUnique({
      where: { user_id: perawatUserId },
    });
    if (perawat) {
      await tx.perawatPasien.create({
        data: { perawat_id: perawat.id, pasien_id: pasien.id },
      });
    }

    return { user, pasien, plainPassword };
  });

  return {
    pasien_id: result.pasien.id,
    user_id: result.user.id,
    nama,
    username,
    // Kembalikan plain password hanya saat registrasi agar bisa diberikan ke pasien
    password: result.plainPassword,
    auto_generate,
  };
};

// =============================================
// USER-05: Get Profil Pasien
// =============================================
const getPasienById = async (pasienId) => {
  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
    include: {
      user: {
        select: { id: true, username: true, role: true, device_id: true },
      },
      keluarga: {
        include: {
          user: { select: { id: true, username: true } },
        },
      },
      perawat_pasien: {
        include: {
          perawat: { select: { id: true, nama: true, no_wa: true } },
        },
      },
    },
  });

  if (!pasien) throw new Error("Pasien tidak ditemukan");
  return pasien;
};

// =============================================
// Get All Pasien (untuk perawat & admin)
// =============================================
const getAllPasien = async (perawatUserId, role) => {
  // Admin bisa lihat semua pasien
  if (role === "admin") {
    return await prisma.pasien.findMany({
      include: {
        user: { select: { id: true, username: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }

  // Perawat hanya lihat pasien yang di-assign ke dia
  const perawat = await prisma.perawat.findUnique({
    where: { user_id: perawatUserId },
  });
  if (!perawat) throw new Error("Data perawat tidak ditemukan");

  const relations = await prisma.perawatPasien.findMany({
    where: { perawat_id: perawat.id },
    include: {
      pasien: {
        include: {
          user: { select: { id: true, username: true } },
        },
      },
    },
  });

  return relations.map((r) => r.pasien);
};

// =============================================
// USER-06: Update Profil Pasien
// =============================================
const updatePasien = async (pasienId, data) => {
  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
  });
  if (!pasien) throw new Error("Pasien tidak ditemukan");

  const updated = await prisma.pasien.update({
    where: { id: parseInt(pasienId) },
    data: {
      nama: data.nama,
      umur: data.umur,
      jenis_kelamin: data.jenis_kelamin,
      pekerjaan: data.pekerjaan,
      pendidikan_terakhir: data.pendidikan_terakhir,
      lama_menderita_ht: data.lama_menderita_ht,
      alamat: data.alamat,
    },
  });

  return updated;
};

// =============================================
// USER-02: Registrasi Keluarga (by Pasien)
// =============================================
const registrasiKeluarga = async (pasienId, data, requesterUserId) => {
  const { nama, hubungan, pendidikan, pekerjaan, umur } = data;

  // Pastikan pasien yang request adalah pasien yang bersangkutan
  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
  });
  if (!pasien) throw new Error("Pasien tidak ditemukan");
  if (pasien.user_id !== requesterUserId) throw new Error("Akses ditolak");

  // Auto-generate username & password untuk keluarga
  const username = generateUsername(nama);
  const plainPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: { username, password: hashedPassword, role: "keluarga" },
    });

    const keluarga = await tx.keluarga.create({
      data: {
        user_id: user.id,
        pasien_id: parseInt(pasienId),
        nama,
        hubungan,
        pendidikan,
        pekerjaan,
        umur,
      },
    });

    return { user, keluarga };
  });

  return {
    keluarga_id: result.keluarga.id,
    nama,
    hubungan,
    username,
    // Kembalikan plain password agar bisa diberikan ke anggota keluarga
    password: plainPassword,
  };
};

// Update & Delete Keluarga
const updateKeluarga = async (keluargaId, data) => {
  const keluarga = await prisma.keluarga.findUnique({
    where: { id: parseInt(keluargaId) },
  });
  if (!keluarga) throw new Error("Data keluarga tidak ditemukan");

  return await prisma.keluarga.update({
    where: { id: parseInt(keluargaId) },
    data: {
      nama: data.nama,
      hubungan: data.hubungan,
      pendidikan: data.pendidikan,
      pekerjaan: data.pekerjaan,
      umur: data.umur,
    },
  });
};

const deleteKeluarga = async (keluargaId) => {
  const keluarga = await prisma.keluarga.findUnique({
    where: { id: parseInt(keluargaId) },
  });
  if (!keluarga) throw new Error("Data keluarga tidak ditemukan");

  // Hapus user keluarga sekaligus (cascade)
  await prisma.users.delete({ where: { id: keluarga.user_id } });
  return true;
};

module.exports = {
  registrasiPasien,
  getPasienById,
  getAllPasien,
  updatePasien,
  registrasiKeluarga,
  updateKeluarga,
  deleteKeluarga,
};
