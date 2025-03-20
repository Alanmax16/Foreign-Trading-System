const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  setupMFA,
  verifyMFA,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/setup-mfa', protect, setupMFA);
router.post('/verify-mfa', verifyMFA);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
