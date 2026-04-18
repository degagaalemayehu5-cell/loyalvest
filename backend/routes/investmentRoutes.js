const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const {
  getProducts,
  invest,
  getMyInvestments,
  getRealTimeProfit,
  claimProfit,
  calculateAllProfit
} = require('../controllers/investmentController');

router.get('/products', protect, getProducts);
router.post('/invest', protect, invest);
router.get('/my-investments', protect, getMyInvestments);
router.get('/real-time-profit', protect, getRealTimeProfit);
router.post('/claim-profit', protect, claimProfit);
router.post('/calculate-profit', protect, adminOnly, calculateAllProfit);

module.exports = router;