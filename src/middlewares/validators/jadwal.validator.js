const { body } = require('express-validator');

const tambahJadwalValidator = [
  body('tanggal')
    .notEmpty().withMessage('Tanggal wajib diisi')
    .isDate().withMessage('Format tanggal tidak valid (YYYY-MM-DD)'),
  body('jam')
    .notEmpty().withMessage('Jam wajib diisi')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Format jam tidak valid (HH:mm)'),
];

module.exports = { tambahJadwalValidator };