const cron = require('node-cron');
const prisma = require('../config/database');
const { sendMulticastNotification, sendNotification } = require('./fcm');
const { getJadwalUntukReminder } = require('../modules/jadwal-kontrol/jadwal-kontrol.service');

// =============================================
// NOTIF-04 & NOTIF-05: Alarm Minum Obat
// Jadwal: setiap Pagi (06:00), Siang (12:00), Malam (18:00)
// Repeat tiap 5 menit jika belum dikonfirmasi (NOTIF-05)
// =============================================
const jalankanAlarmObat = async (kategoriWaktu) => {
  console.log(`🔔 Scheduler: Alarm obat ${kategoriWaktu} dijalankan`);

  // Ambil semua obat pasien sesuai waktu minum
  const obatList = await prisma.obatPasien.findMany({
    where: { kategori_waktu: kategoriWaktu },
    include: {
      pasien: {
        include: {
          user: { select: { id: true, device_id: true } },
          keluarga: {
            include: { user: { select: { id: true, device_id: true } } },
          },
        },
      },
      master_obat: true,
    },
  });

  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  for (const obat of obatList) {
    // Cek apakah sudah dikonfirmasi hari ini
    const sudahKonfirmasi = await prisma.logKepatuhanObat.findFirst({
      where: {
        obat_pasien_id: obat.id,
        tanggal: hariIni,
        kategori_waktu: kategoriWaktu,
        status: { in: ['diminum', 'tidak_diminum'] },
      },
    });

    // NOTIF-05: Skip jika sudah dikonfirmasi
    if (sudahKonfirmasi) continue;

    const pasienDeviceId = obat.pasien.user.device_id;
    const judulNotif = `💊 Waktunya Minum Obat ${kategoriWaktu}`;
    const pesanNotif = `Jangan lupa minum ${obat.master_obat.nama_obat} ${obat.dosis || ''}`;

    // Kirim ke pasien
    if (pasienDeviceId) {
      await sendNotification(
        pasienDeviceId,
        judulNotif,
        pesanNotif,
        { tipe: 'alarm_obat', obat_pasien_id: String(obat.id), kategori_waktu: kategoriWaktu }
      );
    }

    // NOTIF-03: Cek stok menipis sekalian
    if (obat.jumlah_stok <= 3 && obat.jumlah_stok > 0) {
      const stokPesan = `Stok ${obat.master_obat.nama_obat} tinggal ${obat.jumlah_stok} tablet. Segera tebus resep!`;

      if (pasienDeviceId) {
        await sendNotification(
          pasienDeviceId,
          '⚠️ Stok Obat Menipis',
          stokPesan,
          { tipe: 'stok_menipis', obat_pasien_id: String(obat.id) }
        );
      }

      // Simpan notifikasi stok menipis ke DB
      await prisma.notifikasi.create({
        data: {
          user_id: obat.pasien.user.id,
          judul: '⚠️ Stok Obat Menipis',
          pesan: stokPesan,
          tipe: 'stok_menipis',
        },
      });
    }

    // Simpan alarm obat ke DB
    await prisma.notifikasi.create({
      data: {
        user_id: obat.pasien.user.id,
        judul: judulNotif,
        pesan: pesanNotif,
        tipe: 'alarm_obat',
      },
    });
  }
};

// =============================================
// NOTIF-06: Reminder Jadwal Kontrol H-3, H-1, H-0
// Jadwal: setiap hari pukul 07:00
// =============================================
const jalankanReminderKontrol = async () => {
  console.log('📅 Scheduler: Reminder jadwal kontrol dijalankan');

  const jadwalList = await getJadwalUntukReminder();

  for (const jadwal of jadwalList) {
    const selisih = jadwal.selisih_hari;
    let labelHari;
    if (selisih === 0) labelHari = 'hari ini';
    else if (selisih === 1) labelHari = 'besok (H-1)';
    else labelHari = `${selisih} hari lagi (H-${selisih})`;

    const judul = '📅 Pengingat Jadwal Kontrol';
    const pesan = `Jadwal kontrol ${labelHari} pukul ${new Date(jadwal.jam).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}${jadwal.lokasi_faskes ? ` di ${jadwal.lokasi_faskes}` : ''}`;

    // Kumpulkan semua target notifikasi (pasien + keluarga)
    const targets = [
      { user_id: jadwal.pasien.user.id, device_id: jadwal.pasien.user.device_id },
      ...jadwal.pasien.keluarga.map((k) => ({
        user_id: k.user.id,
        device_id: k.user.device_id,
      })),
    ];

    const deviceIds = targets.map((t) => t.device_id).filter(Boolean);

    // Kirim FCM
    if (deviceIds.length > 0) {
      await sendMulticastNotification(
        deviceIds,
        judul,
        pesan,
        { tipe: 'pengingat_kontrol', jadwal_id: String(jadwal.id) }
      );
    }

    // Simpan ke DB notifikasi
    if (targets.length > 0) {
      await prisma.notifikasi.createMany({
        data: targets.map((t) => ({
          user_id: t.user_id,
          judul,
          pesan,
          tipe: 'pengingat_kontrol',
        })),
        skipDuplicates: true,
      });
    }
  }
};

// =============================================
// Registrasi semua scheduler
// =============================================
const initScheduler = () => {
  // NOTIF-04: Alarm obat pertama kali di jam minum
  cron.schedule('0 6 * * *', () => jalankanAlarmObat('Pagi'), {
    timezone: 'Asia/Jakarta',
  });
  cron.schedule('0 12 * * *', () => jalankanAlarmObat('Siang'), {
    timezone: 'Asia/Jakarta',
  });
  cron.schedule('0 18 * * *', () => jalankanAlarmObat('Malam'), {
    timezone: 'Asia/Jakarta',
  });

  // NOTIF-05: Repeat alarm setiap 5 menit jika belum dikonfirmasi
  // Pagi: 06:05 - 07:00 | Siang: 12:05 - 13:00 | Malam: 18:05 - 19:00
  cron.schedule('5,10,15,20,25,30,35,40,45,50,55 6 * * *', () => jalankanAlarmObat('Pagi'), {
    timezone: 'Asia/Jakarta',
  });
  cron.schedule('5,10,15,20,25,30,35,40,45,50,55 12 * * *', () => jalankanAlarmObat('Siang'), {
    timezone: 'Asia/Jakarta',
  });
  cron.schedule('5,10,15,20,25,30,35,40,45,50,55 18 * * *', () => jalankanAlarmObat('Malam'), {
    timezone: 'Asia/Jakarta',
  });

  // NOTIF-06: Reminder jadwal kontrol setiap hari jam 07:00
  cron.schedule('0 7 * * *', () => jalankanReminderKontrol(), {
    timezone: 'Asia/Jakarta',
  });

  console.log('✅ Scheduler aktif: alarm obat & reminder kontrol');
};

module.exports = { initScheduler };