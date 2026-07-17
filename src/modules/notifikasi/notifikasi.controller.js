const notifService = require('./notifikasi.service');
const { success, error } = require('../../utils/response');

// NOTIF-08
const getRiwayatNotifikasi = async (req, res) => {
  try {
    const data = await notifService.getRiwayatNotifikasi(req.user.id);
    const belumDibaca = await notifService.countBelumDibaca(req.user.id);
    return success(res, { notifikasi: data, belum_dibaca: belumDibaca }, 'Notifikasi berhasil diambil');
  } catch (err) {
    return error(res, err.message);
  }
};

// NOTIF-09
const tandaiDibaca = async (req, res) => {
  try {
    const data = await notifService.tandaiDibaca(req.params.id, req.user.id);
    return success(res, data, 'Notifikasi ditandai sudah dibaca');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const tandaiSemuaDibaca = async (req, res) => {
  try {
    await notifService.tandaiSemuaDibaca(req.user.id);
    return success(res, null, 'Semua notifikasi ditandai sudah dibaca');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getRiwayatNotifikasi, tandaiDibaca, tandaiSemuaDibaca };