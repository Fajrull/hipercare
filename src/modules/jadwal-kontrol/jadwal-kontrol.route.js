const express = require("express");
const router = express.Router();
const jadwalController = require("./jadwal-kontrol.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const {
  tambahJadwalValidator,
} = require("../../middlewares/validators/jadwal.validator");

/**
 * @swagger
 * /api/jadwal-kontrol/{pasienId}:
 *   get:
 *     summary: Ambil daftar jadwal kontrol pasien
 *     description: >
 *       Response menyertakan field tambahan:
 *       - `selisih_hari`: berapa hari lagi jadwal tersebut
 *       - `status`: sudah_lewat / hari_ini / H-3 / H-1 / akan_datang
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
 *         description: Jadwal kontrol berhasil diambil
 */
router.get("/:pasienId", authMiddleware, jadwalController.getJadwal);

/**
 * @swagger
 * /api/jadwal-kontrol/{pasienId}:
 *   post:
 *     summary: Tambah jadwal kontrol baru
 *     description: >
 *       Menambah jadwal kontrol kesehatan pasien.
 *       Sistem otomatis kirim notifikasi ke pasien, keluarga, dan perawat saat jadwal dibuat.
 *       Reminder H-3, H-1, H-0 akan dikirim otomatis via scheduler (NOTIF-06).
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
 *                 example: "2026-07-15"
 *               jam:
 *                 type: string
 *                 example: "09:00"
 *                 description: Format HH:mm
 *               lokasi_faskes:
 *                 type: string
 *                 example: Puskesmas Kebayoran Baru
 *               nama_dokter:
 *                 type: string
 *                 example: dr. Siti Rahayu
 *     responses:
 *       201:
 *         description: Jadwal kontrol berhasil ditambahkan
 *       400:
 *         description: Validasi gagal atau jadwal di masa lalu
 */
router.post(
  "/:pasienId",
  authMiddleware,
  roleMiddleware("pasien", "perawat"),
  tambahJadwalValidator,
  validate,
  jadwalController.tambahJadwal,
);

/**
 * @swagger
 * /api/jadwal-kontrol/{pasienId}/{jadwalId}:
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
 *         name: jadwalId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jadwal kontrol berhasil dihapus
 *       400:
 *         description: Jadwal tidak ditemukan
 */
router.delete(
  "/:pasienId/:jadwalId",
  authMiddleware,
  roleMiddleware("pasien", "perawat"),
  jadwalController.deleteJadwal,
);

/**
 * @swagger
 * /api/jadwal-kontrol/{pasienId}/{jadwalId}:
 *   put:
 *     summary: Update jadwal kontrol
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
 *         name: jadwalId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tanggal:
 *                 type: string
 *                 format: date
 *               jam:
 *                 type: string
 *                 example: "10:00"
 *               lokasi_faskes:
 *                 type: string
 *               nama_dokter:
 *                 type: string
 *     responses:
 *       200:
 *         description: Jadwal kontrol berhasil diupdate
 */
router.put(
  "/:pasienId/:jadwalId",
  authMiddleware,
  roleMiddleware("pasien", "perawat"),
  jadwalController.updateJadwal,
);

module.exports = router;
