const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

/**
 * @swagger
 * /api/tekanan-darah/{pasienId}:
 *   get:
 *     summary: Ambil riwayat tekanan darah pasien
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
 *     responses:
 *       200:
 *         description: Riwayat tekanan darah berhasil diambil
 */
router.get('/:pasienId', authMiddleware, (req, res) => {
  res.json({ status: true, message: 'Tekanan darah - coming soon', data: null });
});

/**
 * @swagger
 * /api/tekanan-darah/{pasienId}:
 *   post:
 *     summary: Input tekanan darah harian
 *     description: >
 *       Pasien atau perawat input tekanan darah.
 *       Sistem otomatis klasifikasi (Normal/Pre-HT/HT Grade 1/HT Grade 2/Krisis HT)
 *       dan kirim notifikasi darurat jika melebihi batas normal.
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
 *                 example: "2026-06-27"
 *               sistolik:
 *                 type: integer
 *                 example: 140
 *               diastolik:
 *                 type: integer
 *                 example: 90
 *     responses:
 *       201:
 *         description: Tekanan darah berhasil dicatat
 *       200:
 *         description: Tekanan darah melebihi batas normal, notifikasi darurat dikirim
 */
router.post('/:pasienId', authMiddleware, roleMiddleware('pasien', 'perawat'), (req, res) => {
  res.json({ status: true, message: 'Input tekanan darah - coming soon', data: null });
});

/**
 * @swagger
 * /api/tekanan-darah/{pasienId}/{id}:
 *   put:
 *     summary: Update data tekanan darah
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
 *         description: Data tekanan darah berhasil diupdate
 */
router.put('/:pasienId/:id', authMiddleware, roleMiddleware('pasien', 'perawat'), (req, res) => {
  res.json({ status: true, message: 'Update tekanan darah - coming soon', data: null });
});

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
router.delete('/:pasienId/:id', authMiddleware, roleMiddleware('pasien', 'perawat'), (req, res) => {
  res.json({ status: true, message: 'Hapus tekanan darah - coming soon', data: null });
});

module.exports = router;
