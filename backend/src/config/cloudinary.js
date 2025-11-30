const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Storage Engine (using built-in Cloudinary storage)
const storage = multer.memoryStorage();

// 3. Create Multer Instance with custom uploader
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    // Accept images only
    if (!file.mimetype.match(/image\/(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// 4. Custom upload function to Cloudinary
const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.buffer, {
      folder: 'hms-users',
      format: file.mimetype.split('/')[1] || 'jpg',
      public_id: file.originalname.split('.')[0] + '-' + Date.now(),
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    });
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { upload, uploadToCloudinary };