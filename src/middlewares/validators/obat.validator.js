const { body } = require("express-validator");
const { lowerCase } = require("../../utils/sanitizer");

const tambahObatPasienValidator = [
  body("master_obat_id")
    .notEmpty()
    .withMessage("master_obat_id wajib diisi")
    .isInt({ min: 1 })
    .withMessage("master_obat_id harus berupa angka"),
  body("jumlah_stok")
    .notEmpty()
    .withMessage("Jumlah stok wajib diisi")
    .isInt({ min: 1 })
    .withMessage("Jumlah stok minimal 1"),
  body("kategori_waktu")
    .notEmpty()
    .withMessage("Kategori waktu wajib diisi")
    .custom((value) => {
      const validWaktu = ["Pagi", "Siang", "Malam"];
      const waktuList = Array.isArray(value) ? value : [value];
      const normalized = waktuList.map(
        (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
      );
      for (const waktu of normalized) {
        if (!validWaktu.includes(waktu)) {
          throw new Error(
            `kategori_waktu "${waktu}" tidak valid. Harus Pagi, Siang, atau Malam`,
          );
        }
      }
      return true;
    }),
];

const konfirmasiMinumValidator = [
  body("obat_pasien_id")
    .notEmpty()
    .withMessage("obat_pasien_id wajib diisi")
    .isInt({ min: 1 })
    .withMessage("obat_pasien_id harus berupa angka"),
  body("tanggal")
    .notEmpty()
    .withMessage("Tanggal wajib diisi")
    .isDate()
    .withMessage("Format tanggal tidak valid (YYYY-MM-DD)"),
  body("kategori_waktu")
    .notEmpty()
    .withMessage("Kategori waktu wajib diisi")
    .custom((value) => {
      const validWaktu = ["Pagi", "Siang", "Malam"];
      const normalized =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      if (!validWaktu.includes(normalized)) {
        throw new Error("Kategori waktu harus Pagi, Siang, atau Malam");
      }
      return true;
    }),
  body("status")
    .notEmpty()
    .withMessage("Status wajib diisi")
    .customSanitizer(lowerCase)
    .isIn(["diminum", "tidak_diminum"])
    .withMessage("Status harus diminum atau tidak_diminum"),
  body("alasan")
    .if(body("status").equals("tidak_diminum"))
    .notEmpty()
    .withMessage("Alasan wajib diisi jika status tidak_diminum"),
];

const masterObatValidator = [
  body("nama_obat").notEmpty().withMessage("Nama obat wajib diisi").trim(),
];

module.exports = {
  tambahObatPasienValidator,
  konfirmasiMinumValidator,
  masterObatValidator,
};
