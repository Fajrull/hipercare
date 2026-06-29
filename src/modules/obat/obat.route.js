const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

/**
 * @swagger
 * /api/obat/master:
 *   get:
 *     summary: Ambil semua master data obat
 *     tags: [Obat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar master obat
 */
router.get('/master', authMiddleware, (req, res) => {
  res.json({ status: true, message: 'Master obat - coming soon', data: null });
});

/**
 * @swagger
 * /api/obat/master:
 *   post:
 *     summary: Tambah master obat baru
 *     description: Hanya admin dan perawat
 *     tags: [Obat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama_obat
 *             properties:
 *               nama_obat:
 *                 type: string
 *                 example: Amlodipine
 *               dosis:
 *                 type: string
 *                 example: 5mg
 *     responses:
 *       201:
 *         description: Master obat berhasil ditambahkan
 */
router.post('/master', authMiddleware, roleMiddleware('admin', 'perawat'), (req, res) => {
  res.json({ status: true, message: 'Tambah master obat - coming soon', data: null });
});

/**
 * @swagger
 * /api/obat/master/{id}:
 *   put:
 *     summary: Update master obat
 *     tags: [Obat]
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
 *         description: Master obat berhasil diupdate
 */
router.put('/master/:id', authMiddleware, roleMiddleware('admin', 'perawat'), (req, res) => {
  res.json({ status: true, message: 'Update master obat - coming soon', data: null });
});

/**
 * @swagger
 * /api/obat/master/{id}:
 *   delete:
 *     summary: Hapus master obat
 *     tags: [Obat]
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
 *         description: Master obat berhasil dihapus
 */
router.delete('/master/:id', authMiddleware, roleMiddleware('admin', 'perawat'), (req, res) => {
  res.json({ status: true, message: 'Hapus master obat - coming soon', data: null });
});

/**
 * @swagger
 * /api/obat/pasien/{pasienId}:
 *   get:
 *     summary: Ambil daftar obat pasien
 *     tags: [Obat Pasien]
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
 *         description: Daftar obat pasien
 */
router.get('/pasien/:pasienId', authMiddleware, (req, res) => {
  res.json({ status: true, message: 'Obat pasien - coming soon', data: null });
});

/**
 * @swagger
 * /api/obat/pasien/{pasienId}:
 *   post:
 *     summary: Tambah obat untuk pasien
 *     description: Pasien memilih dari master obat dan set jadwal minum
 *     tags: [Obat Pasien]
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
 *               - master_obat_id
 *               - jumlah_stok
 *               - kategori_waktu
 *             properties:
 *               master_obat_id:
 *                 type: integer
 *               jumlah_stok:
 *                 type: integer
 *                 example: 30
 *               kategori_waktu:
 *                 type: string
 *                 enum: [Pagi, Siang, Malam]
 *               dosis:
 *                 type: string
 *                 example: 1 tablet
 *     responses:
 *       201:
 *         description: Obat pasien berhasil ditambahkan
 */
router.post('/pasien/:pasienId', authMiddleware, roleMiddleware('pasien'), (req, res) => {
  res.json({ status: true, message: 'Tambah obat pasien - coming soon', data: null });
});

/**
 * @swagger
 * /api/obat/kepatuhan/{pasienId}:
 *   post:
 *     summary: Konfirmasi minum obat (input kepatuhan)
 *     description: Pasien konfirmasi status minum obat. Jika diminum, stok otomatis berkurang. Jika tidak diminum, wajib isi alasan.
 *     tags: [Obat Pasien]
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
 *               - obat_pasien_id
 *               - tanggal
 *               - kategori_waktu
 *               - status
 *             properties:
 *               obat_pasien_id:
 *                 type: integer
 *               tanggal:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-27"
 *               kategori_waktu:
 *                 type: string
 *                 enum: [Pagi, Siang, Malam]
 *               status:
 *                 type: string
 *                 enum: [diminum, tidak_diminum]
 *               alasan:
 *                 type: string
 *                 description: Wajib diisi jika status tidak_diminum
 *     responses:
 *       201:
 *         description: Kepatuhan berhasil dicatat
 */
router.post('/kepatuhan/:pasienId', authMiddleware, roleMiddleware('pasien'), (req, res) => {
  res.json({ status: true, message: 'Konfirmasi kepatuhan - coming soon', data: null });
});

/**
 * @swagger
 * /api/obat/kepatuhan/{pasienId}:
 *   get:
 *     summary: Riwayat kepatuhan minum obat pasien
 *     tags: [Obat Pasien]
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
 *         description: Filter periode grafik
 *     responses:
 *       200:
 *         description: Riwayat kepatuhan berhasil diambil
 */
router.get('/kepatuhan/:pasienId', authMiddleware, (req, res) => {
  res.json({ status: true, message: 'Riwayat kepatuhan - coming soon', data: null });
});

module.exports = router;
