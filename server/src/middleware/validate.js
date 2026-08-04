const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Validation Result Middleware
 * Checks express-validator results and throws error if validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return next(ApiError.badRequest('Validation Error', errorMessages));
  }

  next();
};

module.exports = validate;
