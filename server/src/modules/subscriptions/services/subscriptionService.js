const subscriptionRepository = require('../repositories/subscriptionRepository');
const ApiError = require('../../../utils/ApiError');
const { PRICING } = require('../../../constants');

/**
 * Subscription Service
 * Contains business logic for subscription operations
 */
class SubscriptionService {
  /**
   * Get subscription pricing
   * @returns {Object} Pricing configuration
   */
  getPricing() {
    return PRICING;
  }

  /**
   * Get all subscriptions for a user
   * @param {string} userId - User ID
   * @returns {Object} { count, data }
   */
  async getUserSubscriptions(userId) {
    const subscriptions = await subscriptionRepository.findByUserId(userId);
    return {
      count: subscriptions.length,
      data: subscriptions,
    };
  }

  /**
   * Create a new subscription
   * @param {string} userId - User ID
   * @param {Object} subData - { mealType, deliveryTime, specialInstructions }
   * @returns {Object} Created subscription
   */
  async createSubscription(userId, subData) {
    const { mealType, deliveryTime, specialInstructions } = subData;

    // Check if user already has an active subscription
    const existingSubscription = await subscriptionRepository.findActiveByUserId(userId);
    if (existingSubscription) {
      throw ApiError.badRequest(
        'You already have an active subscription. Please cancel it first to subscribe to a new plan.'
      );
    }

    // Get pricing based on meal type
    const pricing = PRICING[mealType];
    if (!pricing) {
      throw ApiError.badRequest('Invalid meal type. Choose from: veg, non-veg, jain');
    }

    const subscription = await subscriptionRepository.create({
      user: userId,
      mealType,
      pricePerTiffin: pricing.pricePerTiffin,
      monthlyPrice: pricing.monthlyPrice,
      deliveryTime: deliveryTime || 'lunch',
      specialInstructions,
      startDate: new Date(),
      status: 'active',
    });

    return {
      subscription,
      message: `Successfully subscribed to ${mealType} plan at ₹${pricing.monthlyPrice}/month`,
    };
  }

  /**
   * Update a subscription
   * @param {string} userId - User ID
   * @param {string} subId - Subscription ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated subscription
   */
  async updateSubscription(userId, subId, updateData) {
    const subscription = await subscriptionRepository.findById(subId);

    if (!subscription) {
      throw ApiError.notFound('Subscription not found');
    }

    // Check ownership
    if (subscription.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('Not authorized to update this subscription');
    }

    // If mealType is being changed, update pricing
    if (updateData.mealType && updateData.mealType !== subscription.mealType) {
      const pricing = PRICING[updateData.mealType];
      if (pricing) {
        updateData.pricePerTiffin = pricing.pricePerTiffin;
        updateData.monthlyPrice = pricing.monthlyPrice;
      }
    }

    const updatedSubscription = await subscriptionRepository.updateById(subId, updateData);
    return updatedSubscription;
  }

  /**
   * Pause a subscription
   * @param {string} userId - User ID
   * @param {string} subId - Subscription ID
   * @returns {Object} Paused subscription
   */
  async pauseSubscription(userId, subId) {
    const subscription = await subscriptionRepository.findById(subId);

    if (!subscription) {
      throw ApiError.notFound('Subscription not found');
    }

    if (subscription.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('Not authorized');
    }

    subscription.status = 'paused';
    await subscriptionRepository.save(subscription);

    return subscription;
  }

  /**
   * Resume a paused subscription
   * @param {string} userId - User ID
   * @param {string} subId - Subscription ID
   * @returns {Object} Resumed subscription
   */
  async resumeSubscription(userId, subId) {
    const subscription = await subscriptionRepository.findById(subId);

    if (!subscription) {
      throw ApiError.notFound('Subscription not found');
    }

    if (subscription.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('Not authorized');
    }

    subscription.status = 'active';
    await subscriptionRepository.save(subscription);

    return subscription;
  }

  /**
   * Cancel a subscription
   * @param {string} userId - User ID
   * @param {string} subId - Subscription ID
   */
  async cancelSubscription(userId, subId) {
    const subscription = await subscriptionRepository.findById(subId);

    if (!subscription) {
      throw ApiError.notFound('Subscription not found');
    }

    if (subscription.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('Not authorized to cancel this subscription');
    }

    subscription.status = 'cancelled';
    subscription.endDate = new Date();
    await subscriptionRepository.save(subscription);

    return { message: 'Subscription cancelled successfully' };
  }
}

module.exports = new SubscriptionService();