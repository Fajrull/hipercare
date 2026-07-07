const express = require("express");
const router = express.Router();
const dietController = require("./diet-dash.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

// =============================================
// MASTER DIET DASH (DIET-01)
// =============================================

/**
 * @swagger
 * /api/diet-dash/master:
 *   get:
 *     summary: Ambil semua master menu Diet DASH
 *     description: Dapat diakses semua role
 *     tags: [Diet DASH]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar master diet berhasil diambil
 */
router.get("/master", authMiddleware, dietController.getAllMasterDiet);

/**
 * @swagger
 * /api/diet-dash/master/{id}:
 *   get:
 *     summary: Detail master menu Diet DASH
 *     tags: [Diet DASH]
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
 *         description: Detail master diet berhasil diambil
 *       404:
 *         description: Master diet tidak ditemukan
 */
router.get("/master/:id", authMiddleware, dietController.getMasterDietById);

/**
 * @swagger
 * /api/diet-dash/master:
 *   post:
 *     summary: Tambah master menu Diet DASH
 *     description: Hanya admin dan perawat
 *     tags: [Diet DASH]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama_makanan
 *             properties:
 *               nama_makanan:
 *                 type: string
 *                 example: Nasi Merah
 *               foto:
 *                 type: string
 *                 example: https://storage.example.com/nasi-merah.jpg
 *               kandungan_gizi:
 *                 type: string
 *                 example: Kalori 150kkal, Karbohidrat 30g, Serat 2g
 *               resep_makanan:
 *                 type: string
 *                 example: Cuci beras merah, masak dengan air 1:2
 *     responses:
 *       201:
 *         description: Master diet berhasil ditambahkan
 */
router.post(
  "/master",
  authMiddleware,
  roleMiddleware("admin", "perawat"),
  dietController.createMasterDiet,
);

/**
 * @swagger
 * /api/diet-dash/master/{id}:
 *   put:
 *     summary: Update master menu Diet DASH
 *     tags: [Diet DASH]
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
 *         description: Master diet berhasil diupdate
 */
router.put(
  "/master/:id",
  authMiddleware,
  roleMiddleware("admin", "perawat"),
  dietController.updateMasterDiet,
);

/**
 * @swagger
 * /api/diet-dash/master/{id}:
 *   delete:
 *     summary: Hapus master menu Diet DASH
 *     tags: [Diet DASH]
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
 *         description: Master diet berhasil dihapus
 */
router.delete(
  "/master/:id",
  authMiddleware,
  roleMiddleware("admin", "perawat"),
  dietController.deleteMasterDiet,
);

// =============================================
// REKOMENDASI MENU (DIET-02)
// =============================================

/**
 * @swagger
 * /api/diet-dash/rekomendasi:
 *   get:
 *     summary: Ambil rekomendasi menu harian Diet DASH
 *     description: Menampilkan daftar menu sehat yang bisa dikonsumsi pasien hipertensi
 *     tags: [Diet DASH]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rekomendasi menu berhasil diambil
 */
router.get("/rekomendasi", authMiddleware, dietController.getRekomendasiMenu);

// =============================================
// LOG KONSUMSI MAKANAN (DIET-03, DIET-04, DIET-05)
// =============================================

/**
 * @swagger
 * /api/diet-dash/log/{pasienId}:
 *   get:
 *     summary: Ambil log konsumsi makanan pasien
 *     description: >
 *       Response menyertakan 2 format:
 *       - `logs`: array flat semua log
 *       - `grouped`: log dikelompokkan per tanggal dan kategori (Pagi/Siang/Malam)
 *     tags: [Diet DASH]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tanggal
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter log berdasarkan tanggal (opsional, default semua)
 *     responses:
 *       200:
 *         description: Log konsumsi berhasil diambil
 */
router.get("/log/:pasienId", authMiddleware, dietController.getLogKonsumsi);

/**
 * @swagger
 * /api/diet-dash/log/{pasienId}:
 *   post:
 *     summary: Input log konsumsi makanan harian
 *     description: >
 *       Pasien input makanan yang dikonsumsi. Bisa dari master diet atau input manual.
 *       Minimal salah satu dari `master_diet_id` atau `nama_makanan` wajib diisi.
 *     tags: [Diet DASH]
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
 *               - kategori_makan
 *               - tanggal
 *             properties:
 *               master_diet_id:
 *                 type: integer
 *                 description: Opsional, jika makanan ada di master diet
 *               nama_makanan:
 *                 type: string
 *                 description: Opsional, jika makanan tidak ada di master diet
 *                 example: Tempe Goreng
 *               kategori_makan:
 *                 type: string
 *                 enum: [Pagi, Siang, Malam]
 *               foto:
 *                 type: string
 *                 description: URL foto makanan (opsional)
 *               tanggal:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-05"
 *     responses:
 *       201:
 *         description: Log konsumsi berhasil disimpan
 *       400:
 *         description: Validasi gagal
 */
router.post(
  "/log/:pasienId",
  authMiddleware,
  roleMiddleware("pasien"),
  dietController.inputLogKonsumsi,
);

/**
 * @swagger
 * /api/diet-dash/log/{pasienId}/{logId}:
 *   put:
 *     summary: Update log konsumsi makanan
 *     tags: [Diet DASH]
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
 *         description: Log konsumsi berhasil diupdate
 */
router.put(
  "/log/:pasienId/:logId",
  authMiddleware,
  roleMiddleware("pasien"),
  dietController.updateLogKonsumsi,
);

/**
 * @swagger
 * /api/diet-dash/log/{pasienId}/{logId}:
 *   delete:
 *     summary: Hapus log konsumsi makanan
 *     tags: [Diet DASH]
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
 *         description: Log konsumsi berhasil dihapus
 */
router.delete(
  "/log/:pasienId/:logId",
  authMiddleware,
  roleMiddleware("pasien"),
  dietController.deleteLogKonsumsi,
);

module.exports = router;
