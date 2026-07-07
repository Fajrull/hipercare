const dietService = require("./diet-dash.service");
const { success, error } = require("../../utils/response");

// DIET-01
const getAllMasterDiet = async (req, res) => {
  try {
    const data = await dietService.getAllMasterDiet();
    return success(res, data, "Master diet berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
};

const getMasterDietById = async (req, res) => {
  try {
    const data = await dietService.getMasterDietById(req.params.id);
    return success(res, data);
  } catch (err) {
    return error(res, err.message, 404);
  }
};

const createMasterDiet = async (req, res) => {
  try {
    const data = await dietService.createMasterDiet(req.body);
    return success(res, data, "Master diet berhasil ditambahkan", 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const updateMasterDiet = async (req, res) => {
  try {
    const data = await dietService.updateMasterDiet(req.params.id, req.body);
    return success(res, data, "Master diet berhasil diupdate");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const deleteMasterDiet = async (req, res) => {
  try {
    await dietService.deleteMasterDiet(req.params.id);
    return success(res, null, "Master diet berhasil dihapus");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// DIET-02
const getRekomendasiMenu = async (req, res) => {
  try {
    const data = await dietService.getRekomendasiMenu();
    return success(res, data, "Rekomendasi menu berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
};

// DIET-03
const inputLogKonsumsi = async (req, res) => {
  try {
    const data = await dietService.inputLogKonsumsi(
      req.params.pasienId,
      req.body,
    );
    return success(res, data, "Log konsumsi berhasil disimpan", 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// DIET-04
const getLogKonsumsi = async (req, res) => {
  try {
    const data = await dietService.getLogKonsumsi(
      req.params.pasienId,
      req.query.tanggal,
    );
    return success(res, data, "Log konsumsi berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
};

// DIET-05
const updateLogKonsumsi = async (req, res) => {
  try {
    const data = await dietService.updateLogKonsumsi(
      req.params.logId,
      req.params.pasienId,
      req.body,
    );
    return success(res, data, "Log konsumsi berhasil diupdate");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const deleteLogKonsumsi = async (req, res) => {
  try {
    await dietService.deleteLogKonsumsi(req.params.logId, req.params.pasienId);
    return success(res, null, "Log konsumsi berhasil dihapus");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

module.exports = {
  getAllMasterDiet,
  getMasterDietById,
  createMasterDiet,
  updateMasterDiet,
  deleteMasterDiet,
  getRekomendasiMenu,
  inputLogKonsumsi,
  getLogKonsumsi,
  updateLogKonsumsi,
  deleteLogKonsumsi,
};
