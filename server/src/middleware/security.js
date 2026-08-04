const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const { env } = require('../config/env');

/**
 * Security Middleware Configuration
 * Combines all security-related middleware into a single setup
 */

/**
 * Helmet middleware for secure HTTP headers
 */
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * CORS configuration
 */
const corsOptions = {
  origin: env.nodeEnv === 'production' ? [env.clientUrl] : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // 24 hours
};

const corsMiddleware = cors(corsOptions);

/**
 * Rate limiting - prevents brute force attacks
 */
const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiting for auth routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.nodeEnv === 'production' ? 10 : 100, // 10 in production, 100 in development
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * MongoDB injection protection
 */
const mongoSanitizeMiddleware = mongoSanitize();

/**
 * XSS protection - sanitizes user input
 */
const xssMiddleware = xss();

/**
 * HTTP Parameter Pollution protection
 */
const hppMiddleware = hpp({
  whitelist: ['mealType', 'day', 'status', 'sort'],
});

module.exports = {
  helmetMiddleware,
  corsMiddleware,
  apiLimiter,
  authLimiter,
  mongoSanitizeMiddleware,
  xssMiddleware,
  hppMiddleware,
};
