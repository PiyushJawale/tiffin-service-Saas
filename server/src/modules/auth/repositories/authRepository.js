const User = require('../../../models/User');

/**
 * Auth Repository
 * Handles all database operations for authentication
 */
class AuthRepository {
  /**
   * Find user by email
   * @param {string} email - User email
   * @param {boolean} includePassword - Include password field
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return User.findById(id).exec();
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>}
   */
  async create(userData) {
    return User.create(userData);
  }

  /**
   * Update user by ID
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>}
   */
  async updateById(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  /**
   * Update refresh token
   * @param {string} userId - User ID
   * @param {string|null} refreshToken - Refresh token or null to clear
   * @returns {Promise<Object|null>}
   */
  async updateRefreshToken(userId, refreshToken) {
    return User.findByIdAndUpdate(userId, { refreshToken }, { new: true }).exec();
  }
}

module.exports = new AuthRepository();