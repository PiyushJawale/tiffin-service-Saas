const ExtraTiffinOrder = require('../../../models/ExtraTiffinOrder');
const Menu = require('../../../models/Menu');

/**
 * Extra Tiffin Repository
 * Handles all database operations for extra tiffin orders
 */
class ExtraTiffinRepository {
  /**
   * Create a new extra tiffin order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>}
   */
  async create(orderData) {
    return ExtraTiffinOrder.create(orderData);
  }

  /**
   * Find extra tiffin orders by user ID with optional filters
   * @param {string} userId - User ID
   * @param {Object} filter - Additional filter
   * @returns {Promise<Array>}
   */
  async findByUserId(userId, filter = {}) {
    return ExtraTiffinOrder.find({ user: userId, ...filter })
      .populate('menu', 'name mealType price')
      .sort({ date: -1 })
      .exec();
  }

  /**
   * Find extra tiffin orders with filters (Admin)
   * @param {Object} filter - Query filter
   * @returns {Promise<Array>}
   */
  async findAll(filter = {}) {
    return ExtraTiffinOrder.find(filter)
      .populate('user', 'name email phone address')
      .populate('menu', 'name mealType price')
      .sort({ date: -1 })
      .exec();
  }

  /**
   * Find an order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return ExtraTiffinOrder.findById(id).exec();
  }

  /**
   * Save an order document
   * @param {Object} order - Order document
   * @returns {Promise<Object>}
   */
  async save(order) {
    return order.save();
  }

  /**
   * Find extra tiffin orders for a user within a date range
   * @param {string} userId - User ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {boolean} unbilledOnly - Only unbilled orders
   * @param {boolean} deliveredOnly - Only delivered orders
   * @returns {Promise<Array>}
   */
  async findByDateRange(userId, startDate, endDate, unbilledOnly = true, deliveredOnly = false) {
    const filter = {
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    };
    if (unbilledOnly) {
      filter.addedToBill = false;
    }
    if (deliveredOnly) {
      filter.delivered = true;
    }
    return ExtraTiffinOrder.find(filter).exec();
  }

  /**
   * Mark extra tiffin orders as added to bill
   * @param {string} userId - User ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {boolean} deliveredOnly - Only mark delivered orders
   * @returns {Promise<Object>}
   */
  async markAsBilled(userId, startDate, endDate, deliveredOnly = false) {
    const filter = {
      user: userId,
      date: { $gte: startDate, $lte: endDate },
      addedToBill: false,
    };
    if (deliveredOnly) {
      filter.delivered = true;
    }
    return ExtraTiffinOrder.updateMany(filter, { addedToBill: true }).exec();
  }

  /**
   * Find a menu item by ID
   * @param {string} id - Menu item ID
   * @returns {Promise<Object|null>}
   */
  async findMenuById(id) {
    return Menu.findById(id).exec();
  }
}

module.exports = new ExtraTiffinRepository();
