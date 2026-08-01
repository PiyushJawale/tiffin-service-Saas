const { body } = require('express-validator');

/**
 * Bill Validation Rules
 */

// Generate bill validation
const generateBillValidation = [
  body('userId').notEmpty().withMessage('User ID is required').isMongoId().withMessage('Invalid user ID'),
  body('month').notEmpty().withMessage('Month is required').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').notEmpty().withMessage('Year is required').isInt({ min: 2000, max: 2100 }).withMessage('Invalid year'),
];

// Generate all bills validation
const generateAllBillsValidation = [
  body('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Invalid year'),
];

module.exports = {
  generateBillValidation,
  generateAllBillsValidation,
};