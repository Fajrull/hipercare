const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../config/database");
const jwtConfig = require("../../config/jwt");

// =============================================
// In-memory token blacklist untuk logout
// Di production sebaiknya pakai Redis
// =============================================
const tokenBlacklist = new Set();

const isTokenBlacklisted = (token) => tokenBlacklist.has(token);
const blacklistToken = (token) => tokenBlacklist.add(token);

// =============================================
// AUTH-01: Login
// =============================================
const login = async (username, password) => {
  const user = await prisma.users.findUnique({ where: { username } });

  if (!user) {
    throw new Error("Username atau password salah");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Username atau password salah");
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn },
  );

  // Ambil data profil sesuai role
  let profile = null;
  if (user.role === "pasien") {
    profile = await prisma.pasien.findUnique({
      where: { user_id: user.id },
      select: { id: true, nama: true },
    });
  } else if (user.role === "perawat") {
    profile = await prisma.perawat.findUnique({
      where: { user_id: user.id },
      select: { id: true, nama: true, no_wa: true },
    });
  } else if (user.role === "keluarga") {
    profile = await prisma.keluarga.findUnique({
      where: { user_id: user.id },
      select: { id: true, nama: true, pasien_id: true },
    });
  }

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      profile,
    },
  };
};

// =============================================
// AUTH-02: Get Me
// =============================================
const me = async (userId) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      role: true,
      device_id: true,
      created_at: true,
      pasien: {
        select: {
          id: true,
          nama: true,
          umur: true,
          jenis_kelamin: true,
          pekerjaan: true,
          pendidikan_terakhir: true,
          lama_menderita_ht: true,
          alamat: true,
        },
      },
      perawat: {
        select: {
          id: true,
          nama: true,
          umur: true,
          jenis_kelamin: true,
          no_wa: true,
        },
      },
      keluarga: {
        select: {
          id: true,
          nama: true,
          hubungan: true,
          pasien_id: true,
        },
      },
    },
  });

  if (!user) throw new Error("User tidak ditemukan");

  // Rapikan response: ambil profile sesuai role
  const { pasien, perawat, keluarga, ...userData } = user;
  const profileMap = { pasien, perawat, keluarga };
  userData.profile = profileMap[user.role] || null;

  return userData;
};

// =============================================
// AUTH-03: Update Device ID
// =============================================
const updateDeviceId = async (userId, deviceId) => {
  const updated = await prisma.users.update({
    where: { id: userId },
    data: { device_id: deviceId },
    select: { id: true, username: true, role: true, device_id: true },
  });
  return updated;
};

// =============================================
// AUTH-04: Logout
// =============================================
const logout = async (token, userId) => {
  // Blacklist token yang sedang dipakai
  blacklistToken(token);

  // Clear device_id agar FCM tidak terkirim ke device yang sudah logout
  await prisma.users.update({
    where: { id: userId },
    data: { device_id: null },
  });

  return true;
};

module.exports = {
  login,
  me,
  updateDeviceId,
  logout,
  isTokenBlacklisted,
};
