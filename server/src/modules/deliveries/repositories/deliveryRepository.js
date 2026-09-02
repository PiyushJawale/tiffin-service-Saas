const DailyDelivery = require('../../../models/DailyDelivery');
const Subscription = require('../../../models/Subscription');

/**
 * Delivery Repository
 * Handles all database operations for deliveries
 */
class DeliveryRepository {
  /**
   * Find deliveries by user ID with optional date filter
   * @param {string} userId - User ID
   * @param {Object} dateFilter - Optional date filter
   * @returns {Promise<Array>}
   */
  async findByUserId(userId, dateFilter = null) {
    const query = { user: userId };
    if (dateFilter) {
      query.date = dateFilter;
    }
    return DailyDelivery.find(query)
      .populate('subscription', 'mealType pricePerTiffin')
      .sort({ date: -1 })
      .exec();
  }

  /**
   * Find deliveries by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>}
   */
  async findByDateRange(startDate, endDate) {
    return DailyDelivery.find({
      date: { $gte: startDate, $lt: endDate },
    })
      .populate('user', 'name email phone address')
      .populate('subscription', 'mealType pricePerTiffin planType')
      .sort({ 'user.name': 1 })
      .exec();
  }

  /**
   * Find deliveries by date range with full population (for reports)
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>}
   */
  async findByDateRangeForReport(startDate, endDate) {
    return DailyDelivery.find({
      date: { $gte: startDate, $lte: endDate },
    })
      .populate('user', 'name email phone address')
      .populate('subscription', 'mealType pricePerTiffin')
      .sort({ date: 1 })
      .exec();
  }

  /**
   * Find a delivery by ID
   * @param {string} id - Delivery ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return DailyDelivery.findById(id).exec();
  }

  /**
   * Count delivered tiffins for a user within a date range
   * @param {string} userId - User ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<number>}
   */
  async countDeliveredByUserAndDateRange(userId, startDate, endDate) {
    return DailyDelivery.countDocuments({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
      delivered: true,
    }).exec();
  }

  /**
   * Update a delivery by ID
   * @param {string} id - Delivery ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>}
   */
  async updateById(id, updateData) {
    return DailyDelivery.findByIdAndUpdate(id, updateData, { new: true })
      .populate('user', 'name email phone')
      .exec();
  }

  /**
   * Find existing delivery for user and date
   * @param {string} userId - User ID
   * @param {Date} startDate - Start of day
   * @param {Date} endDate - End of day
   * @returns {Promise<Object|null>}
   */
  async findExistingDelivery(userId, startDate, endDate) {
    return DailyDelivery.findOne({
      user: userId,
      date: { $gte: startDate, $lt: endDate },
    }).exec();
  }

  /**
   * Insert multiple delivery records
   * @param {Array} records - Array of delivery records
   * @returns {Promise<Object>}
   */
  async insertMany(records) {
    return DailyDelivery.insertMany(records);
  }

  /**
   * Find active subscriptions by day name
   * @param {string} dayName - Day name
   * @returns {Promise<Array>}
   */
  async findActiveSubscriptionsByDay(dayName) {
    return Subscription.find({ status: 'active', days: dayName }).exec();
  }

  /**
   * Find all active subscriptions
   * @param {Object} populate - Populate options
   * @returns {Promise<Array>}
   */
  async findAllActiveSubscriptions(populate = null) {
    let query = Subscription.find({ status: 'active' });
    if (populate) {
      query = query.populate(populate);
    }
    return query.exec();
  }
}

module.exports = new DeliveryRepository();
