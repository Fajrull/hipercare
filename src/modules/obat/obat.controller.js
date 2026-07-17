const obatService = require("./obat.service");
const { success, error } = require("../../utils/response");

// OBAT-01: Master Obat
const getAllMasterObat = async (req, res) => {
  try {
    const data = await obatService.getAllMasterObat();
    return success(res, data, "Master obat berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
};

const getMasterObatById = async (req, res) => {
  try {
    const data = await obatService.getMasterObatById(req.params.id);
    return success(res, data);
  } catch (err) {
    return error(res, err.message, 404);
  }
};

const createMasterObat = async (req, res) => {
  try {
    const data = await obatService.createMasterObat(req.body);
    return success(res, data, "Master obat berhasil ditambahkan", 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const updateMasterObat = async (req, res) => {
  try {
    const data = await obatService.updateMasterObat(req.params.id, req.body);
    return success(res, data, "Master obat berhasil diupdate");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const deleteMasterObat = async (req, res) => {
  try {
    await obatService.deleteMasterObat(req.params.id);
    return success(res, null, "Master obat berhasil dihapus");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// OBAT-02: Tambah Obat Pasien
const tambahObatPasien = async (req, res) => {
  try {
    const data = await obatService.tambahObatPasien(
      req.params.pasienId,
      req.body,
    );
    return success(res, data, "Obat pasien berhasil ditambahkan", 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// OBAT-03: Get Obat Pasien
const getObatPasien = async (req, res) => {
  try {
    const data = await obatService.getObatPasien(req.params.pasienId);
    return success(res, data, "Daftar obat pasien berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
};

// OBAT-04: Update Obat Pasien
const updateObatPasien = async (req, res) => {
  try {
    const data = await obatService.updateObatPasien(
      req.params.obatId,
      req.params.pasienId,
      req.body,
    );
    return success(res, data, "Obat pasien berhasil diupdate");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// OBAT-05: Hapus Obat Pasien
const deleteObatPasien = async (req, res) => {
  try {
    await obatService.deleteObatPasien(req.params.obatId, req.params.pasienId);
    return success(res, null, "Obat pasien berhasil dihapus");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// OBAT-06 & OBAT-07: Konfirmasi Minum
const konfirmasiMinum = async (req, res) => {
  try {
    const data = await obatService.konfirmasiMinum(
      req.params.pasienId,
      req.body,
    );
    const message = data.stok_menipis
      ? `Konfirmasi berhasil. Stok ${data.nama_obat} tinggal ${data.stok_tersisa} tablet, segera tebus resep!`
      : "Konfirmasi minum obat berhasil";
    return success(res, data, message, 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// OBAT-08: Obat Belum Dikonfirmasi
const getObatBelumDikonfirmasi = async (req, res) => {
  try {
    const data = await obatService.getObatBelumDikonfirmasi(
      req.params.pasienId,
    );
    return success(res, data, "Data obat belum dikonfirmasi berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
};

// OBAT-09: Riwayat Kepatuhan
const getRiwayatKepatuhan = async (req, res) => {
  try {
    const { filter, start_date, end_date } = req.query;
    const data = await obatService.getRiwayatKepatuhan(
      req.params.pasienId,
      filter,
      start_date,
      end_date,
    );
    return success(res, data, "Riwayat kepatuhan berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
};

// OBAT-10: Grafik Kepatuhan
const getGrafikKepatuhan = async (req, res) => {
  try {
    const { filter, start_date, end_date } = req.query;
    const data = await obatService.getGrafikKepatuhan(
      req.params.pasienId,
      filter,
      start_date,
      end_date,
    );
    return success(res, data, "Grafik kepatuhan berhasil diambil");
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = {
  getAllMasterObat,
  getMasterObatById,
  createMasterObat,
  updateMasterObat,
  deleteMasterObat,
  tambahObatPasien,
  getObatPasien,
  updateObatPasien,
  deleteObatPasien,
  konfirmasiMinum,
  getObatBelumDikonfirmasi,
  getRiwayatKepatuhan,
  getGrafikKepatuhan,
};
