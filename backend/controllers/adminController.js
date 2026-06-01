const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const AdminRequest = require('../models/AdminRequest');
const Product = require('../models/Product');
const Investment = require('../models/Investment');
const { updateUserLevelByBalance } = require('../utils/calculateProfit');

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
    let wallet = await Wallet.findOne({ user: transaction.user });
    if (wallet) {
      wallet.balance += transaction.amount;
      wallet.totalRecharged += transaction.amount;
      await wallet.save();
    } else {
      wallet = await Wallet.create({
        user: transaction.user,
        balance: transaction.amount,
        totalRecharged: transaction.amount,
        totalWithdrawn: 0,
        pendingWithdrawals: 0
      });
    }

    let investmentStarted = false;
    let investment = null;
    if (transaction.product) {
      const product = await Product.findById(transaction.product);
      if (product) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (product.duration || 30));

        investment = await Investment.create({
          user: transaction.user,
          product: transaction.product,
          amount: transaction.amount,
          endDate,
          lastProfitCalculated: new Date(),
          status: 'active',
          profitEarned: 0
        });

        const user = await User.findById(transaction.user);
        if (user) {
          user.totalInvestment = (user.totalInvestment || 0) + transaction.amount;
          await user.save();
        }

        await Transaction.create({
          user: transaction.user,
          type: 'investment',
          amount: transaction.amount,
          status: 'approved',
          paymentMethod: 'investment',
          reference: investment._id.toString()
        });

        investmentStarted = true;
      }
    }

    await updateUserLevelByBalance(transaction.user);
    
    res.status(200).json({
      success: true,
      message: investmentStarted ? 'Recharge approved, amount credited, and investment started' : 'Recharge approved and amount credited',
      investmentId: investment ? investment._id : null,
      walletBalance: wallet.balance
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

// @desc    Get all admin accounts
// @route   GET /api/admin/admins
// @access  Private/Admin
const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ isAdmin: true }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, admins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a new admin account
// @route   POST /api/admin/admins
// @access  Private/Admin
const createAdmin = async (req, res) => {
  try {
    const { name, phone, password, telegramUsername, isSuperAdmin } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, phone and password are required' });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone number already exists' });
    }

    const admin = await User.create({
      name,
      phone,
      password,
      telegramUsername: telegramUsername || '',
      isAdmin: true,
      isSuperAdmin: !!isSuperAdmin,
      isActive: true
    });

    const adminData = admin.toObject();
    delete adminData.password;

    res.status(201).json({ success: true, admin: adminData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update admin account
// @route   PUT /api/admin/admins/:id
// @access  Private/Admin
const updateAdmin = async (req, res) => {
  try {
    const { name, phone, password, telegramUsername, isActive } = req.body;
    const admin = await User.findById(req.params.id).select('+password');

    if (!admin || !admin.isAdmin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    if (name) admin.name = name;
    if (phone) admin.phone = phone;
    if (typeof isActive !== 'undefined') admin.isActive = isActive;
    if (typeof telegramUsername !== 'undefined') admin.telegramUsername = telegramUsername;
    if (typeof isSuperAdmin !== 'undefined') admin.isSuperAdmin = isSuperAdmin;
    if (password) admin.password = password;

    await admin.save();

    const adminData = admin.toObject();
    delete adminData.password;

    res.status(200).json({ success: true, admin: adminData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete admin account
// @route   DELETE /api/admin/admins/:id
// @access  Private/Admin
const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || !admin.isAdmin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
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
  updateUserStatus,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
};