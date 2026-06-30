const { error } = require("../utils/response");

/**
 * Middleware untuk membatasi akses berdasarkan role
 * @param  {...string} roles - Role yang diizinkan (admin, perawat, pasien, keluarga)
 */
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, "Unauthorized", 401);
    }

    if (!roles.includes(req.user.role)) {
      return error(
        res,
        `Akses ditolak. Hanya role [${roles.join(", ")}] yang diizinkan.`,
        403,
      );
    }

    next();
  };
};

module.exports = roleMiddleware;
