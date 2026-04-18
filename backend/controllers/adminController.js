const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const AdminRequest = require('../models/AdminRequest');
const Product = require('../models/Product');

// @desc    Get all pending withdrawals
// @route   GET /api/admin/withdrawals/pending
// @access  Private/Admin
const getPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Transaction.find({
      type: 'withdraw',
      status: 'pending'
    }).populate('user', 'name phone');
    
    res.status(200).json({
      success: true,
      withdrawals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Approve withdrawal
// @route   PUT /api/admin/withdrawals/:id/approve
// @access  Private/Admin
const approveWithdrawal = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Transaction already processed'
      });
    }
    
    transaction.status = 'approved';
    transaction.processedBy = req.user.id;
    transaction.processedAt = Date.now();
    await transaction.save();
    
    // Update wallet pending withdrawals
    const wallet = await Wallet.findOne({ user: transaction.user });
    if (wallet) {
      wallet.pendingWithdrawals -= transaction.amount;
      wallet.totalWithdrawn += transaction.amount;
      await wallet.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Withdrawal approved successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Reject withdrawal
// @route   PUT /api/admin/withdrawals/:id/reject
// @access  Private/Admin
const rejectWithdrawal = async (req, res) => {
  try {
    const { reason } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Transaction already processed'
      });
    }
    
    transaction.status = 'rejected';
    transaction.adminNotes = reason;
    transaction.processedBy = req.user.id;
    transaction.processedAt = Date.now();
    await transaction.save();
    
    // Refund amount to wallet
    const wallet = await Wallet.findOne({ user: transaction.user });
    if (wallet) {
      wallet.balance += transaction.amount;
      wallet.pendingWithdrawals -= transaction.amount;
      await wallet.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Withdrawal rejected and amount refunded'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get all pending recharge requests
// @route   GET /api/admin/recharge/pending
// @access  Private/Admin
const getPendingRecharges = async (req, res) => {
  try {
    const recharges = await Transaction.find({
      type: 'recharge',
      status: 'pending'
    }).populate('user', 'name phone').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      recharges
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Approve recharge request
// @route   PUT /api/admin/recharge/:id/approve
// @access  Private/Admin
const approveRecharge = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
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
    transaction.adminNotes = 'Approved by admin';
    await transaction.save();
    
    // Add amount to user's wallet
    const wallet = await Wallet.findOne({ user: transaction.user });
    if (wallet) {
      wallet.balance += transaction.amount;
      wallet.totalRecharged += transaction.amount;
      await wallet.save();
    } else {
      // Create wallet if doesn't exist
      await Wallet.create({
        user: transaction.user,
        balance: transaction.amount,
        totalRecharged: transaction.amount,
        totalWithdrawn: 0,
        pendingWithdrawals: 0
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Recharge approved and amount credited'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Reject recharge request
// @route   PUT /api/admin/recharge/:id/reject
// @access  Private/Admin
const rejectRecharge = async (req, res) => {
  try {
    const { reason } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Transaction already processed'
      });
    }
    
    transaction.status = 'rejected';
    transaction.adminNotes = reason || 'Rejected by admin';
    transaction.processedBy = req.user.id;
    transaction.processedAt = Date.now();
    await transaction.save();
    
    res.status(200).json({
      success: true,
      message: 'Recharge request rejected'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get all pending admin requests
// @route   GET /api/admin/requests/pending
// @access  Private/Admin
const getPendingAdminRequests = async (req, res) => {
  try {
    const requests = await AdminRequest.find({ status: 'pending' })
      .populate('user', 'name phone totalInvestment totalProfit');
    
    res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Approve admin request
// @route   PUT /api/admin/requests/:id/approve
// @access  Private/Admin
const approveAdminRequest = async (req, res) => {
  try {
    const adminRequest = await AdminRequest.findById(req.params.id);
    
    if (!adminRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    
    if (adminRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request already processed'
      });
    }
    
    // Update user to admin
    await User.findByIdAndUpdate(adminRequest.user, { isAdmin: true });
    
    adminRequest.status = 'approved';
    adminRequest.reviewedBy = req.user.id;
    adminRequest.reviewedAt = Date.now();
    await adminRequest.save();
    
    res.status(200).json({
      success: true,
      message: 'Admin request approved'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive, updatedAt: Date.now() },
      { new: true }
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

module.exports = {
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getPendingRecharges,
  approveRecharge,
  rejectRecharge,
  getPendingAdminRequests,
  approveAdminRequest,
  createProduct,
  getAllUsers,
  updateUserStatus
};