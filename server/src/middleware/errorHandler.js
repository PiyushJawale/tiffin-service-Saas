const { sendError } = require('../utils/responseFormatter');
const logger = require('../utils/logger');
const { env } = require('../config/env');

/**
 * Centralized Error Handling Middleware
 * Handles all errors passed via next(error)
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log the error
  if (error.statusCode && error.statusCode >= 500) {
    logger.error('Unhandled error:', {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    });
  } else if (error.statusCode) {
    logger.warn('Operational error:', {
      message: error.message,
      statusCode: error.statusCode,
      path: req.path,
    });
  } else {
    logger.error('Unexpected error:', {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return sendError(res, 400, 'Validation Error', messages);
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, 409, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid ${err.path}: ${err.value}`);
  }

  // Handle our custom ApiError
  if (err.isOperational) {
    return sendError(res, err.statusCode, err.message, err.details);
  }

  // Handle unexpected errors
  const message = env.nodeEnv === 'production' ? 'Something went wrong!' : err.message;
  return sendError(res, 500, message);
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFound,
};
