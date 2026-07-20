const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Simpan file di memory dulu, baru upload ke Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak valid. Hanya jpeg, jpg, png, webp'), false);
  }
};

const uploadDiet = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
});

const uploadProfile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // max 2MB
});

// Upload buffer ke Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `hipercare/${folder}`,
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Hapus file dari Cloudinary by public_id
const deleteFile = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary: file dihapus:', publicId);
  } catch (err) {
    console.error('Cloudinary: gagal hapus file:', err.message);
  }
};

// Ambil public_id dari URL Cloudinary
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  // URL: https://res.cloudinary.com/cloud/image/upload/v123/hipercare/diet/filename.jpg
  const parts = url.split('/');
  const filenameWithExt = parts[parts.length - 1];
  const filename = filenameWithExt.split('.')[0];
  const folder1 = parts[parts.length - 3]; // hipercare
  const folder2 = parts[parts.length - 2]; // diet
  return `${folder1}/${folder2}/${filename}`;
};

module.exports = { uploadDiet, uploadProfile, uploadToCloudinary, deleteFile, getPublicIdFromUrl };