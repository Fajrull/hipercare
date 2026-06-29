/**
 * Standar format response API HiperCare
 */

const success = (res, data, message = 'Success', code = 200) => {
  return res.status(code).json({
    status: true,
    message,
    data,
  });
};

const error = (res, message = 'Internal Server Error', code = 500) => {
  return res.status(code).json({
    status: false,
    message,
    data: null,
  });
};

module.exports = { success, error };
