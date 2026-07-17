const { body } = require('express-validator');

const inputKeluhanValidator = [
  body('tanggal')
    .notEmpty().withMessage('Tanggal wajib diisi')
    .isDate().withMessage('Format tanggal tidak valid (YYYY-MM-DD)'),
  body('keluhan')
    .notEmpty().withMessage('Keluhan wajib diisi')
    .isLength({ min: 5 }).withMessage('Keluhan minimal 5 karakter')
    .trim(),
];

module.exports = { inputKeluhanValidator };