const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

/**
 * @swagger
 * /api/jadwal-kontrol/{pasienId}:
 *   get:
 *     summary: Ambil daftar jadwal kontrol pasien
 *     tags: [Jadwal Kontrol]
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
 *         description: Daftar jadwal kontrol berhasil diambil
 */
router.get('/:pasienId', authMiddleware, (req, res) => {
  res.json({ status: true, message: 'Jadwal kontrol - coming soon', data: null });
});

/**
 * @swagger
 * /api/jadwal-kontrol/{pasienId}:
 *   post:
 *     summary: Tambah jadwal kontrol baru
 *     description: Sistem otomatis kirim reminder ke pasien & keluarga pada H-3, H-1, dan H-0 di pagi hari
 *     tags: [Jadwal Kontrol]
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
 *               - jam
 *             properties:
 *               tanggal:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-10"
 *               jam:
 *                 type: string
 *                 example: "08:00"
 *               lokasi_faskes:
 *                 type: string
 *                 example: Puskesmas Kebayoran Baru
 *               nama_dokter:
 *                 type: string
 *                 example: dr. Siti Rahayu
 *     responses:
 *       201:
 *         description: Jadwal kontrol berhasil ditambahkan
 */
router.post('/:pasienId', authMiddleware, roleMiddleware('pasien', 'perawat'), (req, res) => {
  res.json({ status: true, message: 'Tambah jadwal kontrol - coming soon', data: null });
});

/**
 * @swagger
 * /api/jadwal-kontrol/{pasienId}/{id}:
 *   delete:
 *     summary: Hapus jadwal kontrol
 *     tags: [Jadwal Kontrol]
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
 *         description: Jadwal kontrol berhasil dihapus
 */
router.delete('/:pasienId/:id', authMiddleware, roleMiddleware('pasien', 'perawat'), (req, res) => {
  res.json({ status: true, message: 'Hapus jadwal kontrol - coming soon', data: null });
});

module.exports = router;
