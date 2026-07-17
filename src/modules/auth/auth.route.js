const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const { loginValidator, updateDeviceValidator } = require('../../middlewares/validators/auth.validator');

router.post('/login', loginValidator, validate, authController.login);
router.get('/me', authMiddleware, authController.me);
router.patch('/update-device', authMiddleware, updateDeviceValidator, validate, authController.updateDeviceId);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login pengguna
 *     description: >
 *       Login untuk semua role (admin, perawat, pasien, keluarga).
 *       Response menyertakan JWT token dan data profil sesuai role.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: budi123
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login berhasil
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: budi123
 *                         role:
 *                           type: string
 *                           example: pasien
 *                         profile:
 *                           type: object
 *                           description: Data profil sesuai role (pasien/perawat/keluarga), null untuk admin
 *       400:
 *         description: Username dan password wajib diisi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Username atau password salah
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Ambil data user yang sedang login
 *     description: Mengembalikan data user beserta profil lengkap sesuai role
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data user berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                     device_id:
 *                       type: string
 *                     profile:
 *                       type: object
 *                       description: Profil lengkap sesuai role
 *       401:
 *         description: Token tidak valid atau sudah expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/me", authMiddleware, authController.me);

/**
 * @swagger
 * /api/auth/update-device:
 *   patch:
 *     summary: Update FCM device_id user
 *     description: >
 *       Dipanggil setiap kali user login untuk memperbarui FCM token.
 *       Wajib dipanggil setelah login agar push notification bisa dikirim ke device yang benar.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - device_id
 *             properties:
 *               device_id:
 *                 type: string
 *                 example: "fcm_token_abc123xyz"
 *     responses:
 *       200:
 *         description: Device ID berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Device ID berhasil diupdate
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                     device_id:
 *                       type: string
 *       400:
 *         description: device_id wajib diisi
 *       401:
 *         description: Token tidak valid
 */
router.patch("/update-device", authMiddleware, authController.updateDeviceId);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout pengguna
 *     description: >
 *       Logout user dengan cara memblacklist token saat ini dan menghapus device_id
 *       agar push notification tidak lagi terkirim ke device tersebut.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout berhasil
 *                 data:
 *                   type: null
 *                   example: null
 *       401:
 *         description: Token tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
