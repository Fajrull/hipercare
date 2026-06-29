const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/database');
const jwtConfig = require('../../config/jwt');

const login = async (username, password) => {
  const user = await prisma.users.findUnique({ where: { username } });

  if (!user) {
    throw new Error('Username atau password salah');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Username atau password salah');
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  };
};

const me = async (userId) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      role: true,
      created_at: true,
    },
  });

  if (!user) throw new Error('User tidak ditemukan');
  return user;
};

const updateDeviceId = async (userId, deviceId) => {
  return await prisma.users.update({
    where: { id: userId },
    data: { device_id: deviceId },
    select: { id: true, username: true, device_id: true },
  });
};

module.exports = { login, me, updateDeviceId };
