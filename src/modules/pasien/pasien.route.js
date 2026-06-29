const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

/**
 * @swagger
 * /api/pasien:
 *   get:
 *     summary: Ambil semua data pasien
 *     description: Hanya bisa diakses oleh perawat dan admin
 *     tags: [Pasien]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar pasien berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       403:
 *         description: Akses ditolak
 */
router.get('/', authMiddleware, roleMiddleware('admin', 'perawat'), (req, res) => {
  res.json({ status: true, message: 'Pasien module - coming soon', data: null });
});

/**
 * @swagger
 * /api/pasien/{id}:
 *   get:
 *     summary: Ambil detail pasien berdasarkan ID
 *     tags: [Pasien]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pasien
 *     responses:
 *       200:
 *         description: Detail pasien berhasil diambil
 *       404:
 *         description: Pasien tidak ditemukan
 */
router.get('/:id', authMiddleware, roleMiddleware('admin', 'perawat', 'pasien', 'keluarga'), (req, res) => {
  res.json({ status: true, message: 'Pasien detail - coming soon', data: null });
});

/**
 * @swagger
 * /api/pasien:
 *   post:
 *     summary: Registrasi pasien baru
 *     description: Hanya bisa dilakukan oleh perawat via web
 *     tags: [Pasien]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama
 *               - username
 *               - password
 *             properties:
 *               nama:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               umur:
 *                 type: integer
 *               jenis_kelamin:
 *                 type: string
 *                 enum: [L, P]
 *               pekerjaan:
 *                 type: string
 *               pendidikan_terakhir:
 *                 type: string
 *               lama_menderita_ht:
 *                 type: string
 *               alamat:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pasien berhasil diregistrasi
 *       403:
 *         description: Akses ditolak
 */
router.post('/', authMiddleware, roleMiddleware('admin', 'perawat'), (req, res) => {
  res.json({ status: true, message: 'Registrasi pasien - coming soon', data: null });
});

/**
 * @swagger
 * /api/pasien/{id}:
 *   put:
 *     summary: Update data pasien
 *     tags: [Pasien]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Data pasien berhasil diupdate
 */
router.put('/:id', authMiddleware, roleMiddleware('admin', 'perawat', 'pasien'), (req, res) => {
  res.json({ status: true, message: 'Update pasien - coming soon', data: null });
});

/**
 * @swagger
 * /api/pasien/{pasienId}/keluarga:
 *   post:
 *     summary: Registrasi akun keluarga oleh pasien
 *     description: Pasien mendaftarkan anggota keluarga. Sistem auto-generate username & password.
 *     tags: [Pasien]
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
 *               - nama
 *               - hubungan
 *             properties:
 *               nama:
 *                 type: string
 *               hubungan:
 *                 type: string
 *                 enum: [Suami, Istri, Anak, Lainnya]
 *               pendidikan:
 *                 type: string
 *               pekerjaan:
 *                 type: string
 *               umur:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Akun keluarga berhasil dibuat, username & password digenerate otomatis
 */
router.post('/:pasienId/keluarga', authMiddleware, roleMiddleware('pasien'), (req, res) => {
  res.json({ status: true, message: 'Registrasi keluarga - coming soon', data: null });
});

module.exports = router;
