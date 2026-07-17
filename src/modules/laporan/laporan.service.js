const PDFDocument = require('pdfkit');
const prisma = require('../../config/database');

// =============================================
// Helper: Parse filter tanggal
// =============================================
const getDateRange = (filter, startDate, endDate) => {
  const sekarang = new Date();
  let dari, sampai;

  if (filter === 'mingguan') {
    dari = new Date(sekarang);
    dari.setDate(dari.getDate() - 7);
    sampai = sekarang;
  } else if (filter === 'bulanan') {
    dari = new Date(sekarang);
    dari.setMonth(dari.getMonth() - 1);
    sampai = sekarang;
  } else if (filter === 'custom' && startDate && endDate) {
    dari = new Date(startDate);
    sampai = new Date(endDate);
    sampai.setHours(23, 59, 59, 999);
  } else {
    dari = new Date(sekarang);
    dari.setMonth(dari.getMonth() - 1);
    sampai = sekarang;
  }

  return { dari, sampai };
};

// =============================================
// Helper: Format tanggal Indonesia
// =============================================
const formatTanggal = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatTanggalPendek = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// =============================================
// Helper: Gambar header PDF
// =============================================
const drawHeader = (doc, judulLaporan, pasien, periode) => {
  // Background header
  doc.rect(0, 0, doc.page.width, 100).fill('#1a73e8');

  // Judul
  doc
    .fillColor('#ffffff')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('HiperCare', 40, 25)
    .fontSize(11)
    .font('Helvetica')
    .text(judulLaporan, 40, 52);

  // Info periode di kanan
  doc
    .fontSize(9)
    .text(`Periode: ${formatTanggalPendek(periode.dari)} - ${formatTanggalPendek(periode.sampai)}`, 40, 72);

  doc.fillColor('#000000').moveDown();

  // Info pasien
  doc.y = 115;
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Data Pasien', 40, doc.y)
    .font('Helvetica')
    .fontSize(9);

  const infoX = 40;
  doc.text(`Nama       : ${pasien.nama}`, infoX, doc.y + 5);
  doc.text(`Umur       : ${pasien.umur || '-'} tahun`, infoX, doc.y + 5);
  doc.text(`Jenis Kelamin : ${pasien.jenis_kelamin === 'L' ? 'Laki-laki' : pasien.jenis_kelamin === 'P' ? 'Perempuan' : '-'}`, infoX, doc.y + 5);
  doc.text(`Lama HT    : ${pasien.lama_menderita_ht || '-'}`, infoX, doc.y + 5);

  // Garis pemisah
  doc.y += 15;
  doc
    .moveTo(40, doc.y)
    .lineTo(doc.page.width - 40, doc.y)
    .stroke('#cccccc');

  doc.y += 10;
};

// =============================================
// Helper: Gambar footer PDF
// =============================================
const drawFooter = (doc) => {
  const bottomY = doc.page.height - 40;
  doc
    .moveTo(40, bottomY)
    .lineTo(doc.page.width - 40, bottomY)
    .stroke('#cccccc');

  doc
    .fontSize(8)
    .fillColor('#888888')
    .text(
      `Dicetak oleh sistem HiperCare pada ${formatTanggal(new Date())}`,
      40,
      bottomY + 8,
      { align: 'center' }
    );
};

// =============================================
// Helper: Gambar tabel sederhana
// =============================================
const drawTable = (doc, headers, rows, startY) => {
  const colWidth = (doc.page.width - 80) / headers.length;
  let y = startY;

  // Header tabel
  doc.rect(40, y, doc.page.width - 80, 20).fill('#1a73e8');
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');

  headers.forEach((header, i) => {
    doc.text(header, 45 + i * colWidth, y + 6, { width: colWidth - 5 });
  });

  y += 20;
  doc.fillColor('#000000').font('Helvetica').fontSize(8);

  // Baris data
  rows.forEach((row, rowIndex) => {
    // Cek page break
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 40;
    }

    // Background alternating
    if (rowIndex % 2 === 0) {
      doc.rect(40, y, doc.page.width - 80, 18).fill('#f5f5f5');
    }

    doc.fillColor('#000000');
    row.forEach((cell, i) => {
      doc.text(String(cell ?? '-'), 45 + i * colWidth, y + 5, {
        width: colWidth - 5,
      });
    });

    y += 18;
  });

  return y;
};

// =============================================
// Helper: Kotak summary
// =============================================
const drawSummaryBox = (doc, items, startY) => {
  const boxWidth = (doc.page.width - 80) / items.length;
  let y = startY;

  items.forEach((item, i) => {
    const x = 40 + i * boxWidth;
    doc.rect(x, y, boxWidth - 5, 55).fill('#f0f4ff').stroke('#1a73e8');
    doc
      .fillColor('#1a73e8')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(item.nilai, x + 5, y + 8, { width: boxWidth - 15, align: 'center' });
    doc
      .fillColor('#333333')
      .fontSize(8)
      .font('Helvetica')
      .text(item.label, x + 5, y + 32, { width: boxWidth - 15, align: 'center' });
  });

  return y + 65;
};

// =============================================
// LAPORAN-01: Ekspor Laporan Tekanan Darah PDF
// =============================================
const generateLaporanTD = async (pasienId, filter, startDate, endDate) => {
  const { dari, sampai } = getDateRange(filter, startDate, endDate);

  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
  });
  if (!pasien) throw new Error('Pasien tidak ditemukan');

  const records = await prisma.tekananDarah.findMany({
    where: {
      pasien_id: parseInt(pasienId),
      tanggal: { gte: dari, lte: sampai },
    },
    orderBy: { tanggal: 'asc' },
  });

  // Hitung summary
  const total = records.length;
  const emergency = records.filter((r) => r.is_emergency).length;
  const avgSistolik = total > 0
    ? Math.round(records.reduce((s, r) => s + r.sistolik, 0) / total)
    : 0;
  const avgDiastolik = total > 0
    ? Math.round(records.reduce((s, r) => s + r.diastolik, 0) / total)
    : 0;

  // Distribusi klasifikasi
  const distribusi = {};
  records.forEach((r) => {
    distribusi[r.klasifikasi] = (distribusi[r.klasifikasi] || 0) + 1;
  });

  // Generate PDF
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const buffers = [];

  doc.on('data', (chunk) => buffers.push(chunk));

  drawHeader(doc, 'Laporan Pemantauan Tekanan Darah', pasien, { dari, sampai });

  // Summary boxes
  doc.fontSize(10).font('Helvetica-Bold').text('Ringkasan', 40, doc.y);
  doc.y += 8;

  doc.y = drawSummaryBox(doc, [
    { nilai: total.toString(), label: 'Total Pengukuran' },
    { nilai: `${avgSistolik}/${avgDiastolik}`, label: 'Rata-rata (mmHg)' },
    { nilai: emergency.toString(), label: 'Kondisi Darurat' },
  ], doc.y);

  doc.y += 5;

  // Distribusi klasifikasi
  doc.fontSize(10).font('Helvetica-Bold').text('Distribusi Klasifikasi', 40, doc.y);
  doc.y += 8;

  const distribusiRows = Object.entries(distribusi).map(([label, jumlah]) => [
    label,
    jumlah,
    total > 0 ? `${Math.round((jumlah / total) * 100)}%` : '0%',
  ]);

  doc.y = drawTable(
    doc,
    ['Klasifikasi', 'Jumlah', 'Persentase'],
    distribusiRows,
    doc.y
  );

  doc.y += 15;

  // Tabel detail
  doc.fontSize(10).font('Helvetica-Bold').text('Detail Pengukuran', 40, doc.y);
  doc.y += 8;

  const rows = records.map((r) => [
    formatTanggalPendek(r.tanggal),
    `${r.sistolik}/${r.diastolik}`,
    r.klasifikasi,
    r.is_emergency ? '⚠️ Ya' : 'Tidak',
  ]);

  drawTable(
    doc,
    ['Tanggal', 'Sistolik/Diastolik', 'Klasifikasi', 'Darurat'],
    rows,
    doc.y
  );

  drawFooter(doc);
  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve({
        buffer: Buffer.concat(buffers),
        filename: `laporan-td-${pasien.nama.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`,
      });
    });
  });
};

// =============================================
// LAPORAN-02: Ekspor Laporan Kepatuhan Obat PDF
// =============================================
const generateLaporanKepatuhan = async (pasienId, filter, startDate, endDate) => {
  const { dari, sampai } = getDateRange(filter, startDate, endDate);

  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
  });
  if (!pasien) throw new Error('Pasien tidak ditemukan');

  const logs = await prisma.logKepatuhanObat.findMany({
    where: {
      pasien_id: parseInt(pasienId),
      tanggal: { gte: dari, lte: sampai },
    },
    include: {
      obat_pasien: { include: { master_obat: true } },
    },
    orderBy: [{ tanggal: 'asc' }, { kategori_waktu: 'asc' }],
  });

  const total = logs.length;
  const patuh = logs.filter((l) => l.skor === 1).length;
  const tidakPatuh = total - patuh;
  const persentase = total > 0 ? Math.round((patuh / total) * 100) : 0;

  // Group by nama obat
  const perObat = {};
  logs.forEach((log) => {
    const namaObat = log.obat_pasien.master_obat.nama_obat;
    if (!perObat[namaObat]) {
      perObat[namaObat] = { total: 0, patuh: 0 };
    }
    perObat[namaObat].total += 1;
    if (log.skor === 1) perObat[namaObat].patuh += 1;
  });

  // Generate PDF
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const buffers = [];
  doc.on('data', (chunk) => buffers.push(chunk));

  drawHeader(doc, 'Laporan Kepatuhan Minum Obat', pasien, { dari, sampai });

  // Summary
  doc.fontSize(10).font('Helvetica-Bold').text('Ringkasan Kepatuhan', 40, doc.y);
  doc.y += 8;

  doc.y = drawSummaryBox(doc, [
    { nilai: `${persentase}%`, label: 'Persentase Kepatuhan' },
    { nilai: patuh.toString(), label: 'Kali Patuh' },
    { nilai: tidakPatuh.toString(), label: 'Kali Tidak Patuh' },
  ], doc.y);

  doc.y += 5;

  // Kepatuhan per obat
  doc.fontSize(10).font('Helvetica-Bold').text('Kepatuhan Per Obat', 40, doc.y);
  doc.y += 8;

  const perObatRows = Object.entries(perObat).map(([nama, data]) => [
    nama,
    data.total,
    data.patuh,
    data.total - data.patuh,
    `${Math.round((data.patuh / data.total) * 100)}%`,
  ]);

  doc.y = drawTable(
    doc,
    ['Nama Obat', 'Total', 'Patuh', 'Tidak Patuh', 'Persentase'],
    perObatRows,
    doc.y
  );

  doc.y += 15;

  // Detail log
  doc.fontSize(10).font('Helvetica-Bold').text('Detail Log Kepatuhan', 40, doc.y);
  doc.y += 8;

  const detailRows = logs.map((log) => [
    formatTanggalPendek(log.tanggal),
    log.obat_pasien.master_obat.nama_obat,
    log.kategori_waktu,
    log.skor === 1 ? 'Patuh' : 'Tidak Patuh',
    log.alasan || '-',
  ]);

  drawTable(
    doc,
    ['Tanggal', 'Nama Obat', 'Waktu', 'Status', 'Alasan'],
    detailRows,
    doc.y
  );

  drawFooter(doc);
  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve({
        buffer: Buffer.concat(buffers),
        filename: `laporan-kepatuhan-${pasien.nama.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`,
      });
    });
  });
};

// =============================================
// LAPORAN-03: Ekspor Laporan Lengkap PDF
// (TD + Kepatuhan + Diet)
// =============================================
const generateLaporanLengkap = async (pasienId, filter, startDate, endDate) => {
  const { dari, sampai } = getDateRange(filter, startDate, endDate);

  const pasien = await prisma.pasien.findUnique({
    where: { id: parseInt(pasienId) },
    include: {
      perawat_pasien: {
        include: { perawat: { select: { nama: true, no_wa: true } } },
      },
    },
  });
  if (!pasien) throw new Error('Pasien tidak ditemukan');

  // Ambil semua data
  const [tdRecords, kepatuhanLogs, dietLogs] = await Promise.all([
    prisma.tekananDarah.findMany({
      where: { pasien_id: parseInt(pasienId), tanggal: { gte: dari, lte: sampai } },
      orderBy: { tanggal: 'asc' },
    }),
    prisma.logKepatuhanObat.findMany({
      where: { pasien_id: parseInt(pasienId), tanggal: { gte: dari, lte: sampai } },
      include: { obat_pasien: { include: { master_obat: true } } },
      orderBy: { tanggal: 'asc' },
    }),
    prisma.logKonsumsiMakanan.findMany({
      where: { pasien_id: parseInt(pasienId), tanggal: { gte: dari, lte: sampai } },
      include: { master_diet: true },
      orderBy: { tanggal: 'asc' },
    }),
  ]);

  // Summary TD
  const totalTD = tdRecords.length;
  const avgSistolik = totalTD > 0
    ? Math.round(tdRecords.reduce((s, r) => s + r.sistolik, 0) / totalTD)
    : 0;
  const avgDiastolik = totalTD > 0
    ? Math.round(tdRecords.reduce((s, r) => s + r.diastolik, 0) / totalTD)
    : 0;
  const emergencyCount = tdRecords.filter((r) => r.is_emergency).length;

  // Summary kepatuhan
  const totalObat = kepatuhanLogs.length;
  const patuhCount = kepatuhanLogs.filter((l) => l.skor === 1).length;
  const persentasePatuh = totalObat > 0 ? Math.round((patuhCount / totalObat) * 100) : 0;

  // Summary diet
  const totalDiet = dietLogs.length;

  // Generate PDF
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const buffers = [];
  doc.on('data', (chunk) => buffers.push(chunk));

  drawHeader(doc, 'Laporan Evaluasi Kesehatan Lengkap', pasien, { dari, sampai });

  // Info perawat
  if (pasien.perawat_pasien.length > 0) {
    const perawat = pasien.perawat_pasien[0].perawat;
    doc
      .fontSize(9)
      .font('Helvetica')
      .text(`Perawat Pendamping: ${perawat.nama} | No. WA: ${perawat.no_wa || '-'}`, 40, doc.y);
    doc.y += 15;
  }

  // ===== SECTION 1: TEKANAN DARAH =====
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#1a73e8')
    .text('1. Tekanan Darah', 40, doc.y);
  doc.fillColor('#000000').y += 8;

  doc.y = drawSummaryBox(doc, [
    { nilai: totalTD.toString(), label: 'Total Pengukuran' },
    { nilai: `${avgSistolik}/${avgDiastolik}`, label: 'Rata-rata (mmHg)' },
    { nilai: emergencyCount.toString(), label: 'Kondisi Darurat' },
  ], doc.y);

  doc.y += 8;

  // Tabel TD ringkas (5 terakhir)
  const tdRows = tdRecords.slice(-5).map((r) => [
    formatTanggalPendek(r.tanggal),
    `${r.sistolik}/${r.diastolik}`,
    r.klasifikasi,
    r.is_emergency ? 'Ya' : 'Tidak',
  ]);

  if (tdRows.length > 0) {
    doc.fontSize(9).font('Helvetica').text('* 5 pengukuran terakhir', 40, doc.y);
    doc.y += 5;
    doc.y = drawTable(
      doc,
      ['Tanggal', 'Sistolik/Diastolik', 'Klasifikasi', 'Darurat'],
      tdRows,
      doc.y
    );
  }

  doc.y += 15;

  // ===== SECTION 2: KEPATUHAN OBAT =====
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#1a73e8')
    .text('2. Kepatuhan Minum Obat', 40, doc.y);
  doc.fillColor('#000000').y += 8;

  doc.y = drawSummaryBox(doc, [
    { nilai: `${persentasePatuh}%`, label: 'Persentase Kepatuhan' },
    { nilai: patuhCount.toString(), label: 'Kali Patuh' },
    { nilai: (totalObat - patuhCount).toString(), label: 'Kali Tidak Patuh' },
  ], doc.y);

  doc.y += 15;

  // ===== SECTION 3: DIET =====
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#1a73e8')
    .text('3. Log Diet DASH', 40, doc.y);
  doc.fillColor('#000000').y += 8;

  doc.y = drawSummaryBox(doc, [
    { nilai: totalDiet.toString(), label: 'Total Log Makanan' },
    { nilai: Math.round(totalDiet / (((sampai - dari) / (1000 * 60 * 60 * 24)) || 1)).toString(), label: 'Rata-rata per Hari' },
  ], doc.y);

  doc.y += 8;

  // Tabel diet ringkas (5 terakhir)
  const dietRows = dietLogs.slice(-5).map((d) => [
    formatTanggalPendek(d.tanggal),
    d.nama_makanan || d.master_diet?.nama_makanan || '-',
    d.kategori_makan,
  ]);

  if (dietRows.length > 0) {
    doc.fontSize(9).font('Helvetica').text('* 5 log makanan terakhir', 40, doc.y);
    doc.y += 5;
    drawTable(doc, ['Tanggal', 'Makanan', 'Kategori'], dietRows, doc.y);
  }

  drawFooter(doc);
  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve({
        buffer: Buffer.concat(buffers),
        filename: `laporan-lengkap-${pasien.nama.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`,
      });
    });
  });
};

module.exports = {
  generateLaporanTD,
  generateLaporanKepatuhan,
  generateLaporanLengkap,
};