const { body } = require('express-validator');

/**
 * Delivery Validation Rules
 */

// Update delivery validation
const updateDeliveryValidation = [
  body('delivered').isBoolean().withMessage('delivered must be a boolean'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

// Create daily deliveries validation
const createDailyValidation = [
  body('date').notEmpty().withMessage('Date is required').isISO8601().withMessage('Invalid date format'),
];

module.exports = {
  updateDeliveryValidation,
  createDailyValidation,
};