const admin = require('firebase-admin');

let firebaseReady = false;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  
  // Gunakan base64 jika tersedia, fallback ke raw
  let privateKey;
  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
  } else {
    privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    // Handle berbagai format private key di environment variable
    privateKey = privateKey.replace(/\\n/g, '\n');

    // Handle jika private key dibungkus tanda kutip
    if (privateKey.startsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
    firebaseReady = true;
    console.log('✅ Firebase FCM siap digunakan');
  } else {
    console.warn('⚠️  Firebase env belum dikonfigurasi, push notification dinonaktifkan');
  }
} catch (err) {
  // Jangan throw — cukup log agar server tetap jalan
  console.warn('⚠️  Firebase gagal diinisialisasi:', err.message);
  firebaseReady = false;
}

const sendNotification = async (deviceId, title, body, data = {}) => {
  if (!firebaseReady) {
    console.warn('FCM skip: Firebase belum dikonfigurasi');
    return null;
  }
  if (!deviceId) return null;

  try {
    // Konversi semua value data ke string
    const stringData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    );

    const messaging = admin.messaging();
    if (!messaging) throw new Error('Firebase messaging tidak tersedia');

    const response = await messaging.send({
      token: deviceId,
      notification: { title, body },
      data: stringData,
    });
    console.log('FCM terkirim:', response);
    return response;
  } catch (err) {
    console.error('FCM gagal:', err.message);
    return null;
  }
};

const sendMulticastNotification = async (deviceIds, title, body, data = {}) => {
  if (!firebaseReady) {
    console.warn('FCM skip: Firebase belum dikonfigurasi');
    return null;
  }

  const validDevices = deviceIds.filter(Boolean);
  if (validDevices.length === 0) return null;

  try {
    // Konversi semua value data ke string
    const stringData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    );

    const messaging = admin.messaging();
    if (!messaging) throw new Error('Firebase messaging tidak tersedia');

    const response = await messaging.sendEachForMulticast({
      tokens: validDevices,
      notification: { title, body },
      data: stringData,
    });
    console.log(`FCM: ${response.successCount} berhasil, ${response.failureCount} gagal`);
    return response;
  } catch (err) {
    console.error('FCM multicast gagal:', err.message);
    return null;
  }
};

module.exports = { sendNotification, sendMulticastNotification };