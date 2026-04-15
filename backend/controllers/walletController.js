const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { MIN_WITHDRAWAL, MAX_WITHDRAWAL } = require('../config/constants');

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
    const { amount, bankName, accountNumber, accountHolder,SWIFTCode } = req.body;
    
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
    
    // Create withdrawal transaction
    const transaction = await Transaction.create({
      user: req.user.id,
      type: 'withdraw',
      amount,
      status: 'pending',
      bankDetails: {
        bankName,
        accountNumber,
        accountHolder,
       SWIFTCode
      }
    });
    
    // Update wallet
    wallet.balance -= amount;
    wallet.pendingWithdrawals += amount;
    await wallet.save();
    
    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      transaction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
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
    
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
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
          bankName: "State Bank of Ethiopia CBE",
          accountHolder: "Loyalvest Investments",
          accountNumber: "1000464654252",
         SWIFTCode: "SBIN0012345",
          upiId: "loyalvest@okhdfcbank",
          adminName: "Admin Team"
        },
        {
          bankName: "HDFC Bank",
          accountHolder: "Loyalvest Investments",
          accountNumber: "98765432109",
         SWIFTCode: "HDFC0001234",
          upiId: "loyalvest@hdfcbank",
          adminName: "Admin Team"
        }
      ],
      instructions: [
        'Transfer the exact amount to any of the bank accounts above',
        'Use your registered email as reference',
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

module.exports = {
  getBalance,
  requestWithdrawal,
  submitRechargeRequest,
  getRechargeInfo,
  getTransactions
};