const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

/**
 * @swagger
 * /api/edukasi:
 *   get:
 *     summary: Ambil semua materi edukasi
 *     description: Dapat diakses oleh semua role
 *     tags: [Edukasi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: kategori
 *         schema:
 *           type: string
 *           enum: [Video, Materi]
 *     responses:
 *       200:
 *         description: Daftar materi edukasi
 */
router.get('/', authMiddleware, (req, res) => {
  res.json({ status: true, message: 'Edukasi - coming soon', data: null });
});

/**
 * @swagger
 * /api/edukasi:
 *   post:
 *     summary: Tambah materi edukasi baru
 *     description: Hanya admin
 *     tags: [Edukasi]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - judul
 *               - kategori
 *             properties:
 *               judul:
 *                 type: string
 *               kategori:
 *                 type: string
 *                 enum: [Video, Materi]
 *               konten:
 *                 type: string
 *                 description: URL YouTube jika Video, path file jika Materi
 *               topik:
 *                 type: string
 *                 enum: [Mengenal HT, FCN, Diet DASH, Kepatuhan Obat, Kontrol TD]
 *     responses:
 *       201:
 *         description: Materi edukasi berhasil ditambahkan
 */
router.post('/', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.json({ status: true, message: 'Tambah edukasi - coming soon', data: null });
});

/**
 * @swagger
 * /api/edukasi/{id}:
 *   put:
 *     summary: Update materi edukasi
 *     tags: [Edukasi]
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
 *         description: Materi edukasi berhasil diupdate
 */
router.put('/:id', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.json({ status: true, message: 'Update edukasi - coming soon', data: null });
});

/**
 * @swagger
 * /api/edukasi/{id}:
 *   delete:
 *     summary: Hapus materi edukasi
 *     tags: [Edukasi]
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
 *         description: Materi edukasi berhasil dihapus
 */
router.delete('/:id', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.json({ status: true, message: 'Hapus edukasi - coming soon', data: null });
});

module.exports = router;
