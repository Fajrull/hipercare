const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

/**
 * @swagger
 * /api/keluhan/{pasienId}:
 *   get:
 *     summary: Ambil riwayat keluhan klinis pasien
 *     tags: [Keluhan]
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
 *         description: Riwayat keluhan berhasil diambil
 */
router.get('/:pasienId', authMiddleware, (req, res) => {
  res.json({ status: true, message: 'Keluhan - coming soon', data: null });
});

/**
 * @swagger
 * /api/keluhan/{pasienId}:
 *   post:
 *     summary: Input keluhan klinis baru
 *     description: Bisa dilakukan oleh pasien, keluarga, atau perawat. Sistem otomatis kirim notifikasi ke perawat.
 *     tags: [Keluhan]
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
 *               - keluhan
 *             properties:
 *               tanggal:
 *                 type: string
 *                 format: date
 *               keluhan:
 *                 type: string
 *                 example: Kepala pusing dan tengkuk terasa berat
 *     responses:
 *       201:
 *         description: Keluhan berhasil disimpan dan notifikasi dikirim ke perawat
 */
router.post('/:pasienId', authMiddleware, roleMiddleware('pasien', 'keluarga', 'perawat'), (req, res) => {
  res.json({ status: true, message: 'Input keluhan - coming soon', data: null });
});

/**
 * @swagger
 * /api/keluhan/{pasienId}/{id}:
 *   put:
 *     summary: Update keluhan klinis
 *     tags: [Keluhan]
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
 *         description: Keluhan berhasil diupdate
 */
router.put('/:pasienId/:id', authMiddleware, roleMiddleware('pasien', 'keluarga', 'perawat'), (req, res) => {
  res.json({ status: true, message: 'Update keluhan - coming soon', data: null });
});

/**
 * @swagger
 * /api/keluhan/{pasienId}/{id}:
 *   delete:
 *     summary: Hapus keluhan klinis
 *     tags: [Keluhan]
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
 *         description: Keluhan berhasil dihapus
 */
router.delete('/:pasienId/:id', authMiddleware, roleMiddleware('pasien', 'keluarga', 'perawat'), (req, res) => {
  res.json({ status: true, message: 'Hapus keluhan - coming soon', data: null });
});

module.exports = router;
