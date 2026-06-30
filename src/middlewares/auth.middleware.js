const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const { error } = require("../utils/response");
const { isTokenBlacklisted } = require("../modules/auth/auth.service");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return error(
      res,
      "Token tidak ditemukan. Silakan login terlebih dahulu.",
      401,
    );
  }

  // Cek apakah token sudah di-blacklist (logout)
  if (isTokenBlacklisted(token)) {
    return error(res, "Token sudah tidak valid. Silakan login kembali.", 401);
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    req.token = token; // simpan token untuk keperluan logout
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return error(res, "Token sudah expired. Silakan login kembali.", 401);
    }
    return error(res, "Token tidak valid.", 401);
  }
};

module.exports = authMiddleware;
