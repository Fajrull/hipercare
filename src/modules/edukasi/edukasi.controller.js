const edukasiService = require("./edukasi.service");
const { success, error } = require("../../utils/response");

// EDU-02
const getAllEdukasi = async (req, res) => {
  try {
    const data = await edukasiService.getAllEdukasi(req.query.kategori);
    return success(res, data, "Materi edukasi berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
};

// EDU-02 (grouped per topik)
const getEdukasiGrouped = async (req, res) => {
  try {
    const data = await edukasiService.getEdukasiGrouped();
    return success(res, data, "Materi edukasi berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
};

// EDU-03
const getEdukasiById = async (req, res) => {
  try {
    const data = await edukasiService.getEdukasiById(req.params.id);
    return success(res, data);
  } catch (err) {
    return error(res, err.message, 404);
  }
};

// EDU-01
const createEdukasi = async (req, res) => {
  try {
    const data = await edukasiService.createEdukasi(req.body);
    return success(res, data, "Materi edukasi berhasil ditambahkan", 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const updateEdukasi = async (req, res) => {
  try {
    const data = await edukasiService.updateEdukasi(req.params.id, req.body);
    return success(res, data, "Materi edukasi berhasil diupdate");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const deleteEdukasi = async (req, res) => {
  try {
    await edukasiService.deleteEdukasi(req.params.id);
    return success(res, null, "Materi edukasi berhasil dihapus");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

module.exports = {
  getAllEdukasi,
  getEdukasiGrouped,
  getEdukasiById,
  createEdukasi,
  updateEdukasi,
  deleteEdukasi,
};
