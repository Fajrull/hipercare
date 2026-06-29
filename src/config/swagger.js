const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HiperCare API',
      version: '1.0.0',
      description:
        'API Documentation untuk Aplikasi HiperCare - Mobile Health Hipertensi Berbasis Family Centered Nursing',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan JWT token. Contoh: Bearer {token}',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            status: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            data: { type: 'null', example: null },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Autentikasi & Registrasi' },
      { name: 'Pasien', description: 'Manajemen data pasien' },
      { name: 'Perawat', description: 'Manajemen data perawat' },
      { name: 'Keluarga', description: 'Manajemen data keluarga' },
      { name: 'Obat', description: 'Master data obat' },
      { name: 'Obat Pasien', description: 'Obat spesifik pasien & kepatuhan' },
      { name: 'Tekanan Darah', description: 'Log tekanan darah harian' },
      { name: 'Diet DASH', description: 'Master menu & log konsumsi makanan' },
      { name: 'Keluhan', description: 'Keluhan klinis pasien' },
      { name: 'Jadwal Kontrol', description: 'Jadwal kontrol kesehatan' },
      { name: 'Edukasi', description: 'Materi edukasi FCN' },
      { name: 'Notifikasi', description: 'Push notification & riwayat notifikasi' },
      { name: 'Badge', description: 'Badge motivasi pasien' },
    ],
  },
  apis: ['./src/modules/**/*.route.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
