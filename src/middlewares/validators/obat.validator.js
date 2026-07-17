const { body } = require('express-validator');

const tambahObatPasienValidator = [
  body('master_obat_id')
    .notEmpty().withMessage('master_obat_id wajib diisi')
    .isInt({ min: 1 }).withMessage('master_obat_id harus berupa angka'),
  body('jumlah_stok')
    .notEmpty().withMessage('Jumlah stok wajib diisi')
    .isInt({ min: 1 }).withMessage('Jumlah stok minimal 1'),
  body('kategori_waktu')
    .notEmpty().withMessage('Kategori waktu wajib diisi')
    .isIn(['Pagi', 'Siang', 'Malam']).withMessage('Kategori waktu harus Pagi, Siang, atau Malam'),
];

const konfirmasiMinumValidator = [
  body('obat_pasien_id')
    .notEmpty().withMessage('obat_pasien_id wajib diisi')
    .isInt({ min: 1 }).withMessage('obat_pasien_id harus berupa angka'),
  body('tanggal')
    .notEmpty().withMessage('Tanggal wajib diisi')
    .isDate().withMessage('Format tanggal tidak valid (YYYY-MM-DD)'),
  body('kategori_waktu')
    .notEmpty().withMessage('Kategori waktu wajib diisi')
    .isIn(['Pagi', 'Siang', 'Malam']).withMessage('Kategori waktu harus Pagi, Siang, atau Malam'),
  body('status')
    .notEmpty().withMessage('Status wajib diisi')
    .isIn(['diminum', 'tidak_diminum']).withMessage('Status harus diminum atau tidak_diminum'),
  body('alasan')
    .if(body('status').equals('tidak_diminum'))
    .notEmpty().withMessage('Alasan wajib diisi jika status tidak_diminum'),
];

const masterObatValidator = [
  body('nama_obat')
    .notEmpty().withMessage('Nama obat wajib diisi')
    .trim(),
];

module.exports = {
  tambahObatPasienValidator,
  konfirmasiMinumValidator,
  masterObatValidator,
};