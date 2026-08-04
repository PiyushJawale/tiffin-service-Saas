const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Centralized environment configuration
 * Validates required variables and provides defaults for optional ones
 */
const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiVersion: process.env.API_VERSION || 'v1',

  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tiffin-service',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '90d',

  // CORS
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // MongoDB connection options
  mongoOptions: {
    serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT, 10) || 10000,
    socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT, 10) || 45000,
  },
};

/**
 * Validate required environment variables in production
 */
const validateEnv = () => {
  if (env.nodeEnv === 'production') {
    const required = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (env.jwtSecret === 'your-super-secret-jwt-key-change-in-production') {
      throw new Error('JWT_SECRET must be changed in production');
    }

    if (env.jwtRefreshSecret === 'your-refresh-secret-key-change-in-production') {
      throw new Error('JWT_REFRESH_SECRET must be changed in production');
    }
  }
};

module.exports = { env, validateEnv };
