const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getUserStats,
  requestAdmin,
  getReferrals
} = require('../controllers/userController');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/stats', protect, getUserStats);
router.post('/request-admin', protect, requestAdmin);
router.get('/referrals', protect, getReferrals);

module.exports = router;