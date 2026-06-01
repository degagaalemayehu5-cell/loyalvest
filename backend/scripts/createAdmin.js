const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../models/User');
const Wallet = require('../models/Wallet');

const createAdmin = async () => {
  try {
    console.log('📡 Connecting to MongoDB...');
    
    // Connect to MongoDB
    // Add this inside your try block in createAdmin.js
await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB');

// Force drop the old email index
try {
    await User.collection.dropIndex('email_1');
    console.log('🗑️ Old email index dropped successfully');
} catch (err) {
    console.log('ℹ️ Email index already gone or not found');
}

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ phone: '0976017780' });
    if (existingAdmin) {
      console.log('\n⚠️ Super Admin already exists!');
      console.log('=================================');
      console.log('📧 Phone: 0976017780');
      console.log('🔑 You can login with your existing password');
      console.log('=================================\n');
      process.exit();
    }

    // Password for the super admin
    const plainPassword = '357415963';

    // Create super admin user
    const admin = await User.create({
      name: 'Super Administrator',
      phone: '0976017780',
      password: plainPassword,
      referralCode: 'SUPER' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      isAdmin: true,
      isSuperAdmin: true,
      isActive: true,
      level: 'DIAMOND',
      totalInvestment: 0,
      totalProfit: 0
    });

    console.log('\n🎉 Super Admin created successfully!');
    console.log('=================================');
    console.log('📧 Phone: 0976017780');
    console.log('🔑 Password: 357415963');
    console.log('🆔 Admin ID:', admin._id.toString());
    console.log('=================================');
    console.log('\n🌐 You can now login at: http://localhost:5173/admin-login');
    console.log('\n📝 Note: Make sure your backend server is running!');
    
    process.exit();
  } catch (error) {
    console.error('\n❌ Error creating admin:');
    console.error(error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure MongoDB is running!');
      console.error('   Start MongoDB with: net start MongoDB (Windows)');
      console.error('   or: sudo systemctl start mongod (Linux/Mac)');
    }
    process.exit(1);
  }
};

createAdmin();