const jadwalService = require("./jadwal-kontrol.service");
const { sendMulticastNotification } = require("../../utils/fcm");
const prisma = require("../../config/database");
const { success, error } = require("../../utils/response");

// KONTROL-01
const tambahJadwal = async (req, res) => {
  try {
    const { jadwal, notifTargets } = await jadwalService.tambahJadwal(
      req.params.pasienId,
      req.body,
    );

    // Kirim notifikasi ke pasien, keluarga, dan perawat
    const deviceIds = notifTargets.map((t) => t.device_id).filter(Boolean);
    if (deviceIds.length > 0) {
      await sendMulticastNotification(
        deviceIds,
        "📅 Jadwal Kontrol Baru",
        `Jadwal kontrol ditambahkan pada ${new Date(jadwal.tanggal).toLocaleDateString("id-ID")}${jadwal.lokasi_faskes ? ` di ${jadwal.lokasi_faskes}` : ""}`,
        { tipe: "pengingat_kontrol", jadwal_id: String(jadwal.id) },
      );
    }

    // Simpan ke tabel notifikasi
    if (notifTargets.length > 0) {
      await prisma.notifikasi.createMany({
        data: notifTargets.map((t) => ({
          user_id: t.user_id,
          judul: "📅 Jadwal Kontrol Baru",
          pesan: `Jadwal kontrol pada ${new Date(jadwal.tanggal).toLocaleDateString("id-ID")}${jadwal.lokasi_faskes ? ` di ${jadwal.lokasi_faskes}` : ""}`,
          tipe: "pengingat_kontrol",
        })),
      });
    }

    return success(res, jadwal, "Jadwal kontrol berhasil ditambahkan", 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// KONTROL-02
const getJadwal = async (req, res) => {
  try {
    const data = await jadwalService.getJadwal(req.params.pasienId);
    return success(res, data, "Jadwal kontrol berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
};

// KONTROL-03
const deleteJadwal = async (req, res) => {
  try {
    await jadwalService.deleteJadwal(req.params.jadwalId, req.params.pasienId);
    return success(res, null, "Jadwal kontrol berhasil dihapus");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const updateJadwal = async (req, res) => {
  try {
    const data = await jadwalService.updateJadwal(
      req.params.jadwalId,
      req.params.pasienId,
      req.body,
    );
    return success(res, data, "Jadwal kontrol berhasil diupdate");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

module.exports = { tambahJadwal, getJadwal, deleteJadwal, updateJadwal };
