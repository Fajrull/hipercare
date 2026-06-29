const authService = require('./auth.service');
const { success, error } = require('../../utils/response');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return error(res, 'Username dan password wajib diisi', 400);
    }

    const data = await authService.login(username, password);
    return success(res, data, 'Login berhasil');
  } catch (err) {
    return error(res, err.message, 401);
  }
};

const me = async (req, res) => {
  try {
    const data = await authService.me(req.user.id);
    return success(res, data);
  } catch (err) {
    return error(res, err.message, 404);
  }
};

const updateDeviceId = async (req, res) => {
  try {
    const { device_id } = req.body;

    if (!device_id) {
      return error(res, 'device_id wajib diisi', 400);
    }

    const data = await authService.updateDeviceId(req.user.id, device_id);
    return success(res, data, 'Device ID berhasil diupdate');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { login, me, updateDeviceId };
