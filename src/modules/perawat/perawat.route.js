const express = require("express");
const router = express.Router();
const perawatController = require("./perawat.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

/**
 * @swagger
 * /api/perawat:
 *   get:
 *     summary: Ambil semua perawat
 *     tags: [Perawat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar perawat berhasil diambil
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  perawatController.getAllPerawat,
);

/**
 * @swagger
 * /api/perawat/{id}:
 *   get:
 *     summary: Ambil detail perawat
 *     tags: [Perawat]
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
 *         description: Detail perawat berhasil diambil
 */
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  perawatController.getPerawatById,
);

/**
 * @swagger
 * /api/perawat:
 *   post:
 *     summary: Tambah perawat baru
 *     tags: [Perawat]
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
 *                 example: Ns. Dewi Kusuma
 *               umur:
 *                 type: integer
 *                 example: 30
 *               jenis_kelamin:
 *                 type: string
 *                 enum: [L, P]
 *               no_wa:
 *                 type: string
 *                 example: "08123456789"
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Perawat berhasil ditambahkan
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  perawatController.createPerawat,
);

/**
 * @swagger
 * /api/perawat/{id}:
 *   put:
 *     summary: Update data perawat
 *     tags: [Perawat]
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
 *         description: Data perawat berhasil diupdate
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  perawatController.updatePerawat,
);

/**
 * @swagger
 * /api/perawat/{id}:
 *   delete:
 *     summary: Hapus perawat
 *     tags: [Perawat]
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
 *         description: Perawat berhasil dihapus
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  perawatController.deletePerawat,
);

/**
 * @swagger
 * /api/perawat/{perawatId}/assign:
 *   post:
 *     summary: Assign pasien ke perawat
 *     tags: [Perawat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: perawatId
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
 *               - pasien_id
 *             properties:
 *               pasien_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Pasien berhasil di-assign
 */
router.post(
  "/:perawatId/assign",
  authMiddleware,
  roleMiddleware("admin"),
  perawatController.assignPasien,
);

/**
 * @swagger
 * /api/perawat/{perawatId}/assign/{pasienId}:
 *   delete:
 *     summary: Unassign pasien dari perawat
 *     tags: [Perawat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: perawatId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: pasienId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pasien berhasil di-unassign
 */
router.delete(
  "/:perawatId/assign/:pasienId",
  authMiddleware,
  roleMiddleware("admin"),
  perawatController.unassignPasien,
);

module.exports = router;
