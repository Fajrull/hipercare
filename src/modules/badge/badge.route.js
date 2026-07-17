const express = require('express');
const router = express.Router();
const badgeController = require('./badge.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

/**
 * @swagger
 * /api/badge:
 *   get:
 *     summary: Ambil semua badge motivasi
 *     description: Dapat diakses semua role
 *     tags: [Badge]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar badge berhasil diambil
 */
router.get('/', authMiddleware, badgeController.getAllBadge);

/**
 * @swagger
 * /api/badge/pasien/{pasienId}:
 *   get:
 *     summary: Ambil badge yang layak diterima pasien
 *     description: >
 *       Menghitung persentase kepatuhan 7 hari terakhir dan menentukan
 *       badge yang layak diterima pasien berdasarkan persentase tersebut.
 *
 *       **Kriteria Badge:**
 *       | Persentase | Badge |
 *       |---|---|
 *       | 100% | Badge ke-1 (terbaik) |
 *       | ≥ 80% | Badge ke-2 |
 *       | ≥ 50% | Badge ke-3 |
 *       | < 50% | Tidak dapat badge |
 *     tags: [Badge]
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
 *         description: Badge pasien berhasil diambil
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
 *                     persentase_kepatuhan:
 *                       type: integer
 *                       example: 85
 *                     total_konfirmasi:
 *                       type: integer
 *                     total_patuh:
 *                       type: integer
 *                     badge:
 *                       type: object
 *                       description: Badge yang layak diterima, null jika < 50%
 *                     semua_badge:
 *                       type: array
 *                       description: Semua badge yang tersedia
 */
router.get('/pasien/:pasienId', authMiddleware, badgeController.getBadgePasien);

/**
 * @swagger
 * /api/badge/{id}:
 *   get:
 *     summary: Detail badge
 *     tags: [Badge]
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
 *         description: Detail badge berhasil diambil
 *       404:
 *         description: Badge tidak ditemukan
 */
router.get('/:id', authMiddleware, badgeController.getBadgeById);

/**
 * @swagger
 * /api/badge:
 *   post:
 *     summary: Tambah badge motivasi baru
 *     description: Hanya admin
 *     tags: [Badge]
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
 *             properties:
 *               judul:
 *                 type: string
 *                 example: "⭐ Pasien Teladan"
 *               deskripsi:
 *                 type: string
 *                 example: Berhasil minum obat 100% selama seminggu penuh!
 *     responses:
 *       201:
 *         description: Badge berhasil ditambahkan
 *       400:
 *         description: Validasi gagal
 */
router.post('/', authMiddleware, roleMiddleware('admin'), badgeController.createBadge);

/**
 * @swagger
 * /api/badge/{id}:
 *   put:
 *     summary: Update badge motivasi
 *     description: Hanya admin
 *     tags: [Badge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               judul:
 *                 type: string
 *               deskripsi:
 *                 type: string
 *     responses:
 *       200:
 *         description: Badge berhasil diupdate
 */
router.put('/:id', authMiddleware, roleMiddleware('admin'), badgeController.updateBadge);

/**
 * @swagger
 * /api/badge/{id}:
 *   delete:
 *     summary: Hapus badge motivasi
 *     description: Hanya admin
 *     tags: [Badge]
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
 *         description: Badge berhasil dihapus
 */
router.delete('/:id', authMiddleware, roleMiddleware('admin'), badgeController.deleteBadge);

module.exports = router;