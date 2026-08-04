const Subscription = require('../../../models/Subscription');

/**
 * Subscription Repository
 * Handles all database operations for subscriptions
 */
class SubscriptionRepository {
  /**
   * Find subscriptions by user ID
   * @param {string} userId - User ID
   * @param {Object} sort - Sort options
   * @returns {Promise<Array>}
   */
  async findByUserId(userId, sort = { createdAt: -1 }) {
    return Subscription.find({ user: userId })
      .populate('user', 'name email phone address')
      .sort(sort)
      .exec();
  }

  /**
   * Find a subscription by ID
   * @param {string} id - Subscription ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return Subscription.findById(id).exec();
  }

  /**
   * Find active or paused subscription for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>}
   */
  async findActiveByUserId(userId) {
    return Subscription.findOne({
      user: userId,
      status: { $in: ['active', 'paused'] },
    }).exec();
  }

  /**
   * Find all active subscriptions
   * @param {Object} filter - Additional filter
   * @param {Object} populate - Populate options
   * @returns {Promise<Array>}
   */
  async findAllActive(filter = {}, populate = null) {
    let query = Subscription.find({ status: 'active', ...filter });
    if (populate) {
      query = query.populate(populate);
    }
    return query.exec();
  }

  /**
   * Create a new subscription
   * @param {Object} subData - Subscription data
   * @returns {Promise<Object>}
   */
  async create(subData) {
    return Subscription.create(subData);
  }

  /**
   * Update a subscription by ID
   * @param {string} id - Subscription ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>}
   */
  async updateById(id, updateData) {
    return Subscription.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  /**
   * Save a subscription document
   * @param {Object} subscription - Subscription document
   * @returns {Promise<Object>}
   */
  async save(subscription) {
    return subscription.save();
  }
}

module.exports = new SubscriptionRepository();
