const tdService = require("./tekanan-darah.service");
const { sendMulticastNotification } = require("../../utils/fcm");
const prisma = require("../../config/database");
const { success, error } = require("../../utils/response");

// TD-01 + TD-02 + TD-03
const inputTekananDarah = async (req, res) => {
  try {
    const data = await tdService.inputTekananDarah(
      req.params.pasienId,
      req.body,
      req.user.id,
      req.user.role,
    );

    if (data.perlu_notifikasi) {
      const deviceIds = await tdService.getNotifTargets(req.params.pasienId);

      if (deviceIds.length > 0) {
        await sendMulticastNotification(
          deviceIds,
          "🚨 Peringatan Tekanan Darah",
          `Tekanan darah pasien terdeteksi ${data.klasifikasi} (${data.sistolik}/${data.diastolik} mmHg). Segera periksa kondisi pasien!`,
          { tipe: "td_kritis", pasien_id: String(req.params.pasienId) },
        );
      }

      const pasien = await prisma.pasien.findUnique({
        where: { id: parseInt(req.params.pasienId) },
        include: {
          keluarga: { select: { user_id: true } },
          perawat_pasien: {
            include: { perawat: { select: { user_id: true } } },
          },
        },
      });

      const targetUserIds = [
        ...pasien.keluarga.map((k) => k.user_id),
        ...pasien.perawat_pasien.map((pp) => pp.perawat.user_id),
      ];

      await prisma.notifikasi.createMany({
        data: targetUserIds.map((user_id) => ({
          user_id,
          judul: "🚨 Peringatan Tekanan Darah",
          pesan: `Tekanan darah pasien terdeteksi ${data.klasifikasi} (${data.sistolik}/${data.diastolik} mmHg).`,
          tipe: "td_kritis",
        })),
      });
    }

    const message = data.is_emergency
      ? `Tekanan darah tercatat. PERINGATAN: Klasifikasi ${data.klasifikasi}, notifikasi darurat telah dikirim!`
      : "Tekanan darah berhasil dicatat";

    return success(res, data, message, 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// TD-04
const getRiwayatTD = async (req, res) => {
  try {
    const data = await tdService.getRiwayatTD(
      req.params.pasienId,
      req.query.filter,
    );
    return success(res, data, "Riwayat tekanan darah berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
};

// TD-05
const getGrafikTD = async (req, res) => {
  try {
    const data = await tdService.getGrafikTD(
      req.params.pasienId,
      req.query.filter,
    );
    return success(res, data, "Grafik tekanan darah berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
};

// TD-06
const updateTekananDarah = async (req, res) => {
  try {
    const data = await tdService.updateTekananDarah(
      req.params.id,
      req.params.pasienId,
      req.body,
    );
    return success(res, data, "Data tekanan darah berhasil diupdate");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const deleteTekananDarah = async (req, res) => {
  try {
    await tdService.deleteTekananDarah(req.params.id, req.params.pasienId);
    return success(res, null, "Data tekanan darah berhasil dihapus");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

module.exports = {
  inputTekananDarah,
  getRiwayatTD,
  getGrafikTD,
  updateTekananDarah,
  deleteTekananDarah,
};
