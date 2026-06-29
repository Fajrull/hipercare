const admin = require('firebase-admin');

// Inisialisasi Firebase Admin SDK
// Pastikan environment variable sudah di-set di .env
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

/**
 * Kirim push notification ke satu device
 * @param {string} deviceId - FCM token device tujuan
 * @param {string} title - Judul notifikasi
 * @param {string} body - Isi pesan notifikasi
 * @param {object} data - Data tambahan (opsional)
 */
const sendNotification = async (deviceId, title, body, data = {}) => {
  if (!deviceId) {
    console.warn('FCM: device_id tidak ditemukan, notifikasi tidak dikirim.');
    return null;
  }

  const message = {
    token: deviceId,
    notification: { title, body },
    data,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('FCM: Notifikasi berhasil dikirim:', response);
    return response;
  } catch (err) {
    console.error('FCM: Gagal mengirim notifikasi:', err.message);
    return null;
  }
};

/**
 * Kirim push notification ke banyak device sekaligus
 * @param {string[]} deviceIds - Array FCM token
 * @param {string} title - Judul notifikasi
 * @param {string} body - Isi pesan notifikasi
 * @param {object} data - Data tambahan (opsional)
 */
const sendMulticastNotification = async (deviceIds, title, body, data = {}) => {
  const validDevices = deviceIds.filter(Boolean);
  if (validDevices.length === 0) {
    console.warn('FCM: Tidak ada device_id valid, notifikasi tidak dikirim.');
    return null;
  }

  const message = {
    tokens: validDevices,
    notification: { title, body },
    data,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`FCM: ${response.successCount} berhasil, ${response.failureCount} gagal`);
    return response;
  } catch (err) {
    console.error('FCM: Gagal mengirim multicast notifikasi:', err.message);
    return null;
  }
};

module.exports = { sendNotification, sendMulticastNotification };
