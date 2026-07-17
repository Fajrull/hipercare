const pasienService = require("./pasien.service");
const { success, error } = require("../../utils/response");

const getAllPasien = async (req, res) => {
  try {
    const data = await pasienService.getAllPasien(req.user.id, req.user.role);
    return success(res, data, "Daftar pasien berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
};

const getPasienById = async (req, res) => {
  try {
    const data = await pasienService.getPasienById(req.params.id);
    return success(res, data, "Detail pasien berhasil diambil");
  } catch (err) {
    return error(res, err.message, 404);
  }
};

// USER-01
const registrasiPasien = async (req, res) => {
  try {
    const data = await pasienService.registrasiPasien(req.body, req.user.id);
    return success(res, data, "Pasien berhasil diregistrasi", 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// USER-02
const registrasiKeluarga = async (req, res) => {
  try {
    const data = await pasienService.registrasiKeluarga(
      req.params.pasienId,
      req.body,
      req.user.id,
    );
    return success(res, data, "Akun keluarga berhasil dibuat", 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const updateKeluarga = async (req, res) => {
  try {
    const data = await pasienService.updateKeluarga(
      req.params.keluargaId,
      req.body,
      req.user.id,
      req.user.role,
    );
    return success(res, data, "Data keluarga berhasil diupdate");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const deleteKeluarga = async (req, res) => {
  try {
    await pasienService.deleteKeluarga(req.params.keluargaId);
    return success(res, null, "Akun keluarga berhasil dihapus");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// USER-06
const updatePasien = async (req, res) => {
  try {
    const data = await pasienService.updatePasien(req.params.id, req.body);
    return success(res, data, "Data pasien berhasil diupdate");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const getPasienByPerawatId = async (req, res) => {
  try {
    const data = await pasienService.getPasienByPerawatId(req.params.perawatId);
    return success(res, data, "Daftar pasien berhasil diambil");
  } catch (err) {
    return error(res, err.message, 404);
  }
};

module.exports = {
  getAllPasien,
  getPasienById,
  registrasiPasien,
  updatePasien,
  registrasiKeluarga,
  updateKeluarga,
  deleteKeluarga,
  getPasienByPerawatId,
};
