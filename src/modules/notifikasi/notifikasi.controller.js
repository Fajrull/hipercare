const notifService = require('./notifikasi.service');
const { success, error } = require('../../utils/response');
const { sendNotification, sendMulticastNotification } = require('../../utils/fcm');
const prisma = require('../../config/database');

// NOTIF-08
const getRiwayatNotifikasi = async (req, res) => {
  try {
    const data = await notifService.getRiwayatNotifikasi(req.user.id);
    const belumDibaca = await notifService.countBelumDibaca(req.user.id);
    return success(res, { notifikasi: data, belum_dibaca: belumDibaca }, 'Notifikasi berhasil diambil');
  } catch (err) {
    return error(res, err.message);
  }
};

// NOTIF-09
const tandaiDibaca = async (req, res) => {
  try {
    const data = await notifService.tandaiDibaca(req.params.id, req.user.id);
    return success(res, data, 'Notifikasi ditandai sudah dibaca');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const tandaiSemuaDibaca = async (req, res) => {
  try {
    await notifService.tandaiSemuaDibaca(req.user.id);
    return success(res, null, 'Semua notifikasi ditandai sudah dibaca');
  } catch (err) {
    return error(res, err.message);
  }
};

// Test alarm minum obat
const testAlarmObat = async (req, res) => {
  try {
    const { kategori_waktu } = req.body;
    if (!kategori_waktu) return error(res, 'kategori_waktu wajib diisi', 400);

    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: { device_id: true },
    });

    if (!user?.device_id) return error(res, 'Device ID tidak ditemukan, pastikan sudah update device_id', 400);

    await sendNotification(
      user.device_id,
      `💊 Test: Waktunya Minum Obat ${kategori_waktu}`,
      `Ini adalah notifikasi test alarm minum obat ${kategori_waktu}`,
      { tipe: 'alarm_obat', kategori_waktu }
    );

    // Simpan ke DB
    await prisma.notifikasi.create({
      data: {
        user_id: req.user.id,
        judul: `💊 Test: Waktunya Minum Obat ${kategori_waktu}`,
        pesan: `Ini adalah notifikasi test alarm minum obat ${kategori_waktu}`,
        tipe: 'alarm_obat',
      },
    });

    return success(res, null, `Test notifikasi alarm obat ${kategori_waktu} berhasil dikirim`);
  } catch (err) {
    return error(res, err.message);
  }
};

// Test TD darurat
const testTDDarurat = async (req, res) => {
  try {
    const { pasien_id } = req.body;
    if (!pasien_id) return error(res, 'pasien_id wajib diisi', 400);

    const pasien = await prisma.pasien.findUnique({
      where: { id: parseInt(pasien_id) },
      include: {
        keluarga: { include: { user: { select: { id: true, device_id: true } } } },
        perawat_pasien: {
          include: { perawat: { include: { user: { select: { id: true, device_id: true } } } } },
        },
      },
    });
    if (!pasien) return error(res, 'Pasien tidak ditemukan', 404);

    const deviceIds = [
      ...pasien.keluarga.map((k) => k.user.device_id),
      ...pasien.perawat_pasien.map((pp) => pp.perawat.user.device_id),
    ].filter(Boolean);

    if (deviceIds.length === 0) return error(res, 'Tidak ada device ID keluarga/perawat yang terdaftar', 400);

    await sendMulticastNotification(
      deviceIds,
      '🚨 Test: Peringatan Tekanan Darah',
      'Ini adalah notifikasi test TD darurat (180/120 mmHg - Krisis HT)',
      { tipe: 'td_kritis', pasien_id: String(pasien_id) }
    );

    const targetUserIds = [
      ...pasien.keluarga.map((k) => k.user.id),
      ...pasien.perawat_pasien.map((pp) => pp.perawat.user.id),
    ];

    await prisma.notifikasi.createMany({
      data: targetUserIds.map((user_id) => ({
        user_id,
        judul: '🚨 Test: Peringatan Tekanan Darah',
        pesan: 'Ini adalah notifikasi test TD darurat (180/120 mmHg - Krisis HT)',
        tipe: 'td_kritis',
      })),
    });

    return success(res, { device_count: deviceIds.length }, 'Test notifikasi TD darurat berhasil dikirim');
  } catch (err) {
    return error(res, err.message);
  }
};

// Test reminder jadwal kontrol
const testKontrol = async (req, res) => {
  try {
    const { pasien_id } = req.body;
    if (!pasien_id) return error(res, 'pasien_id wajib diisi', 400);

    const pasien = await prisma.pasien.findUnique({
      where: { id: parseInt(pasien_id) },
      include: {
        user: { select: { id: true, device_id: true } },
        keluarga: { include: { user: { select: { id: true, device_id: true } } } },
      },
    });
    if (!pasien) return error(res, 'Pasien tidak ditemukan', 404);

    const targets = [
      { user_id: pasien.user.id, device_id: pasien.user.device_id },
      ...pasien.keluarga.map((k) => ({ user_id: k.user.id, device_id: k.user.device_id })),
    ];

    const deviceIds = targets.map((t) => t.device_id).filter(Boolean);

    if (deviceIds.length === 0) return error(res, 'Tidak ada device ID yang terdaftar', 400);

    await sendMulticastNotification(
      deviceIds,
      '📅 Test: Pengingat Jadwal Kontrol',
      'Ini adalah notifikasi test reminder jadwal kontrol dokter (H-1)',
      { tipe: 'pengingat_kontrol', pasien_id: String(pasien_id) }
    );

    await prisma.notifikasi.createMany({
      data: targets.map((t) => ({
        user_id: t.user_id,
        judul: '📅 Test: Pengingat Jadwal Kontrol',
        pesan: 'Ini adalah notifikasi test reminder jadwal kontrol dokter (H-1)',
        tipe: 'pengingat_kontrol',
      })),
    });

    return success(res, { device_count: deviceIds.length }, 'Test notifikasi jadwal kontrol berhasil dikirim');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { 
  getRiwayatNotifikasi, 
  tandaiDibaca, 
  tandaiSemuaDibaca,
  testAlarmObat,
  testTDDarurat,
  testKontrol,
};