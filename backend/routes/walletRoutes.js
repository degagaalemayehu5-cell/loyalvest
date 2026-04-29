const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getBalance,
  requestWithdrawal,
  submitRechargeRequest,
  getRechargeInfo,
  getTransactions
} = require('../controllers/walletController');

// Important: upload.single('screenshot') must match the field name in your form
router.get('/balance', protect, getBalance);
router.post('/withdraw', protect, requestWithdrawal);
router.post('/recharge', protect, upload.single('screenshot'), submitRechargeRequest);
router.get('/recharge-info', protect, getRechargeInfo);
router.get('/transactions', protect, getTransactions);

module.exports = router;