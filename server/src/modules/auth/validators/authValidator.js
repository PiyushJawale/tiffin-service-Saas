const { body } = require('express-validator');
const { emailRule, phoneRule } = require('../../../utils/validationRules');

/**
 * Auth Validation Rules
 */

// Register validation
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  emailRule('email'),

  phoneRule('phone'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('address.street').optional().trim(),
  body('address.area').optional().trim(),
  body('address.city').optional().trim(),
  body('address.pincode').optional().trim(),
];

// Login validation
const loginValidation = [
  emailRule('email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Profile update validation
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  phoneRule('phone', { optional: true }),

  body('address.street').optional().trim(),
  body('address.area').optional().trim(),
  body('address.city').optional().trim(),
  body('address.pincode').optional().trim(),
];

// Refresh token validation
const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  refreshTokenValidation,
};
