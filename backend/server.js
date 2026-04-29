const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();

// ===== IMPORTANT: Body parser MUST come before routes =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== CORS configuration - FIXED =====
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://loyalvest-frontend.onrender.com',
  'https://loyalvest-api.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all in production temporarily
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===== Request logging for debugging =====
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0 && !req.url.includes('recharge')) {
    console.log('Body:', req.body);
  }
  next();
});

// ===== Serve static files for uploads =====
const uploadsDir = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadsDir)) {
  app.use('/uploads', express.static(uploadsDir));
  console.log('✅ Uploads directory served');
} else {
  console.log('⚠️ Uploads directory not found, creating...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));
}

// ===== API Routes =====
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/investments', require('./routes/investmentRoutes'));

// ===== Health check =====
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// ===== PWA SERVICE WORKER & MANIFEST =====
// Check if frontend public folder exists
const frontendPublicPath = path.join(__dirname, '../frontend/public');
const frontendDistPath = path.join(__dirname, '../frontend/dist');

// Serve service worker with correct headers
app.get('/sw.js', (req, res) => {
  const swPath = path.join(frontendPublicPath, 'sw.js');
  if (fs.existsSync(swPath)) {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.sendFile(swPath);
  } else {
    res.status(404).json({ error: 'Service worker not found' });
  }
});

// Serve manifest.json
app.get('/manifest.json', (req, res) => {
  const manifestPath = path.join(frontendPublicPath, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.sendFile(manifestPath);
  } else {
    res.status(404).json({ error: 'Manifest not found' });
  }
});

// Serve icon files
app.get('/icons/:icon', (req, res) => {
  const iconPath = path.join(frontendPublicPath, 'icons', req.params.icon);
  if (fs.existsSync(iconPath)) {
    res.sendFile(iconPath);
  } else {
    res.status(404).json({ error: 'Icon not found' });
  }
});

// ===== SERVE FRONTEND (Production only) =====
if (process.env.NODE_ENV === 'production') {
  // Check if frontend dist exists
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    console.log('✅ Frontend dist files served');
  } else {
    console.log('⚠️ Frontend dist not found at:', frontendDistPath);
  }
  
  if (fs.existsSync(frontendPublicPath)) {
    app.use(express.static(frontendPublicPath));
  }
  
  // Handle React routing - catch all other routes
  app.get('*', (req, res) => {
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Frontend not built. Please run npm run build in frontend directory.' 
      });
    }
  });
}

// ===== Error handling middleware (must be last) =====
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal Server Error' 
  });
});

// ===== MongoDB Connection =====
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });