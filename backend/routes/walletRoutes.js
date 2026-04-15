const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getBalance,
  requestWithdrawal,
  submitRechargeRequest,
  getRechargeInfo,
  getTransactions
} = require('../controllers/walletController');

router.get('/balance', protect, getBalance);
router.post('/withdraw', protect, requestWithdrawal);
router.post('/recharge', protect, submitRechargeRequest);
router.get('/recharge-info', protect, getRechargeInfo);
router.get('/transactions', protect, getTransactions);

module.exports = router;