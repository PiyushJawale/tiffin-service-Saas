const { body } = require('express-validator');

/**
 * Extra Tiffin Validation Rules
 */

// Order extra tiffin validation
const orderExtraTiffinValidation = [
  body('menuId').optional().isMongoId().withMessage('Invalid menu ID'),
  body('mealType')
    .optional()
    .isIn(['veg', 'non-veg', 'jain'])
    .withMessage('Invalid meal type. Choose from: veg, non-veg, jain'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

module.exports = {
  orderExtraTiffinValidation,
};
