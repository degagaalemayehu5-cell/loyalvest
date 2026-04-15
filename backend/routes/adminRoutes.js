const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
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

// Product routes
router.post('/products', createProduct);

// User management routes
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);

module.exports = router;