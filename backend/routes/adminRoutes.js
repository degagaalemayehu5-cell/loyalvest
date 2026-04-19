const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const Product = require('../models/Product');
const {
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getPendingAdminRequests,
  approveAdminRequest,
  createProduct,
  getAllUsers,
  updateUserStatus,
  getPendingRecharges,
  approveRecharge,
  rejectRecharge
} = require('../controllers/adminController');

// All routes require admin access
router.use(protect);
router.use(adminOnly);

// Withdrawal routes
router.get('/withdrawals/pending', getPendingWithdrawals);
router.put('/withdrawals/:id/approve', approveWithdrawal);
router.put('/withdrawals/:id/reject', rejectWithdrawal);

// Recharge routes
router.get('/recharge/pending', getPendingRecharges);
router.put('/recharge/:id/approve', approveRecharge);
router.put('/recharge/:id/reject', rejectRecharge);

// Admin request routes
router.get('/requests/pending', getPendingAdminRequests);
router.put('/requests/:id/approve', approveAdminRequest);

// Product routes - ADD THESE
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ minLevel: 1, minInvestment: 1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/products', createProduct);

router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// User management routes
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);

module.exports = router;