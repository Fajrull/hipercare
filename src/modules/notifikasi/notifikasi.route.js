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

/**
 * @swagger
 * /api/notifikasi/test/alarm-obat:
 *   post:
 *     summary: Test kirim notifikasi alarm minum obat
 *     description: Hanya untuk testing. Kirim notifikasi alarm obat ke device user yang sedang login.
 *     tags: [Notifikasi]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - kategori_waktu
 *             properties:
 *               kategori_waktu:
 *                 type: string
 *                 enum: [Pagi, Siang, Malam]
 *                 example: Pagi
 *     responses:
 *       200:
 *         description: Notifikasi berhasil dikirim
 */
router.post('/test/alarm-obat', authMiddleware, notifController.testAlarmObat);

/**
 * @swagger
 * /api/notifikasi/test/td-darurat:
 *   post:
 *     summary: Test kirim notifikasi TD darurat
 *     description: Hanya untuk testing. Simulasi notifikasi tekanan darah kritis.
 *     tags: [Notifikasi]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pasien_id
 *             properties:
 *               pasien_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Notifikasi berhasil dikirim
 */
router.post('/test/td-darurat', authMiddleware, notifController.testTDDarurat);

/**
 * @swagger
 * /api/notifikasi/test/kontrol:
 *   post:
 *     summary: Test kirim notifikasi reminder jadwal kontrol
 *     description: Hanya untuk testing. Simulasi notifikasi reminder jadwal kontrol dokter.
 *     tags: [Notifikasi]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pasien_id
 *             properties:
 *               pasien_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Notifikasi berhasil dikirim
 */
router.post('/test/kontrol', authMiddleware, notifController.testKontrol);

module.exports = router;