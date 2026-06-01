const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product');

// Load .env from parent directory (backend folder)
dotenv.config({ path: path.join(__dirname, '../.env') });

const products = [
  // Bronze Level Plans (Min Investment: 100-999)
  {
    name: "Bronze Starter",
    vipLevel: "VIP 1",
    description: "Perfect for beginners starting their investment journey",
    minLevel: "BRONZE",
    minInvestment: 100,
    maxInvestment: 999,
    profitRate: 5,
    duration: 30,
    imageUrl: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&w=800&q=80",
    isActive: true
  },
  {
    name: "Bronze Plus",
    vipLevel: "VIP 2",
    description: "Higher returns for bronze investors",
    minLevel: "BRONZE",
    minInvestment: 500,
    maxInvestment: 999,
    profitRate: 6,
    duration: 45,
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    isActive: true
  },

  // Silver Level Plans (Min Investment: 1000-4999)
  {
    name: "Silver Growth",
    vipLevel: "VIP 1",
    description: "For growing investors",
    minLevel: "SILVER",
    minInvestment: 1000,
    maxInvestment: 4999,
    profitRate: 8,
    duration: 30,
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    isActive: true
  },
  {
    name: "Silver Premium",
    vipLevel: "VIP 2",
    description: "Premium silver plan",
    minLevel: "SILVER",
    minInvestment: 2500,
    maxInvestment: 4999,
    profitRate: 9,
    duration: 60,
    imageUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80",
    isActive: true
  },

  // Gold Level Plans (Min Investment: 5000-19999)
  {
    name: "Gold Elite",
    vipLevel: "VIP 1",
    description: "Excellent returns for gold members",
    minLevel: "GOLD",
    minInvestment: 5000,
    maxInvestment: 19999,
    profitRate: 12,
    duration: 30,
    imageUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80",
    isActive: true
  },
  {
    name: "Gold Pro",
    vipLevel: "VIP 2",
    description: "Professional gold plan",
    minLevel: "GOLD",
    minInvestment: 10000,
    maxInvestment: 19999,
    profitRate: 14,
    duration: 90,
    imageUrl: "https://images.unsplash.com/photo-1559526324-526fe7a6922f?auto=format&fit=crop&w=800&q=80",
    isActive: true
  },

  // Platinum Level Plans (Min Investment: 20000-49999)
  {
    name: "Platinum Wealth",
    vipLevel: "VIP 1",
    description: "Wealth building plan",
    minLevel: "PLATINUM",
    minInvestment: 20000,
    maxInvestment: 49999,
    profitRate: 15,
    duration: 30,
    imageUrl: "https://images.unsplash.com/photo-1542224566-3f7b0acc1f3a?auto=format&fit=crop&w=800&q=80",
    isActive: true
  },
  {
    name: "Platinum Ultra",
    vipLevel: "VIP 2",
    description: "Ultra high returns",
    minLevel: "PLATINUM",
    minInvestment: 35000,
    maxInvestment: 49999,
    profitRate: 18,
    duration: 60,
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    isActive: true
  },

  // Diamond Level Plans (Min Investment: 50000+)
  {
    name: "Diamond Legacy",
    vipLevel: "VIP 1",
    description: "Maximum returns for elite investors",
    minLevel: "DIAMOND",
    minInvestment: 50000,
    maxInvestment: 99999,
    profitRate: 20,
    duration: 30,
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    isActive: true
  },
  {
    name: "Diamond Infinite",
    vipLevel: "VIP 2",
    description: "Infinite wealth plan",
    minLevel: "DIAMOND",
    minInvestment: 100000,
    maxInvestment: null,
    profitRate: 25,
    duration: 90,
    imageUrl: "https://images.unsplash.com/photo-1487014679447-9f8336841d30?auto=format&fit=crop&w=800&q=80",
    isActive: true
  }
];

async function seedProducts() {
  try {
    // Check if MONGODB_URI is loaded
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env file');
      console.log('Please make sure you have a .env file in the backend folder with MONGODB_URI');
      process.exit(1);
    }

    console.log('📡 Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//<hidden>@')); // Hide password
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    const deleted = await Product.deleteMany();
    console.log(`🗑️ Cleared ${deleted.deletedCount} existing products`);

    // Insert new products
    const result = await Product.insertMany(products);
    console.log(`\n✅ Added ${result.length} investment plans!`);
    console.log('\n📊 Plans by level:');
    console.log('   BRONZE: 2 plans');
    console.log('   SILVER: 2 plans'); 
    console.log('   GOLD: 2 plans');
    console.log('   PLATINUM: 2 plans');
    console.log('   DIAMOND: 2 plans');
    
    console.log('\n🎉 Investment plans seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    process.exit(1);
  }
}

seedProducts();