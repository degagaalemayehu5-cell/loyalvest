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
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@loyalvest.com' });
    if (existingAdmin) {
      console.log('\n⚠️ Admin already exists!');
      console.log('=================================');
      console.log('📧 Email: admin@loyalvest.com');
      console.log('🔑 You can login with your existing password');
      console.log('=================================\n');
      process.exit();
    }

    // Hash password
    const plainPassword = 'Admin@123456';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Create admin user
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@loyalvest.com',
      password: hashedPassword,
      referralCode: 'ADMIN' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      isAdmin: true,
      isActive: true,
      level: 'DIAMOND',
      totalInvestment: 0,
      totalProfit: 0
    });

    // Create wallet for admin
    await Wallet.create({
      user: admin._id,
      balance: 0,
      totalRecharged: 0,
      totalWithdrawn: 0,
      pendingWithdrawals: 0
    });

    console.log('\n🎉 Admin created successfully!');
    console.log('=================================');
    console.log('📧 Email: admin@loyalvest.com');
    console.log('🔑 Password: Admin@123456');
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