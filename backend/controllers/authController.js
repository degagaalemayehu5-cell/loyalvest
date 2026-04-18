const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Referral = require('../models/Referral');
const jwt = require('jsonwebtoken');
const { REFERRAL_BONUS_AMOUNT } = require('../config/constants');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, phone, password, referralCode } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      phone,
      password
    });

    // Handle referral
    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode });
      if (referrer) {
        user.referredBy = referrer._id;
        await user.save();

        // Create referral record
        await Referral.create({
          referrer: referrer._id,
          referred: user._id,
          bonusAmount: REFERRAL_BONUS_AMOUNT,
          status: 'pending'
        });

        // Add bonus to referrer's wallet
        const referrerWallet = await Wallet.findOne({ user: referrer._id });
        if (referrerWallet) {
          referrerWallet.balance += REFERRAL_BONUS_AMOUNT;
          referrerWallet.totalRecharged += REFERRAL_BONUS_AMOUNT;
          await referrerWallet.save();
        }
      }
    }

    // Create wallet for user
    await Wallet.create({
      user: user._id,
      balance: 0
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        referralCode: user.referralCode,
        level: user.level,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Check for user
    const user = await User.findOne({ phone }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        referralCode: user.referralCode,
        level: user.level,
        isAdmin: user.isAdmin,
        totalInvestment: user.totalInvestment,
        totalProfit: user.totalProfit
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

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
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
  register,
  login,
  getMe,
  changePassword
};