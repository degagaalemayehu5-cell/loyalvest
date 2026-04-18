const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
], register);

router.post('/login', [
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
], login);

router.get('/me', protect, getMe);
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate
], changePassword);

module.exports = router;