const deliveryRepository = require('../repositories/deliveryRepository');
const extraTiffinRepository = require('../../extraTiffins/repositories/extraTiffinRepository');
const subscriptionRepository = require('../../subscriptions/repositories/subscriptionRepository');
const ApiError = require('../../../utils/ApiError');
const { getMonthDateRange, getDayRange } = require('../../../helpers/dateHelper');

/**
 * Delivery Service
 * Contains business logic for delivery operations
 */
class DeliveryService {
  /**
   * Get deliveries for a user with optional month/year filter
   * @param {string} userId - User ID
   * @param {Object} query - { month, year }
   * @returns {Object} { count, data }
   */
  async getMyDeliveries(userId, query = {}) {
    const { month, year } = query;
    let dateFilter = null;

    if (month && year) {
      const { startDate, endDate } = getMonthDateRange(parseInt(month), parseInt(year));
      dateFilter = { $gte: startDate, $lte: endDate };
    }

    const deliveries = await deliveryRepository.findByUserId(userId, dateFilter);
    return {
      count: deliveries.length,
      data: deliveries,
    };
  }

  /**
   * Get all deliveries for a specific date (Admin only)
   *
   * Returns BOTH subscription deliveries (DailyDelivery) and one-off extra
   * tiffin orders for that date, tagged with `kind`, so the admin UI can
   * distinguish them. Without this, a user who has NO subscription and orders
   * only an extra tiffin never gets a DailyDelivery row and therefore never
   * shows up in the admin "Daily Tracking" view, even though the order exists
   * on their dashboard.
   * @param {string} dateString - Date string
   * @returns {Object} { count, data }
   */
  async getDeliveriesByDate(dateString) {
    const date = new Date(dateString);

    // Subscription-based daily deliveries
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const deliveries = await deliveryRepository.findByDateRange(date, nextDate);

    // One-off extra tiffin orders placed on the same day
    const { startOfDay, endOfDay } = getDayRange(date);
    const extraOrders = await extraTiffinRepository.findAll({
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const data = [
      ...deliveries.map((d) => ({ ...d.toObject(), kind: 'subscription' })),
      ...extraOrders.map((o) => ({ ...o.toObject(), kind: 'extra' })),
    ];

    return {
      count: data.length,
      data,
    };
  }

  /**
   * Update delivery status (Admin only)
   * @param {string} deliveryId - Delivery ID
   * @param {Object} updateData - { delivered, notes }
   * @param {string} markedBy - User ID who marked the delivery
   * @returns {Object} Updated delivery
   */
  async updateDeliveryStatus(deliveryId, updateData, markedBy) {
    const { delivered, notes } = updateData;

    const delivery = await deliveryRepository.updateById(deliveryId, {
      delivered,
      deliveredAt: delivered ? new Date() : null,
      notes,
      markedBy,
    });

    if (!delivery) {
      throw ApiError.notFound('Delivery record not found');
    }

    return delivery;
  }

  /**
   * Create daily delivery records for all active subscriptions (Admin only)
   * @param {string} dateString - Date string
   * @returns {Object} { message, count }
   */
  async createDailyDeliveries(dateString) {
    const deliveryDate = new Date(dateString);

    // Get all active subscriptions
    const subscriptions = await subscriptionRepository.findAllActive();

    const deliveryRecords = [];

    for (const sub of subscriptions) {
      // Check if delivery already exists for this user and date
      const { startOfDay, endOfDay } = getDayRange(new Date(dateString));
      const existingDelivery = await deliveryRepository.findExistingDelivery(
        sub.user,
        startOfDay,
        endOfDay
      );

      if (!existingDelivery) {
        deliveryRecords.push({
          user: sub.user,
          subscription: sub._id,
          date: deliveryDate,
          delivered: false,
        });
      }
    }

    if (deliveryRecords.length > 0) {
      await deliveryRepository.insertMany(deliveryRecords);
    }

    return {
      message: `Created ${deliveryRecords.length} delivery records`,
      count: deliveryRecords.length,
    };
  }

  /**
   * Get monthly delivery report (Admin only)
   * @param {Object} query - { month, year }
   * @returns {Array} Report data grouped by user
   */
  async getMonthlyReport(query) {
    const { month, year } = query;
    const { startDate, endDate } = getMonthDateRange(parseInt(month), parseInt(year));

    const deliveries = await deliveryRepository.findByDateRangeForReport(startDate, endDate);

    // Delivered extra tiffin orders for the same month — they add to the
    // user's bill amount till date
    const deliveredExtraOrders = await extraTiffinRepository.findAll({
      date: { $gte: startDate, $lte: endDate },
      delivered: true,
    });

    // Group by user
    const userReport = {};
    deliveries.forEach((delivery) => {
      const userId = delivery.user._id.toString();
      if (!userReport[userId]) {
        userReport[userId] = {
          user: delivery.user,
          subscription: delivery.subscription,
          totalDays: 0,
          deliveredDays: 0,
          extraTiffinsCount: 0,
          extraTiffinsAmount: 0,
        };
      }
      userReport[userId].totalDays++;
      if (delivery.delivered) {
        userReport[userId].deliveredDays++;
      }
    });

    deliveredExtraOrders.forEach((order) => {
      const userId = order.user._id ? order.user._id.toString() : order.user.toString();
      if (!userReport[userId]) {
        userReport[userId] = {
          user: order.user,
          subscription: null,
          totalDays: 0,
          deliveredDays: 0,
          extraTiffinsCount: 0,
          extraTiffinsAmount: 0,
        };
      }
      userReport[userId].extraTiffinsCount++;
      userReport[userId].extraTiffinsAmount += order.price;
    });

    const report = Object.values(userReport).map((item) => ({
      ...item,
      billAmount:
        item.deliveredDays * (item.subscription?.pricePerTiffin || 0) + item.extraTiffinsAmount,
    }));

    return report;
  }
}

module.exports = new DeliveryService();
