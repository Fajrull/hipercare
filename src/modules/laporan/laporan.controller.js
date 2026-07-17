const laporanService = require('./laporan.service');
const { error } = require('../../utils/response');

// LAPORAN-01
const eksporTD = async (req, res) => {
  try {
    const { filter, start_date, end_date } = req.query;
    const { buffer, filename } = await laporanService.generateLaporanTD(
      req.params.pasienId,
      filter,
      start_date,
      end_date
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// LAPORAN-02
const eksporKepatuhan = async (req, res) => {
  try {
    const { filter, start_date, end_date } = req.query;
    const { buffer, filename } = await laporanService.generateLaporanKepatuhan(
      req.params.pasienId,
      filter,
      start_date,
      end_date
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// LAPORAN-03
const eksporLengkap = async (req, res) => {
  try {
    const { filter, start_date, end_date } = req.query;
    const { buffer, filename } = await laporanService.generateLaporanLengkap(
      req.params.pasienId,
      filter,
      start_date,
      end_date
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

module.exports = { eksporTD, eksporKepatuhan, eksporLengkap };