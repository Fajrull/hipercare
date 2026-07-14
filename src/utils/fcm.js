const admin = require('firebase-admin');

let firebaseReady = false;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    // Handle berbagai format private key di environment variable
    privateKey = privateKey
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '')
      .trim();

    if (!privateKey.includes('\n')) {
      privateKey = privateKey
        .replace('-----BEGIN RSA PRIVATE KEY-----', '-----BEGIN RSA PRIVATE KEY-----\n')
        .replace('-----END RSA PRIVATE KEY-----', '\n-----END RSA PRIVATE KEY-----');
}

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
    const response = await admin.messaging().send({
      token: deviceId,
      notification: { title, body },
      data,
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
    const response = await admin.messaging().sendEachForMulticast({
      tokens: validDevices,
      notification: { title, body },
      data,
    });
    console.log(`FCM: ${response.successCount} berhasil, ${response.failureCount} gagal`);
    return response;
  } catch (err) {
    console.error('FCM multicast gagal:', err.message);
    return null;
  }
};

module.exports = { sendNotification, sendMulticastNotification };