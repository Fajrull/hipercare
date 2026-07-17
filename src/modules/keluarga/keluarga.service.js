const prisma = require('../../config/database');

const updateProfilKeluarga = async (userId, data) => {
  const keluarga = await prisma.keluarga.findUnique({
    where: { user_id: parseInt(userId) },
  });
  if (!keluarga) throw new Error('Data keluarga tidak ditemukan');

  return await prisma.keluarga.update({
    where: { id: keluarga.id },
    data: {
      nama: data.nama,
      hubungan: data.hubungan,
      pendidikan: data.pendidikan,
      pekerjaan: data.pekerjaan,
      umur: data.umur,
    },
  });
};

module.exports = { updateProfilKeluarga };