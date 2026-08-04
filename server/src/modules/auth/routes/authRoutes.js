const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../../../middleware/auth');
const { authLimiter } = require('../../../middleware/security');
const validate = require('../../../middleware/validate');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  refreshTokenValidation,
} = require('../validators/authValidator');

/**
 * Auth Routes
 * Base path: /api/v1/auth
 */

// Public routes (with auth rate limiter)
router.post('/register', authLimiter, registerValidation, validate, authController.register);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.post('/refresh-token', refreshTokenValidation, validate, authController.refreshToken);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, updateProfileValidation, validate, authController.updateProfile);
router.post('/logout', protect, authController.logout);

module.exports = router;
