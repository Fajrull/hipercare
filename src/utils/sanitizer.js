const capitalize = (value) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const upperCase = (value) => {
  if (!value) return value;
  return value.toUpperCase();
};

const lowerCase = (value) => {
  if (!value) return value;
  return value.toLowerCase();
};

const sanitizeTopik = (value) => {
  if (!value) return value;
  const topikMap = {
    "mengenal ht": "Mengenal HT",
    fcn: "FCN",
    "diet dash": "Diet DASH",
    "kepatuhan obat": "Kepatuhan Obat",
    "kontrol td": "Kontrol TD",
  };
  return topikMap[value.toLowerCase()] || value;
};

module.exports = { capitalize, upperCase, lowerCase, sanitizeTopik };
