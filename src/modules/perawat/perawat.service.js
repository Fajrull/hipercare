const bcrypt = require("bcryptjs");
const prisma = require("../../config/database");

const getAllPerawat = async () => {
  return await prisma.perawat.findMany({
    include: {
      user: { select: { id: true, username: true } },
      perawat_pasien: {
        include: { pasien: { select: { id: true, nama: true } } },
      },
    },
    orderBy: { created_at: "desc" },
  });
};

const getPerawatById = async (id) => {
  const perawat = await prisma.perawat.findUnique({
    where: { id: parseInt(id) },
    include: {
      user: { select: { id: true, username: true } },
      perawat_pasien: {
        include: { pasien: { select: { id: true, nama: true } } },
      },
    },
  });
  if (!perawat) throw new Error("Perawat tidak ditemukan");
  return perawat;
};

const createPerawat = async (data) => {
  const { nama, umur, jenis_kelamin, no_wa, username, password } = data;

  const existing = await prisma.users.findUnique({ where: { username } });
  if (existing) throw new Error(`Username "${username}" sudah digunakan`);

  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: { username, password: hashedPassword, role: "perawat" },
    });

    const perawat = await tx.perawat.create({
      data: { user_id: user.id, nama, umur, jenis_kelamin, no_wa },
    });

    return { ...perawat, username };
  });
};

const updatePerawat = async (id, data) => {
  const perawat = await prisma.perawat.findUnique({
    where: { id: parseInt(id) },
  });
  if (!perawat) throw new Error("Perawat tidak ditemukan");

  return await prisma.perawat.update({
    where: { id: parseInt(id) },
    data: {
      nama: data.nama,
      umur: data.umur,
      jenis_kelamin: data.jenis_kelamin,
      no_wa: data.no_wa,
    },
  });
};

const deletePerawat = async (id) => {
  const perawat = await prisma.perawat.findUnique({
    where: { id: parseInt(id) },
  });
  if (!perawat) throw new Error("Perawat tidak ditemukan");

  await prisma.users.delete({ where: { id: perawat.user_id } });
  return true;
};

// USER-04: Assign & Unassign perawat ke pasien
const assignPasien = async (perawatId, pasienId) => {
  const perawat = await prisma.perawat.findUnique({
    where: { id: parseInt(perawatId) },
  });
  if (!perawat) throw new Error("Perawat tidak ditemukan");

  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
  });
  if (!pasien) throw new Error("Pasien tidak ditemukan");

  // Cek apakah sudah di-assign
  const existing = await prisma.perawatPasien.findFirst({
    where: { perawat_id: parseInt(perawatId), pasien_id: parseInt(pasienId) },
  });
  if (existing) throw new Error("Pasien sudah di-assign ke perawat ini");

  return await prisma.perawatPasien.create({
    data: { perawat_id: parseInt(perawatId), pasien_id: parseInt(pasienId) },
  });
};

const unassignPasien = async (perawatId, pasienId) => {
  const relation = await prisma.perawatPasien.findFirst({
    where: { perawat_id: parseInt(perawatId), pasien_id: parseInt(pasienId) },
  });
  if (!relation) throw new Error("Relasi tidak ditemukan");

  await prisma.perawatPasien.delete({ where: { id: relation.id } });
  return true;
};

module.exports = {
  getAllPerawat,
  getPerawatById,
  createPerawat,
  updatePerawat,
  deletePerawat,
  assignPasien,
  unassignPasien,
};
