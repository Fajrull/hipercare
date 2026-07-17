const rateLimit = require('express-rate-limit');

// Rate limit umum untuk semua endpoint
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // max 100 request per 15 menit per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: false,
    message: 'Terlalu banyak request, coba lagi setelah 15 menit',
    data: null,
  },
});

// Rate limit khusus login — lebih ketat
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // max 10 percobaan login per 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: false,
    message: 'Terlalu banyak percobaan login, coba lagi setelah 15 menit',
    data: null,
  },
});

module.exports = { globalLimiter, loginLimiter };