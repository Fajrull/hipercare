const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

/**
 * @swagger
 * /api/badge:
 *   get:
 *     summary: Ambil semua badge motivasi
 *     tags: [Badge]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar badge motivasi
 */
router.get('/', authMiddleware, (req, res) => {
  res.json({ status: true, message: 'Badge motivasi - coming soon', data: null });
});

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
 *               deskripsi:
 *                 type: string
 *     responses:
 *       201:
 *         description: Badge motivasi berhasil ditambahkan
 */
router.post('/', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.json({ status: true, message: 'Tambah badge - coming soon', data: null });
});

/**
 * @swagger
 * /api/badge/{id}:
 *   put:
 *     summary: Update badge motivasi
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
 *         description: Badge motivasi berhasil diupdate
 */
router.put('/:id', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.json({ status: true, message: 'Update badge - coming soon', data: null });
});

/**
 * @swagger
 * /api/badge/{id}:
 *   delete:
 *     summary: Hapus badge motivasi
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
 *         description: Badge motivasi berhasil dihapus
 */
router.delete('/:id', authMiddleware, roleMiddleware('admin'), (req, res) => {
  res.json({ status: true, message: 'Hapus badge - coming soon', data: null });
});

module.exports = router;
