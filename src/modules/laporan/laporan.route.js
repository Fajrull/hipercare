const express = require('express');
const router = express.Router();
const laporanController = require('./laporan.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

/**
 * @swagger
 * /api/laporan/{pasienId}/tekanan-darah:
 *   get:
 *     summary: Ekspor laporan tekanan darah (PDF)
 *     description: >
 *       Generate dan download laporan tekanan darah pasien dalam format PDF.
 *       Berisi ringkasan, distribusi klasifikasi, dan tabel detail pengukuran.
 *     tags: [Laporan]
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
 *           enum: [mingguan, bulanan, custom]
 *         description: Filter periode (default bulanan)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal mulai (wajib jika filter custom)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Tanggal akhir (wajib jika filter custom)
 *     responses:
 *       200:
 *         description: File PDF laporan tekanan darah
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Pasien tidak ditemukan atau validasi gagal
 */
router.get('/:pasienId/tekanan-darah', authMiddleware, roleMiddleware('perawat', 'admin', 'pasien', 'keluarga'), laporanController.eksporTD);

/**
 * @swagger
 * /api/laporan/{pasienId}/kepatuhan:
 *   get:
 *     summary: Ekspor laporan kepatuhan minum obat (PDF)
 *     description: >
 *       Generate dan download laporan kepatuhan minum obat pasien dalam format PDF.
 *       Berisi ringkasan, kepatuhan per obat, dan detail log kepatuhan.
 *     tags: [Laporan]
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
 *           enum: [mingguan, bulanan, custom]
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: File PDF laporan kepatuhan
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:pasienId/kepatuhan', authMiddleware, roleMiddleware('perawat', 'admin', 'pasien', 'keluarga'), laporanController.eksporKepatuhan);

/**
 * @swagger
 * /api/laporan/{pasienId}/lengkap:
 *   get:
 *     summary: Ekspor laporan evaluasi kesehatan lengkap (PDF)
 *     description: >
 *       Generate dan download laporan lengkap yang mencakup:
 *       - Tekanan Darah (ringkasan + 5 data terakhir)
 *       - Kepatuhan Minum Obat (ringkasan persentase)
 *       - Diet DASH (ringkasan + 5 log terakhir)
 *     tags: [Laporan]
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
 *           enum: [mingguan, bulanan, custom]
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: File PDF laporan lengkap
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:pasienId/lengkap', authMiddleware, roleMiddleware('perawat', 'admin', 'pasien', 'keluarga'), laporanController.eksporLengkap);

module.exports = router;