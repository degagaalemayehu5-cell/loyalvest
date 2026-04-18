const Investment = require('../models/Investment');
const Product = require('../models/Product');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { USER_LEVELS } = require('../config/constants');
const { 
  calculateDailyProfit, 
  updateUserLevel,
  getAccruedProfit,
  claimAccruedProfit
} = require('../utils/calculateProfit');

// @desc    Get available products
// @route   GET /api/investments/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userLevel = user.level;
    
    // Get products based on user level
    const products = await Product.find({
      minLevel: { $lte: userLevel },
      isActive: true
    }).sort({ minInvestment: 1 });
    
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Invest in product
// @route   POST /api/investments/invest
// @access  Private
const invest = async (req, res) => {
  try {
    const { productId, amount } = req.body;
    
    console.log('Investment request:', { productId, amount, userId: req.user.id });
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check minimum investment
    if (amount < product.minInvestment) {
      return res.status(400).json({
        success: false,
        message: `Minimum investment is ETB${product.minInvestment}`
      });
    }
    
    // Check maximum investment
    if (product.maxInvestment && amount > product.maxInvestment) {
      return res.status(400).json({
        success: false,
        message: `Maximum investment is ETB${product.maxInvestment}`
      });
    }
    
    // Check wallet balance
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }
    
    // Deduct amount from wallet
    wallet.balance -= amount;
    await wallet.save();
    
    // Create investment
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + product.duration);
    
    const investment = await Investment.create({
      user: req.user.id,
      product: productId,
      amount,
      endDate,
      lastProfitCalculated: new Date(),
      status: 'active',
      profitEarned: 0
    });
    
    // Update user total investment
    const user = await User.findById(req.user.id);
    user.totalInvestment += amount;
    await user.save();
    
    // Update user level based on total investment
    await updateUserLevel(req.user.id);
    
    // Create transaction record for the investment
    await Transaction.create({
      user: req.user.id,
      type: 'investment',
      amount,
      status: 'approved',
      paymentMethod: 'wallet',
      reference: investment._id.toString()
    });
    
    console.log('Investment successful:', investment._id);
    
    res.status(201).json({
      success: true,
      message: 'Investment successful',
      investment: {
        id: investment._id,
        amount: investment.amount,
        product: product.name,
        profitRate: product.profitRate,
        duration: product.duration,
        endDate: investment.endDate
      },
      newBalance: wallet.balance
    });
  } catch (error) {
    console.error('Investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message
    });
  }
};

// @desc    Get user investments
// @route   GET /api/investments/my-investments
// @access  Private
const getMyInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id })
      .populate('product', 'name profitRate duration')
      .sort({ createdAt: -1 });
    
    // Calculate current profit for active investments
    const activeInvestments = investments.filter(i => i.status === 'active');
    for (const investment of activeInvestments) {
      const profit = await calculateDailyProfit(investment._id);
      investment.currentProfit = profit;
    }
    
    res.status(200).json({
      success: true,
      investments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get real-time profit for user
// @route   GET /api/investments/real-time-profit
// @access  Private
const getRealTimeProfit = async (req, res) => {
  try {
    const accruedProfit = await getAccruedProfit(req.user.id);
    
    const investments = await Investment.find({ 
      user: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    }).populate('product');
    
    const investmentDetails = [];
    for (const investment of investments) {
      const now = new Date();
      const lastCalc = investment.lastProfitCalculated || investment.startDate;
      const hoursSinceLastCalc = (now - lastCalc) / (1000 * 60 * 60);
      
      const totalProfit = investment.amount * (investment.product.profitRate / 100);
      const hourlyProfit = totalProfit / (30 * 24);
      const accruedForThis = hourlyProfit * hoursSinceLastCalc;
      
      const totalEarned = (investment.profitEarned || 0) + accruedForThis;
      const targetProfit = investment.amount * (investment.product.profitRate / 100);
      const progress = (totalEarned / targetProfit) * 100;
      
      investmentDetails.push({
        id: investment._id,
        productName: investment.product.name,
        amount: investment.amount,
        profitRate: investment.product.profitRate,
        earnedProfit: investment.profitEarned || 0,
        accruedProfit: Math.max(0, accruedForThis),
        totalProfit: totalEarned,
        progress: Math.min(100, progress),
        duration: investment.product.duration,
        endDate: investment.endDate
      });
    }
    
    res.status(200).json({
      success: true,
      totalAccruedProfit: Math.max(0, accruedProfit),
      investments: investmentDetails,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Real-time profit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Claim accrued profit
// @route   POST /api/investments/claim-profit
// @access  Private
const claimProfit = async (req, res) => {
  try {
    const claimedAmount = await claimAccruedProfit(req.user.id);
    
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    if (claimedAmount > 0) {
      res.status(200).json({
        success: true,
        message: `Claimed ETB${claimedAmount.toFixed(2)} profit`,
        claimedAmount: claimedAmount,
        newBalance: wallet?.balance || 0
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'No profit to claim',
        claimedAmount: 0,
        newBalance: wallet?.balance || 0
      });
    }
  } catch (error) {
    console.error('Claim profit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message
    });
  }
};

// @desc    Calculate profit for all investments (cron job)
// @route   POST /api/investments/calculate-profit
// @access  Private/Admin
const calculateAllProfit = async (req, res) => {
  try {
    const activeInvestments = await Investment.find({ 
      status: 'active',
      endDate: { $gt: new Date() }
    }).populate('product');
    
    let totalProfitCalculated = 0;
    
    for (const investment of activeInvestments) {
      const daysSinceLastCalc = Math.floor(
        (new Date() - investment.lastProfitCalculated) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastCalc >= 1) {
        const dailyProfit = (investment.amount * (investment.product.profitRate / 100)) / 30;
        const profitToAdd = dailyProfit * daysSinceLastCalc;
        
        // Update investment
        investment.profitEarned += profitToAdd;
        investment.lastProfitCalculated = new Date();
        await investment.save();
        
        // Add profit to wallet
        const wallet = await Wallet.findOne({ user: investment.user });
        if (wallet) {
          wallet.balance += profitToAdd;
          await wallet.save();
          
          // Create transaction record
          await Transaction.create({
            user: investment.user,
            type: 'profit',
            amount: profitToAdd,
            status: 'approved'
          });
          
          totalProfitCalculated += profitToAdd;
        }
        
        // Update user total profit
        await User.findByIdAndUpdate(investment.user, {
          $inc: { totalProfit: profitToAdd }
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Profit calculated for ${activeInvestments.length} investments`,
      totalProfitCalculated
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

module.exports = {
  getProducts,
  invest,
  getMyInvestments,
  getRealTimeProfit,
  claimProfit,
  calculateAllProfit
};