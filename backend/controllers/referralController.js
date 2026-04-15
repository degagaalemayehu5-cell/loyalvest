const Referral = require('../models/Referral');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { REFERRAL_BONUS_AMOUNT } = require('../config/constants');

// @desc    Get referral stats
// @route   GET /api/referrals/stats
// @access  Private
const getReferralStats = async (req, res) => {
  try {
    const totalReferrals = await User.countDocuments({ referredBy: req.user.id });
    const successfulReferrals = await Referral.countDocuments({ 
      referrer: req.user.id,
      status: 'paid'
    });
    
    const referralBonus = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'referral_bonus' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    res.status(200).json({
      success: true,
      stats: {
        totalReferrals,
        successfulReferrals,
        totalBonus: referralBonus[0]?.total || 0
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

// @desc    Get referral list
// @route   GET /api/referrals/list
// @access  Private
const getReferralList = async (req, res) => {
  try {
    const referrals = await User.find({ referredBy: req.user.id })
      .select('name email createdAt totalInvestment totalProfit')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      referrals
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
  getReferralStats,
  getReferralList
};