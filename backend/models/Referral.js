const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bonusAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'locked', 'available', 'paid', 'cancelled'],
    default: 'pending'
  },
  referredUserDeposit: {
    type: Number,
    default: 0
  },
  minDepositRequired: {
    type: Number,
    default: 500
  },
  unlockedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Referral', ReferralSchema);