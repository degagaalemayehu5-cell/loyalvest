const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');
const {
  getProducts,
  invest,
  getMyInvestments,
  calculateAllProfit
} = require('../controllers/investmentController');

router.get('/products', protect, getProducts);
router.post('/invest', protect, invest);
router.get('/my-investments', protect, getMyInvestments);
router.post('/calculate-profit', protect, adminOnly, calculateAllProfit);

module.exports = router;