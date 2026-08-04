const { body } = require('express-validator');

/**
 * Subscription Validation Rules
 */

// Create subscription validation
const createSubscriptionValidation = [
  body('mealType')
    .notEmpty()
    .withMessage('Meal type is required')
    .isIn(['veg', 'non-veg', 'jain'])
    .withMessage('Invalid meal type. Choose from: veg, non-veg, jain'),

  body('deliveryTime')
    .optional()
    .isIn(['lunch', 'dinner'])
    .withMessage('Invalid delivery time. Choose from: lunch, dinner'),

  body('specialInstructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special instructions cannot exceed 500 characters'),
];

// Update subscription validation
const updateSubscriptionValidation = [
  body('mealType')
    .optional()
    .isIn(['veg', 'non-veg', 'jain'])
    .withMessage('Invalid meal type. Choose from: veg, non-veg, jain'),

  body('deliveryTime')
    .optional()
    .isIn(['lunch', 'dinner'])
    .withMessage('Invalid delivery time. Choose from: lunch, dinner'),

  body('specialInstructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special instructions cannot exceed 500 characters'),

  body('status').optional().isIn(['active', 'paused', 'cancelled']).withMessage('Invalid status'),
];

module.exports = {
  createSubscriptionValidation,
  updateSubscriptionValidation,
};
