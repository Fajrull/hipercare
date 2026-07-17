const { body } = require('express-validator');

const loginValidator = [
  body('username')
    .notEmpty().withMessage('Username wajib diisi')
    .isString().withMessage('Username harus berupa string')
    .trim(),
  body('password')
    .notEmpty().withMessage('Password wajib diisi')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
];

const updateDeviceValidator = [
  body('device_id')
    .notEmpty().withMessage('device_id wajib diisi')
    .isString().withMessage('device_id harus berupa string'),
];

module.exports = { loginValidator, updateDeviceValidator };