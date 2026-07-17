require('dotenv').config();
const app = require('./app');
const { initScheduler } = require('./utils/scheduler');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 HiperCare API berjalan di http://localhost:${PORT}`);
  console.log(`📚 Swagger Docs tersedia di http://localhost:${PORT}/api-docs`);

  // Jalankan scheduler setelah server aktif
  initScheduler();
});