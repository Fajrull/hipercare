const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

/**
 * @swagger
 * /api/diet-dash/master:
 *   get:
 *     summary: Ambil semua master menu Diet DASH
 *     tags: [Diet DASH]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar master menu DASH
 */
router.get('/master', authMiddleware, (req, res) => {
  res.json({ status: true, message: 'Master diet dash - coming soon', data: null });
});

/**
 * @swagger
 * /api/diet-dash/master:
 *   post:
 *     summary: Tambah menu Diet DASH baru
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
 *               foto:
 *                 type: string
 *               kandungan_gizi:
 *                 type: string
 *               resep_makanan:
 *                 type: string
 *     responses:
 *       201:
 *         description: Menu DASH berhasil ditambahkan
 */
router.post('/master', authMiddleware, roleMiddleware('admin', 'perawat'), (req, res) => {
  res.json({ status: true, message: 'Tambah master diet - coming soon', data: null });
});

/**
 * @swagger
 * /api/diet-dash/log/{pasienId}:
 *   get:
 *     summary: Ambil log konsumsi makanan pasien
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
 *     responses:
 *       200:
 *         description: Log konsumsi makanan berhasil diambil
 */
router.get('/log/:pasienId', authMiddleware, (req, res) => {
  res.json({ status: true, message: 'Log konsumsi - coming soon', data: null });
});

/**
 * @swagger
 * /api/diet-dash/log/{pasienId}:
 *   post:
 *     summary: Input log konsumsi makanan harian
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
 *                 description: Opsional, jika makanan ada di master
 *               nama_makanan:
 *                 type: string
 *                 description: Opsional, jika makanan tidak ada di master
 *               kategori_makan:
 *                 type: string
 *                 enum: [Pagi, Siang, Malam]
 *               foto:
 *                 type: string
 *               tanggal:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Log konsumsi berhasil disimpan
 */
router.post('/log/:pasienId', authMiddleware, roleMiddleware('pasien'), (req, res) => {
  res.json({ status: true, message: 'Input log konsumsi - coming soon', data: null });
});

module.exports = router;
