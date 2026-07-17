const badgeService = require('./badge.service');
const { success, error } = require('../../utils/response');

// BADGE-01
const getAllBadge = async (req, res) => {
  try {
    const data = await badgeService.getAllBadge();
    return success(res, data, 'Daftar badge berhasil diambil');
  } catch (err) {
    return error(res, err.message);
  }
};

const getBadgeById = async (req, res) => {
  try {
    const data = await badgeService.getBadgeById(req.params.id);
    return success(res, data);
  } catch (err) {
    return error(res, err.message, 404);
  }
};

const createBadge = async (req, res) => {
  try {
    const data = await badgeService.createBadge(req.body);
    return success(res, data, 'Badge berhasil ditambahkan', 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const updateBadge = async (req, res) => {
  try {
    const data = await badgeService.updateBadge(req.params.id, req.body);
    return success(res, data, 'Badge berhasil diupdate');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const deleteBadge = async (req, res) => {
  try {
    await badgeService.deleteBadge(req.params.id);
    return success(res, null, 'Badge berhasil dihapus');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// BADGE-02
const getBadgePasien = async (req, res) => {
  try {
    const data = await badgeService.getBadgePasien(req.params.pasienId);
    return success(res, data, 'Badge pasien berhasil diambil');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = {
  getAllBadge,
  getBadgeById,
  createBadge,
  updateBadge,
  deleteBadge,
  getBadgePasien,
};