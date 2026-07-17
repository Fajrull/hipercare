const express = require('express');
const router = express.Router();
const keluargaController = require('./keluarga.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

/**
 * @swagger
 * /api/keluarga/profil:
 *   put:
 *     summary: Update profil keluarga (by keluarga sendiri)
 *     description: Keluarga update data profilnya sendiri berdasarkan token login
 *     tags: [Keluarga]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *       200:
 *         description: Profil keluarga berhasil diupdate
 *       400:
 *         description: Data keluarga tidak ditemukan
 */
router.put('/profil', authMiddleware, roleMiddleware('keluarga'), keluargaController.updateProfilKeluarga);

module.exports = router;