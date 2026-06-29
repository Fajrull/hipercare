const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const { error } = require("../utils/response");

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

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, "Token tidak valid atau sudah expired.", 401);
  }
};

module.exports = authMiddleware;
