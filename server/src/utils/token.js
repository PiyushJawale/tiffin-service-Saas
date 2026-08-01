const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

/**
 * JWT Token Utility
 * Handles generation and verification of access and refresh tokens
 */

/**
 * Generate an access token
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT access token
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

/**
 * Generate a refresh token
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });
};

/**
 * Generate both access and refresh tokens
 * @param {string} userId - User ID to encode in tokens
 * @returns {Object} { accessToken, refreshToken }
 */
const generateTokens = (userId) => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
  };
};

/**
 * Verify an access token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

/**
 * Verify a refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwtRefreshSecret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
};