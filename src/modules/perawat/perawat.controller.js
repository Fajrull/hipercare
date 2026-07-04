const perawatService = require("./perawat.service");
const { success, error } = require("../../utils/response");

const getAllPerawat = async (req, res) => {
  try {
    const data = await perawatService.getAllPerawat();
    return success(res, data, "Daftar perawat berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
};

const getPerawatById = async (req, res) => {
  try {
    const data = await perawatService.getPerawatById(req.params.id);
    return success(res, data);
  } catch (err) {
    return error(res, err.message, 404);
  }
};

const createPerawat = async (req, res) => {
  try {
    const data = await perawatService.createPerawat(req.body);
    return success(res, data, "Perawat berhasil ditambahkan", 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const updatePerawat = async (req, res) => {
  try {
    const data = await perawatService.updatePerawat(req.params.id, req.body);
    return success(res, data, "Data perawat berhasil diupdate");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const deletePerawat = async (req, res) => {
  try {
    await perawatService.deletePerawat(req.params.id);
    return success(res, null, "Perawat berhasil dihapus");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const assignPasien = async (req, res) => {
  try {
    const data = await perawatService.assignPasien(
      req.params.perawatId,
      req.body.pasien_id,
    );
    return success(res, data, "Pasien berhasil di-assign ke perawat", 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const unassignPasien = async (req, res) => {
  try {
    await perawatService.unassignPasien(
      req.params.perawatId,
      req.params.pasienId,
    );
    return success(res, null, "Pasien berhasil di-unassign dari perawat");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// Update exports
module.exports = {
  getAllPerawat,
  getPerawatById,
  createPerawat,
  updatePerawat,
  deletePerawat,
  assignPasien,
  unassignPasien,
};
