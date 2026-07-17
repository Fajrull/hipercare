const express = require('express');
const router = express.Router();
const notifController = require('./notifikasi.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

/**
 * @swagger
 * /api/notifikasi:
 *   get:
 *     summary: Ambil riwayat notifikasi user aktif
 *     description: Mengembalikan semua notifikasi milik user yang sedang login beserta jumlah yang belum dibaca
 *     tags: [Notifikasi]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifikasi berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     notifikasi:
 *                       type: array
 *                     belum_dibaca:
 *                       type: integer
 *                       example: 3
 */
router.get('/', authMiddleware, notifController.getRiwayatNotifikasi);

/**
 * @swagger
 * /api/notifikasi/read-all:
 *   patch:
 *     summary: Tandai semua notifikasi sebagai sudah dibaca
 *     tags: [Notifikasi]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Semua notifikasi ditandai sudah dibaca
 */
router.patch('/read-all', authMiddleware, notifController.tandaiSemuaDibaca);

/**
 * @swagger
 * /api/notifikasi/{id}/read:
 *   patch:
 *     summary: Tandai satu notifikasi sebagai sudah dibaca
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
 *         description: Notifikasi ditandai sudah dibaca
 *       400:
 *         description: Notifikasi tidak ditemukan
 */
router.patch('/:id/read', authMiddleware, notifController.tandaiDibaca);

module.exports = router;