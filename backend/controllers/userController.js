const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const AdminRequest = require('../models/AdminRequest');
const { USER_LEVELS } = require('../config/constants');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
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
    
    const totalRecharged = transactions
      .filter(t => t.type === 'recharge' && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdrawn = transactions
      .filter(t => t.type === 'withdraw' && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalProfit = transactions
      .filter(t => t.type === 'profit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    res.status(200).json({
      success: true,
      stats: {
        balance: wallet?.balance || 0,
        totalRecharged,
        totalWithdrawn,
        totalProfit,
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

module.exports = {
  getProfile,
  updateProfile,
  getUserStats,
  requestAdmin,
  getReferrals
};