const keluhanService = require("./keluhan.service");
const { sendMulticastNotification } = require("../../utils/fcm");
const prisma = require("../../config/database");
const { success, error } = require("../../utils/response");

// KLINIS-01
const inputKeluhan = async (req, res) => {
  try {
    const { keluhan_record, perawatTargets } =
      await keluhanService.inputKeluhan(
        req.params.pasienId,
        req.body,
        req.user.id,
        req.user.role,
      );

    // Kirim notifikasi FCM ke semua perawat yang handle pasien ini
    const deviceIds = perawatTargets.map((p) => p.device_id).filter(Boolean);
    if (deviceIds.length > 0) {
      await sendMulticastNotification(
        deviceIds,
        "🩺 Keluhan Pasien Baru",
        `Pasien melaporkan keluhan baru: "${req.body.keluhan.substring(0, 50)}${req.body.keluhan.length > 50 ? "..." : ""}"`,
        { tipe: "keluhan_baru", pasien_id: String(req.params.pasienId) },
      );
    }

    // Simpan riwayat notifikasi ke DB untuk setiap perawat
    if (perawatTargets.length > 0) {
      await prisma.notifikasi.createMany({
        data: perawatTargets.map((p) => ({
          user_id: p.user_id,
          judul: "🩺 Keluhan Pasien Baru",
          pesan: `Pasien melaporkan keluhan: "${req.body.keluhan}"`,
          tipe: "keluhan_baru",
        })),
      });
    }

    return success(
      res,
      keluhan_record,
      "Keluhan berhasil disimpan dan notifikasi dikirim ke perawat",
      201,
    );
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// KLINIS-02
const getRiwayatKeluhan = async (req, res) => {
  try {
    const data = await keluhanService.getRiwayatKeluhan(req.params.pasienId);
    return success(res, data, "Riwayat keluhan berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
};

// KLINIS-03
const updateKeluhan = async (req, res) => {
  try {
    const data = await keluhanService.updateKeluhan(
      req.params.keluhanId,
      req.params.pasienId,
      req.body,
      req.user.id,
      req.user.role,
    );
    return success(res, data, "Keluhan berhasil diupdate");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const deleteKeluhan = async (req, res) => {
  try {
    await keluhanService.deleteKeluhan(
      req.params.keluhanId,
      req.params.pasienId,
      req.user.id,
      req.user.role,
    );
    return success(res, null, "Keluhan berhasil dihapus");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

module.exports = {
  inputKeluhan,
  getRiwayatKeluhan,
  updateKeluhan,
  deleteKeluhan,
};
