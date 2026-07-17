const { body } = require('express-validator');

const registrasiPasienValidator = [
  body('nama')
    .notEmpty().withMessage('Nama wajib diisi')
    .isString().withMessage('Nama harus berupa string')
    .trim(),
  body('jenis_kelamin')
    .optional()
    .isIn(['L', 'P']).withMessage('Jenis kelamin harus L atau P'),
  body('umur')
    .optional()
    .isInt({ min: 1, max: 120 }).withMessage('Umur tidak valid'),
  body('username')
    .if(body('auto_generate').not().equals('true'))
    .notEmpty().withMessage('Username wajib diisi jika auto_generate false'),
  body('password')
    .if(body('auto_generate').not().equals('true'))
    .notEmpty().withMessage('Password wajib diisi jika auto_generate false')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
];

const registrasiKeluargaValidator = [
  body('nama')
    .notEmpty().withMessage('Nama wajib diisi')
    .trim(),
  body('hubungan')
    .notEmpty().withMessage('Hubungan wajib diisi')
    .isIn(['Suami', 'Istri', 'Anak', 'Lainnya'])
    .withMessage('Hubungan harus Suami, Istri, Anak, atau Lainnya'),
  body('umur')
    .optional()
    .isInt({ min: 1, max: 120 }).withMessage('Umur tidak valid'),
];

const updatePasienValidator = [
  body('nama')
    .optional()
    .notEmpty().withMessage('Nama tidak boleh kosong')
    .trim(),
  body('jenis_kelamin')
    .optional()
    .isIn(['L', 'P']).withMessage('Jenis kelamin harus L atau P'),
  body('umur')
    .optional()
    .isInt({ min: 1, max: 120 }).withMessage('Umur tidak valid'),
];

module.exports = {
  registrasiPasienValidator,
  registrasiKeluargaValidator,
  updatePasienValidator,
};