const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hms-users', // The folder in Cloudinary Dashboard
    allowed_formats: ['jpg', 'png', 'jpeg'], // Limit file types
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // Optional resizing
  },
});

// 3. Create Multer Instance
const upload = multer({ storage: storage });

module.exports = { upload };