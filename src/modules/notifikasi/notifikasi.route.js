const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * /api/notifikasi:
 *   get:
 *     summary: Ambil riwayat notifikasi user yang sedang login
 *     tags: [Notifikasi]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar notifikasi berhasil diambil
 */
router.get('/', authMiddleware, (req, res) => {
  res.json({ status: true, message: 'Notifikasi - coming soon', data: null });
});

/**
 * @swagger
 * /api/notifikasi/{id}/read:
 *   patch:
 *     summary: Tandai notifikasi sebagai sudah dibaca
 *     tags: [Notifikasi]
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
 *         description: Notifikasi berhasil ditandai dibaca
 */
router.patch('/:id/read', authMiddleware, (req, res) => {
  res.json({ status: true, message: 'Read notifikasi - coming soon', data: null });
});

module.exports = router;
