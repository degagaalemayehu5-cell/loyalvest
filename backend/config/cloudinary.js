const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test connection
cloudinary.api.ping()
  .then(result => console.log('✅ Cloudinary connected:', result.status))
  .catch(err => console.error('❌ Cloudinary connection failed:', err.message));

// Configure storage with public access
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'loyalvest/payments',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
    // Make sure images are publicly accessible
    access_mode: 'public',
    // Optional: Add a prefix for better organization
    use_filename: true,
    unique_filename: true
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

module.exports = { cloudinary, upload };