const express = require("express");
const router = express.Router();
const edukasiController = require("./edukasi.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

/**
 * @swagger
 * /api/edukasi:
 *   get:
 *     summary: Ambil semua materi edukasi
 *     description: Dapat diakses semua role. Opsional filter berdasarkan kategori.
 *     tags: [Edukasi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: kategori
 *         schema:
 *           type: string
 *           enum: [Video, Materi]
 *         description: Filter berdasarkan kategori (opsional)
 *     responses:
 *       200:
 *         description: Daftar materi edukasi berhasil diambil
 */
router.get("/", authMiddleware, edukasiController.getAllEdukasi);

/**
 * @swagger
 * /api/edukasi/grouped:
 *   get:
 *     summary: Ambil materi edukasi dikelompokkan per topik
 *     description: >
 *       Response menyertakan 2 format:
 *       - `semua`: array flat semua materi
 *       - `grouped`: dikelompokkan per topik dengan sub-kategori video & materi
 *
 *       **5 Topik yang tersedia:**
 *       1. Mengenal HT
 *       2. FCN
 *       3. Diet DASH
 *       4. Kepatuhan Obat
 *       5. Kontrol TD
 *     tags: [Edukasi]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Materi edukasi grouped berhasil diambil
 */
router.get("/grouped", authMiddleware, edukasiController.getEdukasiGrouped);

/**
 * @swagger
 * /api/edukasi/{id}:
 *   get:
 *     summary: Detail materi edukasi
 *     tags: [Edukasi]
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
 *         description: Detail materi edukasi berhasil diambil
 *       404:
 *         description: Materi tidak ditemukan
 */
router.get("/:id", authMiddleware, edukasiController.getEdukasiById);

/**
 * @swagger
 * /api/edukasi:
 *   post:
 *     summary: Tambah materi edukasi baru
 *     description: Hanya admin
 *     tags: [Edukasi]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - judul
 *               - kategori
 *             properties:
 *               judul:
 *                 type: string
 *                 example: Mengenal Hipertensi dan Faktor Risikonya
 *               kategori:
 *                 type: string
 *                 enum: [Video, Materi]
 *               konten:
 *                 type: string
 *                 description: URL YouTube jika Video, path file jika Materi
 *                 example: https://www.youtube.com/watch?v=xxxxx
 *               topik:
 *                 type: string
 *                 enum: [Mengenal HT, FCN, Diet DASH, Kepatuhan Obat, Kontrol TD]
 *     responses:
 *       201:
 *         description: Materi edukasi berhasil ditambahkan
 *       400:
 *         description: Validasi gagal
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "perawat"),
  edukasiController.createEdukasi,
);

/**
 * @swagger
 * /api/edukasi/{id}:
 *   put:
 *     summary: Update materi edukasi
 *     description: Hanya admin
 *     tags: [Edukasi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               judul:
 *                 type: string
 *               kategori:
 *                 type: string
 *                 enum: [Video, Materi]
 *               konten:
 *                 type: string
 *               topik:
 *                 type: string
 *                 enum: [Mengenal HT, FCN, Diet DASH, Kepatuhan Obat, Kontrol TD]
 *     responses:
 *       200:
 *         description: Materi edukasi berhasil diupdate
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "perawat"),
  edukasiController.updateEdukasi,
);

/**
 * @swagger
 * /api/edukasi/{id}:
 *   delete:
 *     summary: Hapus materi edukasi
 *     description: Hanya admin
 *     tags: [Edukasi]
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
 *         description: Materi edukasi berhasil dihapus
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "perawat"),
  edukasiController.deleteEdukasi,
);

module.exports = router;
