const authRepository = require('../repositories/authRepository');
const ApiError = require('../../../utils/ApiError');
const { generateTokens, verifyRefreshToken } = require('../../../utils/token');

/**
 * Auth Service
 * Contains business logic for authentication operations
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, phone, password, address }
   * @returns {Object} { user, accessToken, refreshToken }
   */
  async register(userData) {
    const { email } = userData;

    // Check if user already exists
    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      throw ApiError.conflict('User already exists with this email');
    }

    // Create user
    const user = await authRepository.create(userData);

    // Generate tokens
    const tokens = generateTokens(user._id);

    // Store refresh token
    await authRepository.updateRefreshToken(user._id, tokens.refreshToken);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} { user, accessToken, refreshToken }
   */
  async login(email, password) {
    // Find user with password
    const user = await authRepository.findByEmail(email, true);

    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated');
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    // Generate tokens
    const tokens = generateTokens(user._id);

    // Store refresh token
    await authRepository.updateRefreshToken(user._id, tokens.refreshToken);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Get current user
   * @param {string} userId - User ID
   * @returns {Object} User object
   */
  async getCurrentUser(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - { name, phone, address }
   * @returns {Object} Updated user
   */
  async updateProfile(userId, updateData) {
    const { name, phone, address } = updateData;

    const user = await authRepository.updateById(userId, {
      name,
      phone,
      address,
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} { accessToken, refreshToken }
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await authRepository.findById(decoded.id);

      if (!user) {
        throw ApiError.unauthorized('User not found');
      }

      if (user.refreshToken !== refreshToken) {
        throw ApiError.unauthorized('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = generateTokens(user._id);
      await authRepository.updateRefreshToken(user._id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Invalid or expired refresh token');
      }
      throw error;
    }
  }

  /**
   * Logout user - clear refresh token
   * @param {string} userId - User ID
   */
  async logout(userId) {
    await authRepository.updateRefreshToken(userId, null);
  }
}

module.exports = new AuthService();
