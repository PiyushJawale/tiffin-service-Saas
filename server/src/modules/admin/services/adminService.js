const adminRepository = require('../repositories/adminRepository');
const deliveryService = require('../../deliveries/services/deliveryService');
const ApiError = require('../../../utils/ApiError');
const { ROLES } = require('../../../constants');

/**
 * Admin Service
 * Contains business logic for admin operations
 */
class AdminService {
  /**
   * Create a new user (admin or regular)
   * @param {Object} userData - User data
   * @returns {Object} { user, message }
   */
  async createUser(userData) {
    const { name, email, phone, password, address, role } = userData;

    // Check if user exists
    const existingUser = await adminRepository.findUserByEmail(email);
    if (existingUser) {
      throw ApiError.conflict('User already exists with this email');
    }

    const user = await adminRepository.createUser({
      name,
      email,
      phone,
      password,
      address,
      role: role || ROLES.USER,
    });

    return {
      user,
      message: `${role === ROLES.ADMIN ? 'Admin' : 'User'} created successfully`,
    };
  }

  /**
   * Get all users with their subscription info
   * @returns {Object} { count, data }
   */
  async getAllUsers() {
    const users = await adminRepository.findAllUsers();

    // Get subscription info for each user
    const usersWithSubscriptions = await Promise.all(
      users.map(async (user) => {
        const subscription = await adminRepository.findActiveSubscriptionByUserId(user._id);
        return {
          ...user.toObject(),
          subscription,
        };
      })
    );

    return {
      count: usersWithSubscriptions.length,
      data: usersWithSubscriptions,
    };
  }

  /**
   * Get a single user with full details
   * @param {string} userId - User ID
   * @returns {Object} { user, subscriptions, bills }
   */
  async getUserDetails(userId) {
    const user = await adminRepository.findUserById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const [subscriptions, bills] = await Promise.all([
      adminRepository.findSubscriptionsByUserId(userId),
      adminRepository.findBillsByUserId(userId),
    ]);

    return {
      user,
      subscriptions,
      bills,
    };
  }

  /**
   * Get dashboard statistics
   * @returns {Object} Dashboard stats
   */
  async getDashboardStats() {
    const totalUsers = await adminRepository.countUsersByRole(ROLES.USER);
    const activeSubscriptions = await adminRepository.countActiveSubscriptions();

    // Get today's deliveries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDeliveries = await adminRepository.findTodayDeliveries(today, tomorrow);
    const deliveredCount = todayDeliveries.filter((d) => d.delivered).length;
    const pendingCount = todayDeliveries.length - deliveredCount;

    // Get pending bills
    const pendingBills = await adminRepository.findPendingBills();
    const totalPendingAmount = pendingBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    return {
      totalUsers,
      activeSubscriptions,
      todayTotal: todayDeliveries.length,
      todayDelivered: deliveredCount,
      todayPending: pendingCount,
      pendingBillsCount: pendingBills.length,
      totalPendingAmount,
    };
  }

  /**
   * Get monthly delivery report
   * @param {Object} query - { month, year }
   * @returns {Array} Report data
   */
  async getMonthlyReport(query) {
    return deliveryService.getMonthlyReport(query);
  }
}

module.exports = new AdminService();
