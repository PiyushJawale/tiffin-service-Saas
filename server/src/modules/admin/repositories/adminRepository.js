const User = require('../../../models/User');
const Subscription = require('../../../models/Subscription');
const DailyDelivery = require('../../../models/DailyDelivery');
const Bill = require('../../../models/Bill');

/**
 * Admin Repository
 * Handles all database operations for admin features
 */
class AdminRepository {
  /**
   * Count users by role
   * @param {string} role - User role
   * @returns {Promise<number>}
   */
  async countUsersByRole(role) {
    return User.countDocuments({ role }).exec();
  }

  /**
   * Find all users with role 'user'
   * @param {Object} sort - Sort options
   * @returns {Promise<Array>}
   */
  async findAllUsers(sort = { createdAt: -1 }) {
    return User.find({ role: 'user' }).select('-password').sort(sort).exec();
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>}
   */
  async findUserById(id) {
    return User.findById(id).select('-password').exec();
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>}
   */
  async findUserByEmail(email) {
    return User.findOne({ email }).exec();
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>}
   */
  async createUser(userData) {
    return User.create(userData);
  }

  /**
   * Find active subscription for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>}
   */
  async findActiveSubscriptionByUserId(userId) {
    return Subscription.findOne({ user: userId, status: 'active' }).exec();
  }

  /**
   * Find all subscriptions for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>}
   */
  async findSubscriptionsByUserId(userId) {
    return Subscription.find({ user: userId }).sort({ createdAt: -1 }).exec();
  }

  /**
   * Find bills for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>}
   */
  async findBillsByUserId(userId) {
    return Bill.find({ user: userId }).sort({ year: -1, month: -1 }).exec();
  }

  /**
   * Count active subscriptions
   * @returns {Promise<number>}
   */
  async countActiveSubscriptions() {
    return Subscription.countDocuments({ status: 'active' }).exec();
  }

  /**
   * Find today's deliveries
   * @param {Date} today - Start of today
   * @param {Date} tomorrow - Start of tomorrow
   * @returns {Promise<Array>}
   */
  async findTodayDeliveries(today, tomorrow) {
    return DailyDelivery.find({ date: { $gte: today, $lt: tomorrow } })
      .populate('user', 'name phone')
      .exec();
  }

  /**
   * Find pending bills
   * @returns {Promise<Array>}
   */
  async findPendingBills() {
    return Bill.find({ status: 'pending' }).populate('user', 'name email phone').exec();
  }
}

module.exports = new AdminRepository();
