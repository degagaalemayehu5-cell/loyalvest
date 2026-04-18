const Referral = require('../models/Referral');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { REFERRAL_BONUS_AMOUNT } = require('../config/constants');

// @desc    Create referral when user registers
// @route   Called from auth controller
// @access  Internal
const createReferral = async (referrerId, referredId) => {
  try {
    // Create referral record
    const referral = await Referral.create({
      referrer: referrerId,
      referred: referredId,
      bonusAmount: REFERRAL_BONUS_AMOUNT,
      status: 'pending'
    });

    // Add bonus to referrer's wallet
    const wallet = await Wallet.findOne({ user: referrerId });
    if (wallet) {
      wallet.balance += REFERRAL_BONUS_AMOUNT;
      wallet.totalRecharged += REFERRAL_BONUS_AMOUNT;
      await wallet.save();

      // Update referral status to paid
      referral.status = 'paid';
      await referral.save();

      // Create transaction record for the bonus
      await Transaction.create({
        user: referrerId,
        type: 'referral_bonus',
        amount: REFERRAL_BONUS_AMOUNT,
        status: 'approved',
        paymentMethod: 'referral',
        reference: referredId.toString(),
        description: `Referral bonus for inviting new user`
      });

      console.log(`✅ Referral bonus of ETB${REFERRAL_BONUS_AMOUNT} added to user ${referrerId}`);
    }

    return referral;
  } catch (error) {
    console.error('Create referral error:', error);
    return null;
  }
};

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
      .select('name phone createdAt totalInvestment totalProfit')
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
  createReferral,
  getReferralStats,
  getReferralList
};