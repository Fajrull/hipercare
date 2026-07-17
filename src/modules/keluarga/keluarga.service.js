const prisma = require('../../config/database');
const bcrypt = require('bcryptjs');

const updateProfilKeluarga = async (userId, data) => {
  const keluarga = await prisma.keluarga.findUnique({
    where: { user_id: parseInt(userId) },
  });
  if (!keluarga) throw new Error('Data keluarga tidak ditemukan');

  return await prisma.$transaction(async (tx) => {
    // Update data keluarga
    const updatedKeluarga = await tx.keluarga.update({
      where: { id: keluarga.id },
      data: {
        nama: data.nama,
        hubungan: data.hubungan,
        pendidikan: data.pendidikan,
        pekerjaan: data.pekerjaan,
        umur: data.umur,
      },
    });

    // Update password jika disertakan
    if (data.password) {
      if (data.password.length < 6) {
        throw new Error('Password minimal 6 karakter');
      }
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Update hashed password di tabel users
      await tx.users.update({
        where: { id: parseInt(userId) },
        data: { password: hashedPassword },
      });

      // Sync plain_password di tabel keluarga
      await tx.keluarga.update({
        where: { id: keluarga.id },
        data: { plain_password: data.password },
      });
    }

    return updatedKeluarga;
  });
};

module.exports = { updateProfilKeluarga };

module.exports = { updateProfilKeluarga };