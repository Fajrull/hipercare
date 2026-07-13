const express = require("express");
const router = express.Router();
const keluhanController = require("./keluhan.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

/**
 * @swagger
 * /api/keluhan/{pasienId}:
 *   get:
 *     summary: Ambil riwayat keluhan klinis pasien
 *     tags: [Keluhan]
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
 *         description: Riwayat keluhan berhasil diambil
 */
router.get("/:pasienId", authMiddleware, keluhanController.getRiwayatKeluhan);

/**
 * @swagger
 * /api/keluhan/{pasienId}:
 *   post:
 *     summary: Input keluhan klinis baru
 *     description: >
 *       Bisa dilakukan oleh pasien, keluarga, atau perawat.
 *       Sistem otomatis kirim notifikasi FCM ke semua perawat yang menangani pasien.
 *     tags: [Keluhan]
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
 *               - keluhan
 *             properties:
 *               tanggal:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-05"
 *               keluhan:
 *                 type: string
 *                 example: Kepala pusing dan tengkuk terasa berat sejak pagi
 *     responses:
 *       201:
 *         description: Keluhan berhasil disimpan, notifikasi dikirim ke perawat
 *       400:
 *         description: Validasi gagal
 */
router.post(
  "/:pasienId",
  authMiddleware,
  roleMiddleware("pasien", "keluarga", "perawat"),
  keluhanController.inputKeluhan,
);

/**
 * @swagger
 * /api/keluhan/{pasienId}/{keluhanId}:
 *   put:
 *     summary: Update keluhan klinis
 *     description: Hanya yang menginput keluhan yang bisa mengubah, kecuali admin
 *     tags: [Keluhan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: keluhanId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tanggal:
 *                 type: string
 *                 format: date
 *               keluhan:
 *                 type: string
 *     responses:
 *       200:
 *         description: Keluhan berhasil diupdate
 *       400:
 *         description: Tidak punya akses atau validasi gagal
 */
router.put(
  "/:pasienId/:keluhanId",
  authMiddleware,
  roleMiddleware("pasien", "keluarga", "perawat", "admin"),
  keluhanController.updateKeluhan,
);

/**
 * @swagger
 * /api/keluhan/{pasienId}/{keluhanId}:
 *   delete:
 *     summary: Hapus keluhan klinis
 *     description: Hanya yang menginput keluhan yang bisa menghapus, kecuali admin
 *     tags: [Keluhan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: keluhanId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Keluhan berhasil dihapus
 *       400:
 *         description: Tidak punya akses
 */
router.delete(
  "/:pasienId/:keluhanId",
  authMiddleware,
  roleMiddleware("pasien", "keluarga", "perawat", "admin"),
  keluhanController.deleteKeluhan,
);

module.exports = router;
