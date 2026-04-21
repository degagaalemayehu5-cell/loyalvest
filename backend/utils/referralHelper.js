const Referral = require('../models/Referral');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// Check and unlock referral bonuses when referred user deposits
const checkAndUnlockReferralBonus = async (userId, depositAmount) => {
  try {
    // Find all referrals where this user is the referred person
    const referrals = await Referral.find({ 
      referred: userId, 
      status: 'locked'
    }).populate('referrer');
    
    let unlockedCount = 0;
    let unlockedBonuses = [];
    
    for (const referral of referrals) {
      // Update referred user's deposit total
      referral.referredUserDeposit += depositAmount;
      
      // Check if deposit meets minimum requirement (500 ETB)
      if (referral.referredUserDeposit >= referral.minDepositRequired && referral.status === 'locked') {
        // Unlock the bonus
        referral.status = 'available';
        referral.unlockedAt = new Date();
        await referral.save();
        
        // Add bonus to referrer's wallet NOW
        const referrerWallet = await Wallet.findOne({ user: referral.referrer._id });
        if (referrerWallet) {
          referrerWallet.balance += referral.bonusAmount;
          referrerWallet.totalRecharged += referral.bonusAmount;
          await referrerWallet.save();
          
          // Create transaction record
          await Transaction.create({
            user: referral.referrer._id,
            type: 'referral_bonus',
            amount: referral.bonusAmount,
            status: 'approved',
            paymentMethod: 'referral',
            reference: userId.toString(),
            description: `Referral bonus unlocked! ${referral.referred?.name || 'User'} deposited ETB${depositAmount} (Total: ETB${referral.referredUserDeposit})`
          });
          
          console.log(`✅ Referral bonus of ETB${referral.bonusAmount} unlocked for ${referral.referrer.name}`);
          unlockedCount++;
          unlockedBonuses.push({
            referrer: referral.referrer.name,
            amount: referral.bonusAmount
          });
        }
      } else {
        await referral.save();
        const remaining = referral.minDepositRequired - referral.referredUserDeposit;
        console.log(`⏳ Referral bonus locked for ${referral.referrer?.name} - Need ETB${remaining} more deposit`);
      }
    }
    
    return { unlockedCount, unlockedBonuses };
  } catch (error) {
    console.error('Error checking referral bonuses:', error);
    return { unlockedCount: 0, unlockedBonuses: [] };
  }
};

// Get referral status for a user
const getReferralStatus = async (userId) => {
  try {
    const referrals = await Referral.find({ referrer: userId })
      .populate('referred', 'name phone')
      .sort({ createdAt: -1 });
    
    const stats = {
      total: referrals.length,
      locked: referrals.filter(r => r.status === 'locked').length,
      available: referrals.filter(r => r.status === 'available').length,
      paid: referrals.filter(r => r.status === 'paid').length,
      totalBonusLocked: referrals.filter(r => r.status === 'locked').reduce((sum, r) => sum + r.bonusAmount, 0),
      totalBonusAvailable: referrals.filter(r => r.status === 'available').reduce((sum, r) => sum + r.bonusAmount, 0),
      totalBonusPaid: referrals.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.bonusAmount, 0)
    };
    
    return { referrals, stats };
  } catch (error) {
    console.error('Error getting referral status:', error);
    return { referrals: [], stats: null };
  }
};

module.exports = { 
  checkAndUnlockReferralBonus,
  getReferralStatus
};