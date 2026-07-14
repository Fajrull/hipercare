const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
require("dotenv").config();

const app = express();

// =============================================
// Middlewares Global
// =============================================
app.use(helmet({ contentSecurityPolicy: false }));
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
// app.use("/api/perawat", require("./modules/perawat/perawat.route"));
// app.use("/api/obat", require("./modules/obat/obat.route"));
// app.use(
//   "/api/tekanan-darah",
//   require("./modules/tekanan-darah/tekanan-darah.route"),
// );
// app.use("/api/diet-dash", require("./modules/diet-dash/diet-dash.route"));
// app.use("/api/keluhan", require("./modules/keluhan/keluhan.route"));
// app.use(
//   "/api/jadwal-kontrol",
//   require("./modules/jadwal-kontrol/jadwal-kontrol.route"),
// );
app.use("/api/edukasi", require("./modules/edukasi/edukasi.route"));
app.use("/api/notifikasi", require("./modules/notifikasi/notifikasi.route"));
app.use("/api/badge", require("./modules/badge/badge.route"));

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
  console.error(err.stack);
  res.status(500).json({
    status: false,
    message: "Internal Server Error",
    data: null,
  });
});

module.exports = app;
