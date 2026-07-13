const prisma = require("../../config/database");

// =============================================
// EDU-01: CRUD Materi Edukasi
// =============================================
const getAllEdukasi = async (kategori) => {
  const where = {};
  if (kategori) {
    const validKategori = ["Video", "Materi"];
    if (!validKategori.includes(kategori)) {
      throw new Error("kategori harus Video atau Materi");
    }
    where.kategori = kategori;
  }

  return await prisma.masterEdukasi.findMany({
    where,
    orderBy: [{ topik: "asc" }, { created_at: "desc" }],
  });
};

const getEdukasiById = async (id) => {
  const edukasi = await prisma.masterEdukasi.findUnique({
    where: { id: parseInt(id) },
  });
  if (!edukasi) throw new Error("Materi edukasi tidak ditemukan");
  return edukasi;
};

const createEdukasi = async (data) => {
  const { judul, kategori, konten, topik } = data;

  if (!judul || !kategori) {
    throw new Error("Judul dan kategori wajib diisi");
  }

  const validKategori = ["Video", "Materi"];
  if (!validKategori.includes(kategori)) {
    throw new Error("Kategori harus Video atau Materi");
  }

  const validTopik = [
    "Mengenal HT",
    "FCN",
    "Diet DASH",
    "Kepatuhan Obat",
    "Kontrol TD",
  ];
  if (topik && !validTopik.includes(topik)) {
    throw new Error(`Topik harus salah satu dari: ${validTopik.join(", ")}`);
  }

  // Validasi konten sesuai kategori
  if (
    kategori === "Video" &&
    konten &&
    !konten.includes("youtube.com") &&
    !konten.includes("youtu.be")
  ) {
    throw new Error("Konten Video harus berupa URL YouTube");
  }

  return await prisma.masterEdukasi.create({
    data: { judul, kategori, konten, topik },
  });
};

const updateEdukasi = async (id, data) => {
  const edukasi = await prisma.masterEdukasi.findUnique({
    where: { id: parseInt(id) },
  });
  if (!edukasi) throw new Error("Materi edukasi tidak ditemukan");

  if (data.kategori) {
    const validKategori = ["Video", "Materi"];
    if (!validKategori.includes(data.kategori)) {
      throw new Error("Kategori harus Video atau Materi");
    }
  }

  if (data.topik) {
    const validTopik = [
      "Mengenal HT",
      "FCN",
      "Diet DASH",
      "Kepatuhan Obat",
      "Kontrol TD",
    ];
    if (!validTopik.includes(data.topik)) {
      throw new Error(`Topik harus salah satu dari: ${validTopik.join(", ")}`);
    }
  }

  return await prisma.masterEdukasi.update({
    where: { id: parseInt(id) },
    data: {
      judul: data.judul,
      kategori: data.kategori,
      konten: data.konten,
      topik: data.topik,
    },
  });
};

const deleteEdukasi = async (id) => {
  const edukasi = await prisma.masterEdukasi.findUnique({
    where: { id: parseInt(id) },
  });
  if (!edukasi) throw new Error("Materi edukasi tidak ditemukan");

  await prisma.masterEdukasi.delete({ where: { id: parseInt(id) } });
  return true;
};

// =============================================
// EDU-02: Get Semua Materi (dengan grouping per topik)
// =============================================
const getEdukasiGrouped = async () => {
  const semua = await prisma.masterEdukasi.findMany({
    orderBy: [{ topik: "asc" }, { kategori: "asc" }],
  });

  // Group by topik
  const grouped = {};
  for (const item of semua) {
    const key = item.topik || "Umum";
    if (!grouped[key]) grouped[key] = { topik: key, video: [], materi: [] };

    if (item.kategori === "Video") grouped[key].video.push(item);
    else grouped[key].materi.push(item);
  }

  return {
    semua,
    grouped: Object.values(grouped),
  };
};

module.exports = {
  getAllEdukasi,
  getEdukasiById,
  createEdukasi,
  updateEdukasi,
  deleteEdukasi,
  getEdukasiGrouped,
};
