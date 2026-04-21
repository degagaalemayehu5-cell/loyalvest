const Wallet = require('../models/Wallet');
const { checkAndUnlockReferralBonus } = require('../utils/referralHelper');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { MIN_WITHDRAWAL, MAX_WITHDRAWAL } = require('../config/constants');
const { updateUserLevelByBalance } = require('../utils/calculateProfit');

// @desc    Get wallet balance
// @route   GET /api/wallet/balance
// @access  Private
const getBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      balance: wallet?.balance || 0,
      pendingWithdrawals: wallet?.pendingWithdrawals || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Request withdrawal
// @route   POST /api/wallet/withdraw
// @access  Private
const requestWithdrawal = async (req, res) => {
  try {
    const { amount, bankName, accountNumber, accountHolder, ifscCode, swiftCode } = req.body;
    
    console.log('Withdrawal request received:', { amount, bankName, accountNumber, accountHolder });
    
    // Validate amount
    if (!amount || amount < MIN_WITHDRAWAL) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal amount is ETB${MIN_WITHDRAWAL}`
      });
    }
    
    if (amount > MAX_WITHDRAWAL) {
      return res.status(400).json({
        success: false,
        message: `Maximum withdrawal amount is ETB${MAX_WITHDRAWAL}`
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
    
    // Create withdrawal transaction with FULL bank details
    const transaction = await Transaction.create({
      user: req.user.id,
      type: 'withdraw',
      amount,
      status: 'pending',
      bankDetails: {
        bankName: bankName || 'Not provided',
        accountNumber: accountNumber || 'Not provided',
        accountHolder: accountHolder || req.user.name,
        ifscCode: ifscCode || swiftCode || 'Not provided',
        swiftCode: swiftCode || 'Not provided'
      },
      createdAt: new Date()
    });
    
    // Update wallet
    wallet.balance -= amount;
    wallet.pendingWithdrawals += amount;
    await wallet.save();
    
    // Update user level based on new balance
    await updateUserLevelByBalance(req.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      transaction,
      newBalance: wallet.balance
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message
    });
  }
};

// @desc    Submit recharge request
// @route   POST /api/wallet/recharge
// @access  Private
const submitRechargeRequest = async (req, res) => {
  try {
    const { amount, transactionId } = req.body;
    
    if (!amount || amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum recharge amount is ETB100'
      });
    }
    
    // Create recharge transaction (pending)
    const transaction = await Transaction.create({
      user: req.user.id,
      type: 'recharge',
      amount: parseFloat(amount),
      status: 'pending',
      paymentMethod: 'bank_transfer',
      reference: transactionId,
      adminNotes: 'Awaiting admin verification'
    });
    
    res.status(201).json({
      success: true,
      message: 'Recharge request submitted successfully',
      transaction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message
    });
  }
};

// @desc    Get recharge info (admin contact)
// @route   GET /api/wallet/recharge-info
// @access  Private
const getRechargeInfo = async (req, res) => {
  try {
    // Get admin users
    const admins = await User.find({ isAdmin: true }).select('name email');
    
    const rechargeInfo = {
      adminAccounts: [
        {
          bankName: "CBE",
          accountHolder: "Loyalvest Investments",
          realname: "Degaga Alemayehu",
          accountNumber: "1000464654252",
          adminName: "Admin Team"
        },
        {
          bankName: "Awash Bank",
          accountHolder: "Loyalvest Investments",
          realname: "Cherinet Abebe",
          accountNumber: "98765432109",
          adminName: "Admin Team"
        }
      ],
      instructions: [
        'Transfer the exact amount to any of the bank accounts above',
        'Use your registered phone as reference',
        'Keep the transaction ID for submission',
        'Upload clear screenshot of payment confirmation',
        'Amount will be credited within 24 hours after verification'
      ]
    };
    
    res.status(200).json({
      success: true,
      rechargeInfo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    
    const query = { user: req.user.id };
    if (type) query.type = type;
    if (status) query.status = status;
    
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Transaction.countDocuments(query);
    
    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
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

// @desc    Approve recharge (admin only - add to wallet and update level)
// @route   PUT /api/wallet/approve-recharge/:id
// @access  Private/Admin

// @desc    Approve recharge (admin only - add to wallet and update level)
// @route   PUT /api/wallet/approve-recharge/:id
// @access  Private/Admin
const approveRecharge = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction || transaction.type !== 'recharge') {
      return res.status(404).json({
        success: false,
        message: 'Recharge transaction not found'
      });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Transaction already processed'
      });
    }
    
    // Update transaction
    transaction.status = 'approved';
    transaction.processedBy = req.user.id;
    transaction.processedAt = Date.now();
    await transaction.save();
    
    // Add amount to user's wallet
    let wallet = await Wallet.findOne({ user: transaction.user });
    if (wallet) {
      wallet.balance += transaction.amount;
      wallet.totalRecharged += transaction.amount;
      await wallet.save();
    } else {
      wallet = await Wallet.create({
        user: transaction.user,
        balance: transaction.amount,
        totalRecharged: transaction.amount
      });
    }
    
    // CHECK AND UNLOCK REFERRAL BONUSES
    // When user deposits money, check if they were referred and unlock bonuses
    const unlockedCount = await checkAndUnlockReferralBonus(transaction.user, transaction.amount);
    
    if (unlockedCount > 0) {
      console.log(`🎉 Unlocked ${unlockedCount} referral bonuses for user ${transaction.user}`);
    }
    
    // Update user level based on new balance
    await updateUserLevelByBalance(transaction.user);
    
    res.status(200).json({
      success: true,
      message: 'Recharge approved and amount credited',
      newBalance: wallet.balance,
      unlockedReferrals: unlockedCount
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
  getBalance,
  requestWithdrawal,
  submitRechargeRequest,
  getRechargeInfo,
  getTransactions,
  approveRecharge
};