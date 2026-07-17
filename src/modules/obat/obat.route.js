const express = require("express");
const router = express.Router();
const obatController = require("./obat.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const {
  tambahObatPasienValidator,
  konfirmasiMinumValidator,
  masterObatValidator,
} = require("../../middlewares/validators/obat.validator");

// Update route yang sudah ada
router.post(
  "/master",
  authMiddleware,
  roleMiddleware("admin", "perawat"),
  masterObatValidator,
  validate,
  obatController.createMasterObat,
);
router.post(
  "/pasien/:pasienId",
  authMiddleware,
  roleMiddleware("pasien"),
  tambahObatPasienValidator,
  validate,
  obatController.tambahObatPasien,
);
router.post(
  "/kepatuhan/:pasienId/konfirmasi",
  authMiddleware,
  roleMiddleware("pasien"),
  konfirmasiMinumValidator,
  validate,
  obatController.konfirmasiMinum,
);

// =============================================
// MASTER OBAT (OBAT-01)
// =============================================

/**
 * @swagger
 * /api/obat/master:
 *   get:
 *     summary: Ambil semua master obat
 *     description: Diakses semua role untuk keperluan select obat
 *     tags: [Obat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar master obat berhasil diambil
 */
router.get("/master", authMiddleware, obatController.getAllMasterObat);

/**
 * @swagger
 * /api/obat/master/{id}:
 *   get:
 *     summary: Detail master obat
 *     tags: [Obat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail master obat
 *       404:
 *         description: Master obat tidak ditemukan
 */
router.get("/master/:id", authMiddleware, obatController.getMasterObatById);

/**
 * @swagger
 * /api/obat/master:
 *   post:
 *     summary: Tambah master obat baru
 *     description: Hanya admin dan perawat
 *     tags: [Obat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama_obat
 *             properties:
 *               nama_obat:
 *                 type: string
 *                 example: Amlodipine
 *               dosis:
 *                 type: string
 *                 example: 5mg
 *     responses:
 *       201:
 *         description: Master obat berhasil ditambahkan
 */
router.post(
  "/master",
  authMiddleware,
  roleMiddleware("admin", "perawat"),
  obatController.createMasterObat,
);

/**
 * @swagger
 * /api/obat/master/{id}:
 *   put:
 *     summary: Update master obat
 *     tags: [Obat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Master obat berhasil diupdate
 */
router.put(
  "/master/:id",
  authMiddleware,
  roleMiddleware("admin", "perawat"),
  obatController.updateMasterObat,
);

/**
 * @swagger
 * /api/obat/master/{id}:
 *   delete:
 *     summary: Hapus master obat
 *     description: Tidak bisa dihapus jika masih digunakan oleh pasien
 *     tags: [Obat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Master obat berhasil dihapus
 *       400:
 *         description: Obat masih digunakan pasien
 */
router.delete(
  "/master/:id",
  authMiddleware,
  roleMiddleware("admin", "perawat"),
  obatController.deleteMasterObat,
);

// =============================================
// OBAT PASIEN (OBAT-02 s/d OBAT-05)
// =============================================

/**
 * @swagger
 * /api/obat/pasien/{pasienId}:
 *   get:
 *     summary: Daftar obat pasien
 *     description: >
 *       Menampilkan semua obat aktif pasien beserta flag stok_menipis
 *       jika stok <= 3 tablet (H-3 sebelum habis)
 *     tags: [Obat Pasien]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Daftar obat pasien berhasil diambil
 */
router.get("/pasien/:pasienId", authMiddleware, obatController.getObatPasien);

/**
 * @swagger
 * /api/obat/pasien/{pasienId}:
 *   post:
 *     summary: Tambah obat untuk pasien
 *     description: >
 *       Pasien memilih obat dari master obat kemudian set stok dan jadwal minum.
 *       Obat yang sama tidak bisa didaftarkan 2x untuk waktu yang sama.
 *     tags: [Obat Pasien]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - master_obat_id
 *               - jumlah_stok
 *               - kategori_waktu
 *             properties:
 *               master_obat_id:
 *                 type: integer
 *                 example: 1
 *               jumlah_stok:
 *                 type: integer
 *                 example: 30
 *               kategori_waktu:
 *                 type: string
 *                 enum: [Pagi, Siang, Malam]
 *               dosis:
 *                 type: string
 *                 example: 1 tablet
 *     responses:
 *       201:
 *         description: Obat pasien berhasil ditambahkan
 *       400:
 *         description: Validasi gagal atau obat sudah terdaftar
 */
router.post(
  "/pasien/:pasienId",
  authMiddleware,
  roleMiddleware("pasien"),
  obatController.tambahObatPasien,
);

/**
 * @swagger
 * /api/obat/pasien/{pasienId}/{obatId}:
 *   put:
 *     summary: Update obat pasien
 *     description: Edit stok, dosis, atau waktu minum
 *     tags: [Obat Pasien]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: obatId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Obat pasien berhasil diupdate
 */
router.put(
  "/pasien/:pasienId/:obatId",
  authMiddleware,
  roleMiddleware("pasien"),
  obatController.updateObatPasien,
);

/**
 * @swagger
 * /api/obat/pasien/{pasienId}/{obatId}:
 *   delete:
 *     summary: Hapus obat pasien
 *     tags: [Obat Pasien]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: obatId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Obat pasien berhasil dihapus
 */
router.delete(
  "/pasien/:pasienId/:obatId",
  authMiddleware,
  roleMiddleware("pasien"),
  obatController.deleteObatPasien,
);

// =============================================
// KEPATUHAN (OBAT-06, OBAT-07, OBAT-08, OBAT-09, OBAT-10)
// =============================================

/**
 * @swagger
 * /api/obat/kepatuhan/{pasienId}/konfirmasi:
 *   post:
 *     summary: Konfirmasi minum obat
 *     description: >
 *       Pasien konfirmasi status minum obat per sesi.
 *       - Jika **diminum**: skor = 1, stok otomatis berkurang 1.
 *       - Jika **tidak_diminum**: skor = 0, field `alasan` wajib diisi.
 *       - Response menyertakan flag `stok_menipis` jika stok <= 3.
 *     tags: [Obat Pasien]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - obat_pasien_id
 *               - tanggal
 *               - kategori_waktu
 *               - status
 *             properties:
 *               obat_pasien_id:
 *                 type: integer
 *               tanggal:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-29"
 *               kategori_waktu:
 *                 type: string
 *                 enum: [Pagi, Siang, Malam]
 *               status:
 *                 type: string
 *                 enum: [diminum, tidak_diminum]
 *               alasan:
 *                 type: string
 *                 description: Wajib diisi jika status tidak_diminum
 *     responses:
 *       201:
 *         description: Konfirmasi berhasil dicatat
 *       400:
 *         description: Validasi gagal (alasan kosong, sudah dikonfirmasi, dll)
 */
router.post(
  "/kepatuhan/:pasienId/konfirmasi",
  authMiddleware,
  roleMiddleware("pasien"),
  obatController.konfirmasiMinum,
);

/**
 * @swagger
 * /api/obat/kepatuhan/{pasienId}/belum-dikonfirmasi:
 *   get:
 *     summary: Obat yang belum dikonfirmasi dari sesi sebelumnya
 *     description: >
 *       Menampilkan obat dari sesi sebelumnya yang belum mendapat konfirmasi,
 *       agar pasien/keluarga mengetahui adanya kelalaian jadwal minum obat.
 *     tags: [Obat Pasien]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Data obat belum dikonfirmasi berhasil diambil
 */
router.get(
  "/kepatuhan/:pasienId/belum-dikonfirmasi",
  authMiddleware,
  obatController.getObatBelumDikonfirmasi,
);

/**
 * @swagger
 * /api/obat/kepatuhan/{pasienId}/riwayat:
 *   get:
 *     summary: Riwayat kepatuhan minum obat
 *     tags: [Obat Pasien]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [mingguan, bulanan]
 *         description: Filter periode (opsional jika pakai start_date & end_date)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai (format YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir (format YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Riwayat kepatuhan berhasil diambil
 */
router.get(
  "/kepatuhan/:pasienId/riwayat",
  authMiddleware,
  obatController.getRiwayatKepatuhan,
);

/**
 * @swagger
 * /api/obat/kepatuhan/{pasienId}/grafik:
 *   get:
 *     summary: Data grafik kepatuhan minum obat
 *     tags: [Obat Pasien]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [mingguan, bulanan]
 *         description: Filter periode (opsional jika pakai start_date & end_date)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai (format YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir (format YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Data grafik kepatuhan berhasil diambil
 */
router.get(
  "/kepatuhan/:pasienId/grafik",
  authMiddleware,
  obatController.getGrafikKepatuhan,
);

/**
 * @swagger
 * /api/obat/kepatuhan/{pasienId}/log/{logId}:
 *   put:
 *     summary: Update log kepatuhan minum obat
 *     description: Jika status berubah, stok obat otomatis disesuaikan
 *     tags: [Obat Pasien]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [diminum, tidak_diminum]
 *               alasan:
 *                 type: string
 *                 description: Wajib jika status tidak_diminum
 *     responses:
 *       200:
 *         description: Log kepatuhan berhasil diupdate
 */
router.put(
  "/kepatuhan/:pasienId/log/:logId",
  authMiddleware,
  roleMiddleware("pasien"),
  obatController.updateLogKepatuhan,
);

/**
 * @swagger
 * /api/obat/kepatuhan/{pasienId}/log/{logId}:
 *   delete:
 *     summary: Hapus log kepatuhan minum obat
 *     description: Jika log berstatus diminum, stok obat otomatis dikembalikan
 *     tags: [Obat Pasien]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Log kepatuhan berhasil dihapus
 */
router.delete(
  "/kepatuhan/:pasienId/log/:logId",
  authMiddleware,
  roleMiddleware("pasien"),
  obatController.deleteLogKepatuhan,
);

module.exports = router;
