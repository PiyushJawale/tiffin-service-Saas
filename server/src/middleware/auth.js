const { verifyAccessToken } = require('../utils/token');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { ROLES } = require('../constants');

/**
 * Protect routes - requires valid JWT token
 * Attaches user object to req.user
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw ApiError.unauthorized('Not authorized to access this route');
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(ApiError.unauthorized('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(ApiError.unauthorized('Token expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Admin only access - requires admin role
 * Must be used after protect middleware
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Not authorized to access this route'));
  }

  if (req.user.role !== ROLES.ADMIN) {
    return next(ApiError.forbidden('Admin access required'));
  }

  next();
};

/**
 * Role-based authorization
 * @param  {...string} roles - Allowed roles
 * Must be used after protect middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Not authorized to access this route'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Role '${req.user.role}' is not authorized to access this route`));
    }

    next();
  };
};

/**
 * Optional auth - attaches user if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Silently continue without user for optional auth
    next();
  }
};

module.exports = {
  protect,
  adminOnly,
  authorize,
  optionalAuth,
};