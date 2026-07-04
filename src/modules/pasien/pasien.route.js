const express = require("express");
const router = express.Router();
const pasienController = require("./pasien.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

/**
 * @swagger
 * /api/pasien:
 *   get:
 *     summary: Ambil semua pasien
 *     description: Admin dapat lihat semua pasien. Perawat hanya lihat pasien yang di-assign ke dia.
 *     tags: [Pasien]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar pasien berhasil diambil
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "perawat"),
  pasienController.getAllPasien,
);

/**
 * @swagger
 * /api/pasien/{id}:
 *   get:
 *     summary: Ambil detail pasien
 *     tags: [Pasien]
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
 *         description: Detail pasien berhasil diambil
 *       404:
 *         description: Pasien tidak ditemukan
 */
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "perawat", "pasien", "keluarga"),
  pasienController.getPasienById,
);

/**
 * @swagger
 * /api/pasien:
 *   post:
 *     summary: Registrasi pasien baru (by perawat)
 *     description: >
 *       Perawat registrasi pasien baru. Gunakan `auto_generate: true` untuk
 *       auto-generate username & password. Perawat yang melakukan registrasi
 *       akan otomatis di-assign ke pasien tersebut.
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
 *             properties:
 *               nama:
 *                 type: string
 *                 example: Budi Santoso
 *               umur:
 *                 type: integer
 *                 example: 55
 *               jenis_kelamin:
 *                 type: string
 *                 enum: [L, P]
 *               pekerjaan:
 *                 type: string
 *               pendidikan_terakhir:
 *                 type: string
 *               lama_menderita_ht:
 *                 type: string
 *                 example: 3 tahun
 *               alamat:
 *                 type: string
 *               username:
 *                 type: string
 *                 description: Wajib jika auto_generate false
 *               password:
 *                 type: string
 *                 description: Wajib jika auto_generate false
 *               auto_generate:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Pasien berhasil diregistrasi. Response menyertakan username & password untuk diberikan ke pasien.
 *       400:
 *         description: Validasi gagal atau username sudah digunakan
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("perawat"),
  pasienController.registrasiPasien,
);

/**
 * @swagger
 * /api/pasien/{id}:
 *   put:
 *     summary: Update biodata pasien
 *     tags: [Pasien]
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
 *         description: Data pasien berhasil diupdate
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "perawat", "pasien"),
  pasienController.updatePasien,
);

/**
 * @swagger
 * /api/pasien/{pasienId}/keluarga:
 *   post:
 *     summary: Registrasi akun keluarga (by pasien)
 *     description: >
 *       Pasien mendaftarkan anggota keluarga sebagai caregiver.
 *       Username & password di-generate otomatis oleh sistem.
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
 *                 example: Siti Rahayu
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
 *         description: Akun keluarga berhasil dibuat. Response menyertakan username & password.
 */
router.post(
  "/:pasienId/keluarga",
  authMiddleware,
  roleMiddleware("pasien"),
  pasienController.registrasiKeluarga,
);

/**
 * @swagger
 * /api/pasien/{pasienId}/keluarga/{keluargaId}:
 *   put:
 *     summary: Update data keluarga
 *     tags: [Pasien]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: keluargaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Data keluarga berhasil diupdate
 */
router.put(
  "/:pasienId/keluarga/:keluargaId",
  authMiddleware,
  roleMiddleware("pasien", "admin"),
  pasienController.updateKeluarga,
);

/**
 * @swagger
 * /api/pasien/{pasienId}/keluarga/{keluargaId}:
 *   delete:
 *     summary: Hapus akun keluarga
 *     tags: [Pasien]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: keluargaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Akun keluarga berhasil dihapus
 */
router.delete(
  "/:pasienId/keluarga/:keluargaId",
  authMiddleware,
  roleMiddleware("pasien", "admin"),
  pasienController.deleteKeluarga,
);

module.exports = router;
