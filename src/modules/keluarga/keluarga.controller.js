const keluargaService = require('./keluarga.service');
const { success, error } = require('../../utils/response');

const updateProfilKeluarga = async (req, res) => {
  try {
    const data = await keluargaService.updateProfilKeluarga(req.user.id, req.body);
    return success(res, data, 'Profil keluarga berhasil diupdate');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

module.exports = { updateProfilKeluarga };