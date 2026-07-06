const express = require("express");
const router = express.Router();
const tdController = require("./tekanan-darah.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

/**
 * @swagger
 * /api/tekanan-darah/{pasienId}:
 *   post:
 *     summary: Input tekanan darah harian
 *     description: >
 *       Input tekanan darah harian pasien. Sistem otomatis:
 *       - Klasifikasi hasil (Normal / Pre-HT / HT Grade 1 / HT Grade 2 / Krisis HT)
 *       - Kirim notifikasi darurat ke keluarga & perawat jika HT Grade 2 atau Krisis HT
 *       - Simpan riwayat notifikasi ke database
 *
 *       **Tabel Klasifikasi:**
 *       | Klasifikasi | Sistolik | Diastolik |
 *       |---|---|---|
 *       | Normal | < 120 | < 80 |
 *       | Pre-HT | 120–139 | 80–89 |
 *       | HT Grade 1 | 140–159 | 90–99 |
 *       | HT Grade 2 | ≥ 160 | ≥ 100 |
 *       | Krisis HT | > 180 | > 120 |
 *     tags: [Tekanan Darah]
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
 *               - tanggal
 *               - sistolik
 *               - diastolik
 *             properties:
 *               tanggal:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-05"
 *               sistolik:
 *                 type: integer
 *                 example: 150
 *               diastolik:
 *                 type: integer
 *                 example: 95
 *     responses:
 *       201:
 *         description: Tekanan darah berhasil dicatat
 *       400:
 *         description: Validasi gagal
 */
router.post(
  "/:pasienId",
  authMiddleware,
  roleMiddleware("pasien", "perawat"),
  tdController.inputTekananDarah,
);

/**
 * @swagger
 * /api/tekanan-darah/{pasienId}:
 *   get:
 *     summary: Riwayat tekanan darah pasien
 *     tags: [Tekanan Darah]
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
 *         description: Filter periode (default semua data)
 *     responses:
 *       200:
 *         description: Riwayat tekanan darah berhasil diambil
 */
router.get("/:pasienId", authMiddleware, tdController.getRiwayatTD);

/**
 * @swagger
 * /api/tekanan-darah/{pasienId}/grafik:
 *   get:
 *     summary: Data grafik tekanan darah
 *     description: >
 *       Mengembalikan data grafik beserta summary (rata-rata sistolik/diastolik,
 *       distribusi klasifikasi, dan klasifikasi rata-rata keseluruhan).
 *     tags: [Tekanan Darah]
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
 *         description: Filter periode grafik (default mingguan)
 *     responses:
 *       200:
 *         description: Data grafik berhasil diambil
 */
router.get("/:pasienId/grafik", authMiddleware, tdController.getGrafikTD);

/**
 * @swagger
 * /api/tekanan-darah/{pasienId}/{id}:
 *   put:
 *     summary: Update data tekanan darah
 *     description: Klasifikasi otomatis dikalkulasi ulang setelah update
 *     tags: [Tekanan Darah]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
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
 *               tanggal:
 *                 type: string
 *                 format: date
 *               sistolik:
 *                 type: integer
 *               diastolik:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Data tekanan darah berhasil diupdate
 *       404:
 *         description: Data tidak ditemukan
 */
router.put(
  "/:pasienId/:id",
  authMiddleware,
  roleMiddleware("pasien", "perawat"),
  tdController.updateTekananDarah,
);

/**
 * @swagger
 * /api/tekanan-darah/{pasienId}/{id}:
 *   delete:
 *     summary: Hapus data tekanan darah
 *     tags: [Tekanan Darah]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Data tekanan darah berhasil dihapus
 */
router.delete(
  "/:pasienId/:id",
  authMiddleware,
  roleMiddleware("pasien", "perawat"),
  tdController.deleteTekananDarah,
);

module.exports = router;
