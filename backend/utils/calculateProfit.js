const User = require('../models/User');
const Investment = require('../models/Investment');
const { USER_LEVELS } = require('../config/constants');

const calculateDailyProfit = async (investmentId) => {
  const investment = await Investment.findById(investmentId).populate('product');
  
  if (!investment || investment.status !== 'active') {
    return 0;
  }
  
  const dailyProfit = (investment.amount * (investment.product.profitRate / 100)) / 30;
  return dailyProfit;
};

const updateUserLevel = async (userId) => {
  const user = await User.findById(userId);
  const totalInvestment = user.totalInvestment;
  
  let newLevel = 'BRONZE';
  
  if (totalInvestment >= 50000) {
    newLevel = 'DIAMOND';
  } else if (totalInvestment >= 20000) {
    newLevel = 'PLATINUM';
  } else if (totalInvestment >= 5000) {
    newLevel = 'GOLD';
  } else if (totalInvestment >= 1000) {
    newLevel = 'SILVER';
  } else {
    newLevel = 'BRONZE';
  }
  
  if (user.level !== newLevel) {
    user.level = newLevel;
    await user.save();
  }
  
  return newLevel;
};

const getLevelBenefits = (level) => {
  return USER_LEVELS[level] || USER_LEVELS.BRONZE;
};

module.exports = {
  calculateDailyProfit,
  updateUserLevel,
  getLevelBenefits
};