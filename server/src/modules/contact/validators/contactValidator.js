const { body } = require('express-validator');
const { emailRule, phoneRule } = require('../../../utils/validationRules');

/**
 * Contact Validation Rules
 *
 * Email and phone reuse the shared rules (server/src/utils/validationRules.js)
 * so the contact form accepts exactly what signup accepts. Keep the message
 * bounds in sync with client/src/utils/validation.js.
 */

const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 1000;

// Public contact form submission
const submitContactValidation = [
  // Validate raw types before shared sanitizers can coerce arrays/objects.
  ...['name', 'email', 'phone', 'message'].map((field) =>
    body(field).isString().withMessage(`${field} must be text`).bail({ level: 'request' })
  ),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .bail()
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  emailRule('email'),

  phoneRule('phone'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .bail()
    .isLength({ min: MESSAGE_MIN_LENGTH, max: MESSAGE_MAX_LENGTH })
    .withMessage(
      `Message must be between ${MESSAGE_MIN_LENGTH} and ${MESSAGE_MAX_LENGTH} characters`
    ),
];

module.exports = {
  MESSAGE_MIN_LENGTH,
  MESSAGE_MAX_LENGTH,
  submitContactValidation,
};
