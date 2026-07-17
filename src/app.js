const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const morgan = require('morgan');
require("dotenv").config();


const app = express();
// const { globalLimiter } = require('./middlewares/rate-limit.middleware');
// const { loginLimiter } = require('./middlewares/rate-limit.middleware');

// Tambahkan setelah helmet & cors
// app.use(globalLimiter);

// Login route pakai limiter khusus
// app.use('/api/auth/login', loginLimiter);


// =============================================
// Middlewares Global
// =============================================
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('[:date[iso]] :method :url :status :response-time ms'));
app.use(cors());
app.use(express.json());

// =============================================
// Swagger Documentation
// =============================================
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "HiperCare API Docs",
    customCss: ".swagger-ui .topbar { background-color: #1a73e8; }",
  }),
);

// =============================================
// Routes
// =============================================
app.use("/api/auth", require("./modules/auth/auth.route"));
app.use("/api/pasien", require("./modules/pasien/pasien.route"));
app.use("/api/perawat", require("./modules/perawat/perawat.route"));
app.use("/api/obat", require("./modules/obat/obat.route"));
app.use(
  "/api/tekanan-darah",
  require("./modules/tekanan-darah/tekanan-darah.route"),
);
app.use("/api/diet-dash", require("./modules/diet-dash/diet-dash.route"));
app.use("/api/keluhan", require("./modules/keluhan/keluhan.route"));
app.use(
  "/api/jadwal-kontrol",
  require("./modules/jadwal-kontrol/jadwal-kontrol.route"),
);
app.use("/api/edukasi", require("./modules/edukasi/edukasi.route"));
app.use("/api/notifikasi", require("./modules/notifikasi/notifikasi.route"));
app.use("/api/badge", require("./modules/badge/badge.route"));
app.use('/api/laporan', require('./modules/laporan/laporan.route'));
app.use('/api/keluarga', require('./modules/keluarga/keluarga.route'));

// =============================================
// Health Check
// =============================================
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "HiperCare API is running",
    docs: "/api-docs",
  });
});

// =============================================
// 404 Handler
// =============================================
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
    data: null,
  });
});

// =============================================
// Global Error Handler
// =============================================
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.stack);

  // Handle Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({
      status: false,
      message: 'Data sudah ada (duplicate entry)',
      data: null,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      status: false,
      message: 'Data tidak ditemukan',
      data: null,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: false,
      message: 'Token tidak valid',
      data: null,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: false,
      message: 'Token sudah expired',
      data: null,
    });
  }

  return res.status(500).json({
    status: false,
    message: 'Internal Server Error',
    data: null,
  });
});

module.exports = app;
