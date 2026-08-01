const { body } = require('express-validator');

/**
 * Menu Validation Rules
 */

// Create menu item validation
const createMenuValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Menu item name is required')
    .isLength({ max: 200 })
    .withMessage('Name cannot exceed 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('mealType')
    .notEmpty()
    .withMessage('Meal type is required')
    .isIn(['veg', 'non-veg', 'jain'])
    .withMessage('Invalid meal type. Choose from: veg, non-veg, jain'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('dayOfWeek')
    .optional()
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All'])
    .withMessage('Invalid day of week'),

  body('items').optional().isArray().withMessage('Items must be an array'),

  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),

  body('nutritionalInfo.calories').optional().isFloat({ min: 0 }),
  body('nutritionalInfo.protein').optional().trim(),
  body('nutritionalInfo.carbs').optional().trim(),
  body('nutritionalInfo.fat').optional().trim(),
];

// Update menu item validation
const updateMenuValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Name cannot exceed 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('mealType')
    .optional()
    .isIn(['veg', 'non-veg', 'jain'])
    .withMessage('Invalid meal type. Choose from: veg, non-veg, jain'),

  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('dayOfWeek')
    .optional()
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All'])
    .withMessage('Invalid day of week'),

  body('items').optional().isArray().withMessage('Items must be an array'),

  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
];

module.exports = {
  createMenuValidation,
  updateMenuValidation,
};