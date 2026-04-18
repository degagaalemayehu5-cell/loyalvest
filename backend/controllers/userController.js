const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const AdminRequest = require('../models/AdminRequest');
const { USER_LEVELS } = require('../config/constants');
const { updateUserLevelByBalance } = require('../utils/calculateProfit');

// Helper function to get next level requirements
const getNextLevelRequirements = (currentBalance) => {
  if (currentBalance < 1000) {
    return { level: 'SILVER', needed: 1000 - currentBalance, benefit: '8% profit rate', minBalance: 1000 };
  } else if (currentBalance < 5000) {
    return { level: 'GOLD', needed: 5000 - currentBalance, benefit: '12% profit rate', minBalance: 5000 };
  } else if (currentBalance < 20000) {
    return { level: 'PLATINUM', needed: 20000 - currentBalance, benefit: '15% profit rate', minBalance: 20000 };
  } else if (currentBalance < 50000) {
    return { level: 'DIAMOND', needed: 50000 - currentBalance, benefit: '20% profit rate', minBalance: 50000 };
  } else {
    return { level: 'MAX', needed: 0, benefit: 'Maximum benefits unlocked', minBalance: 50000 };
  }
};

// @desc    Get user profile (with level check)
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    // Update level based on current balance FIRST
    await updateUserLevelByBalance(req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      user,
      wallet
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    const transactions = await Transaction.find({ user: req.user.id });
    const referrals = await User.countDocuments({ referredBy: req.user.id });
    
    // Calculate total recharged
    const totalRecharged = transactions
      .filter(t => t.type === 'recharge' && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate total withdrawn
    const totalWithdrawn = transactions
      .filter(t => t.type === 'withdraw' && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate total profit
    const totalProfit = transactions
      .filter(t => t.type === 'profit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate referral bonus - FIX THIS PART
    const referralBonusTransactions = await Transaction.find({
      user: req.user.id,
      type: 'referral_bonus',
      status: 'approved'
    });
    
    const totalReferralBonus = referralBonusTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    console.log('Referral bonus calculated:', totalReferralBonus); // Debug log
    
    res.status(200).json({
      success: true,
      stats: {
        balance: wallet?.balance || 0,
        totalRecharged,
        totalWithdrawn,
        totalProfit,
        totalReferralBonus,  // This was missing!
        totalReferrals: referrals,
        pendingWithdrawals: wallet?.pendingWithdrawals || 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
// @desc    Request admin role
// @route   POST /api/users/request-admin
// @access  Private
const requestAdmin = async (req, res) => {
  try {
    const { reason } = req.body;
    
    // Check if already requested
    const existingRequest = await AdminRequest.findOne({ 
      user: req.user.id,
      status: 'pending'
    });
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Admin request already pending'
      });
    }
    
    // Check if already admin
    if (req.user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'User is already an admin'
      });
    }
    
    const adminRequest = await AdminRequest.create({
      user: req.user.id,
      reason
    });
    
    res.status(201).json({
      success: true,
      message: 'Admin request submitted successfully',
      request: adminRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get referral info
// @route   GET /api/users/referrals
// @access  Private
const getReferrals = async (req, res) => {
  try {
    const referrals = await User.find({ referredBy: req.user.id })
      .select('name email createdAt level totalInvestment');
    
    const referralBonus = await Transaction.find({
      user: req.user.id,
      type: 'referral_bonus'
    });
    
    res.status(200).json({
      success: true,
      referrals,
      totalBonus: referralBonus.reduce((sum, t) => sum + t.amount, 0),
      totalReferrals: referrals.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Check and update user level based on balance
// @route   GET /api/users/check-level
// @access  Private
const checkAndUpdateLevel = async (req, res) => {
  try {
    const newLevel = await updateUserLevelByBalance(req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    const wallet = await Wallet.findOne({ user: req.user.id });
    const balance = wallet?.balance || 0;
    const nextLevel = getNextLevelRequirements(balance);
    
    // Get current level benefits
    const currentLevelBenefits = USER_LEVELS[user.level] || USER_LEVELS.BRONZE;
    
    res.status(200).json({
      success: true,
      level: newLevel,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level
      },
      wallet: {
        balance: balance
      },
      currentBenefits: currentLevelBenefits,
      nextLevel: nextLevel.level !== 'MAX' ? nextLevel : null,
      requirements: nextLevel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Force update user level (admin only)
// @route   POST /api/users/force-update-level
// @access  Private/Admin
const forceUpdateLevel = async (req, res) => {
  try {
    const { userId } = req.body;
    const targetUserId = userId || req.user.id;
    
    const newLevel = await updateUserLevelByBalance(targetUserId);
    const user = await User.findById(targetUserId).select('-password');
    const wallet = await Wallet.findOne({ user: targetUserId });
    
    res.status(200).json({
      success: true,
      message: `User level updated to ${newLevel}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level
      },
      balance: wallet?.balance || 0
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
  getProfile,
  updateProfile,
  getUserStats,
  requestAdmin,
  getReferrals,
  checkAndUpdateLevel,
  forceUpdateLevel
};