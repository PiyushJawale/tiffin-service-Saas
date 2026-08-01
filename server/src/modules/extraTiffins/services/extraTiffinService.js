const extraTiffinRepository = require('../repositories/extraTiffinRepository');
const ApiError = require('../../../utils/ApiError');
const { getMonthDateRange, getDayRange } = require('../../../helpers/dateHelper');

/**
 * Extra Tiffin Service
 * Contains business logic for extra tiffin order operations
 */
class ExtraTiffinService {
  /**
   * Order an extra tiffin
   * @param {string} userId - User ID
   * @param {Object} orderData - { menuId, mealType, price, notes }
   * @returns {Object} Created order
   */
  async orderExtraTiffin(userId, orderData) {
    const { menuId, mealType, price, notes } = orderData;

    // Validate menu item exists if menuId provided
    if (menuId) {
      const menuItem = await extraTiffinRepository.findMenuById(menuId);
      if (!menuItem) {
        throw ApiError.notFound('Menu item not found');
      }
    }

    const order = await extraTiffinRepository.create({
      user: userId,
      menu: menuId || null,
      mealType: mealType || 'veg',
      price: price || 120,
      date: new Date(),
      delivered: false,
      addedToBill: false,
      notes,
    });

    return order;
  }

  /**
   * Get all extra tiffin orders for a user
   * @param {string} userId - User ID
   * @param {Object} query - { month, year, unbilledOnly }
   * @returns {Object} { count, totalAmount, data }
   */
  async getMyOrders(userId, query = {}) {
    const { month, year, unbilledOnly } = query;
    const filter = {};

    if (month && year) {
      const { startDate, endDate } = getMonthDateRange(parseInt(month), parseInt(year));
      filter.date = { $gte: startDate, $lte: endDate };
    }

    if (unbilledOnly === 'true') {
      filter.addedToBill = false;
    }

    const orders = await extraTiffinRepository.findByUserId(userId, filter);
    const totalAmount = orders.reduce((sum, order) => sum + order.price, 0);

    return {
      count: orders.length,
      totalAmount,
      data: orders,
    };
  }

  /**
   * Get extra tiffin orders for current month
   * @param {string} userId - User ID
   * @returns {Object} { count, totalAmount, data }
   */
  async getCurrentMonthOrders(userId) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const { startDate, endDate } = getMonthDateRange(currentMonth, currentYear);

    const orders = await extraTiffinRepository.findByUserId(userId, {
      date: { $gte: startDate, $lte: endDate },
      addedToBill: false,
    });

    const totalAmount = orders.reduce((sum, order) => sum + order.price, 0);

    return {
      count: orders.length,
      totalAmount,
      data: orders,
    };
  }

  /**
   * Mark extra tiffin as delivered
   * @param {string} orderId - Order ID
   * @param {Object} user - Requesting user
   * @returns {Object} Updated order
   */
  async markAsDelivered(orderId, user) {
    const order = await extraTiffinRepository.findById(orderId);

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Check ownership or admin
    if (order.user.toString() !== user._id.toString() && user.role !== 'admin') {
      throw ApiError.forbidden('Not authorized');
    }

    order.delivered = true;
    await extraTiffinRepository.save(order);

    return order;
  }

  /**
   * Get all extra tiffin orders (Admin only)
   * @param {Object} query - { month, year, date }
   * @returns {Object} { count, data }
   */
  async getAllOrders(query = {}) {
    const { month, year, date } = query;
    const filter = {};

    if (date) {
      const { startOfDay, endOfDay } = getDayRange(new Date(date));
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (month && year) {
      const { startDate, endDate } = getMonthDateRange(parseInt(month), parseInt(year));
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const orders = await extraTiffinRepository.findAll(filter);

    return {
      count: orders.length,
      data: orders,
    };
  }
}

module.exports = new ExtraTiffinService();