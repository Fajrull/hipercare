const { body } = require('express-validator');

const inputTDValidator = [
  body('tanggal')
    .notEmpty().withMessage('Tanggal wajib diisi')
    .isDate().withMessage('Format tanggal tidak valid (YYYY-MM-DD)'),
  body('sistolik')
    .notEmpty().withMessage('Sistolik wajib diisi')
    .isInt({ min: 50, max: 300 }).withMessage('Nilai sistolik tidak valid (50-300)'),
  body('diastolik')
    .notEmpty().withMessage('Diastolik wajib diisi')
    .isInt({ min: 30, max: 200 }).withMessage('Nilai diastolik tidak valid (30-200)'),
];

module.exports = { inputTDValidator };