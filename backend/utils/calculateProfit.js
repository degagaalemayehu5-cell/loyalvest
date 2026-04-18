const User = require('../models/User');
const Investment = require('../models/Investment');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { USER_LEVELS } = require('../config/constants');

const calculateDailyProfit = async (investmentId) => {
  const investment = await Investment.findById(investmentId).populate('product');
  
  if (!investment || investment.status !== 'active') {
    return 0;
  }
  
  const dailyProfit = (investment.amount * (investment.product.profitRate / 100)) / 30;
  return dailyProfit;
};

// Calculate real-time profit for a single investment
const calculateRealTimeProfit = async (investment) => {
  const now = new Date();
  const lastCalc = investment.lastProfitCalculated || investment.startDate;
  
  // Calculate hours since last calculation
  const hoursSinceLastCalc = (now - lastCalc) / (1000 * 60 * 60);
  
  // Don't calculate too frequently (minimum 1 minute)
  if (hoursSinceLastCalc < 0.0167) return 0;
  
  // Get product details if not populated
  let product = investment.product;
  if (!product || typeof product === 'string') {
    const Product = require('../models/Product');
    product = await Product.findById(investment.product);
  }
  
  if (!product) return 0;
  
  // Calculate hourly profit rate (over 30 days)
  const totalProfit = investment.amount * (product.profitRate / 100);
  const hourlyProfit = totalProfit / (30 * 24);
  
  // Calculate profit for the time passed
  const profitToAdd = hourlyProfit * hoursSinceLastCalc;
  
  if (profitToAdd > 0) {
    investment.profitEarned = (investment.profitEarned || 0) + profitToAdd;
    investment.lastProfitCalculated = now;
    await investment.save();
    
    // Also add to user's wallet balance
    const wallet = await Wallet.findOne({ user: investment.user });
    if (wallet) {
      wallet.balance += profitToAdd;
      await wallet.save();
    }
    
    return profitToAdd;
  }
  
  return 0;
};

// Calculate real-time profit for all active investments
const calculateAllRealTimeProfits = async () => {
  const investments = await Investment.find({ 
    status: 'active',
    endDate: { $gt: new Date() }
  });
  
  let totalProfit = 0;
  
  for (const investment of investments) {
    const profit = await calculateRealTimeProfit(investment);
    totalProfit += profit;
  }
  
  return totalProfit;
};

// Get accrued but unclaimed profit for a user
const getAccruedProfit = async (userId) => {
  const investments = await Investment.find({ 
    user: userId,
    status: 'active',
    endDate: { $gt: new Date() }
  }).populate('product');
  
  let totalAccrued = 0;
  
  for (const investment of investments) {
    const now = new Date();
    const lastCalc = investment.lastProfitCalculated || investment.startDate;
    const hoursSinceLastCalc = (now - lastCalc) / (1000 * 60 * 60);
    
    const totalProfit = investment.amount * (investment.product.profitRate / 100);
    const hourlyProfit = totalProfit / (30 * 24);
    const accrued = hourlyProfit * hoursSinceLastCalc;
    
    totalAccrued += accrued;
  }
  
  return totalAccrued;
};

// Claim accrued profit for a user
const claimAccruedProfit = async (userId) => {
  const investments = await Investment.find({ 
    user: userId,
    status: 'active',
    endDate: { $gt: new Date() }
  }).populate('product');
  
  let totalClaimed = 0;
  
  for (const investment of investments) {
    const now = new Date();
    const lastCalc = investment.lastProfitCalculated || investment.startDate;
    const hoursSinceLastCalc = (now - lastCalc) / (1000 * 60 * 60);
    
    if (hoursSinceLastCalc > 0) {
      const totalProfit = investment.amount * (investment.product.profitRate / 100);
      const hourlyProfit = totalProfit / (30 * 24);
      const accruedProfit = hourlyProfit * hoursSinceLastCalc;
      
      if (accruedProfit > 0) {
        investment.profitEarned = (investment.profitEarned || 0) + accruedProfit;
        investment.lastProfitCalculated = now;
        await investment.save();
        totalClaimed += accruedProfit;
      }
    }
  }
  
  // Add to wallet
  if (totalClaimed > 0) {
    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      wallet.balance += totalClaimed;
      await wallet.save();
    }
    
    // Create transaction record
    await Transaction.create({
      user: userId,
      type: 'profit',
      amount: totalClaimed,
      status: 'approved',
      description: 'Profit claimed'
    });
  }
  
  return totalClaimed;
};

// NEW: Update user level based on wallet balance
// Update user level based on wallet balance
const updateUserLevelByBalance = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;
  
  const wallet = await Wallet.findOne({ user: userId });
  
  // Use wallet balance as the primary factor
  const balance = wallet?.balance || 0;
  
  let newLevel = 'BRONZE';
  
  if (balance >= 50000) {
    newLevel = 'DIAMOND';
  } else if (balance >= 20000) {
    newLevel = 'PLATINUM';
  } else if (balance >= 5000) {
    newLevel = 'GOLD';
  } else if (balance >= 1000) {
    newLevel = 'SILVER';
  } else {
    newLevel = 'BRONZE';
  }
  
  if (user.level !== newLevel) {
    user.level = newLevel;
    await user.save();
    console.log(`🆙 User ${user.email} level upgraded from ${user.level} to ${newLevel} (Balance: ETB${balance})`);
  }
  
  return newLevel;
};

// Keep old function for backward compatibility
const updateUserLevel = async (userId) => {
  return await updateUserLevelByBalance(userId);
};

const getLevelBenefits = (level) => {
  return USER_LEVELS[level] || USER_LEVELS.BRONZE;
};

module.exports = {
  calculateDailyProfit,
  calculateRealTimeProfit,
  calculateAllRealTimeProfits,
  getAccruedProfit,
  claimAccruedProfit,
  updateUserLevel,
  updateUserLevelByBalance,
  getLevelBenefits
};