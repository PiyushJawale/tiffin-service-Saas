const billRepository = require('../repositories/billRepository');
const subscriptionRepository = require('../../subscriptions/repositories/subscriptionRepository');
const ApiError = require('../../../utils/ApiError');
const { PRICING } = require('../../../constants');
const { getMonthName, getMonthDateRange, getDaysInMonth } = require('../../../helpers/dateHelper');

/**
 * Bill Service
 * Contains business logic for billing operations
 */

/**
 * Helper to get subscription price with backward compatibility
 */
const getSubscriptionPrice = (subscription) => {
  if (subscription.monthlyPrice) {
    return {
      monthlyPrice: subscription.monthlyPrice,
      pricePerTiffin: subscription.pricePerTiffin,
    };
  }
  const pricing = PRICING[subscription.mealType];
  return pricing || { monthlyPrice: 2200, pricePerTiffin: 120 };
};

class BillService {
  /**
   * Get all bills (Admin only)
   * @returns {Object} { count, data }
   */
  async getAllBills() {
    const bills = await billRepository.findAll();
    return {
      count: bills.length,
      data: bills,
    };
  }

  /**
   * Get bills for a user
   * @param {string} userId - User ID
   * @returns {Object} { count, data }
   */
  async getMyBills(userId) {
    const bills = await billRepository.findByUserId(userId);
    return {
      count: bills.length,
      data: bills,
    };
  }

  /**
   * Get current month billing summary for a user
   * @param {string} userId - User ID
   * @returns {Object} Billing summary
   */
  async getCurrentSummary(userId) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get user's subscription (active or paused)
    const subscription = await subscriptionRepository.findActiveByUserId(userId);

    // Get extra tiffin orders for current month
    const { startDate, endDate } = getMonthDateRange(currentMonth, currentYear);
    const extraOrders = await billRepository.findExtraOrdersByDateRange(userId, startDate, endDate);

    const extraTiffinsCount = extraOrders.length;
    const extraTiffinsAmount = extraOrders.reduce((sum, order) => sum + order.price, 0);

    // Calculate subscription amount (pro-rated if mid-month start)
    let subscriptionAmount = 0;
    let subscriptionDays = 0;

    if (subscription) {
      const prices = getSubscriptionPrice(subscription);
      const daysInMonth = getDaysInMonth(currentMonth, currentYear);
      const currentDay = now.getDate();

      const subStartDate = new Date(subscription.startDate);
      if (
        subStartDate.getMonth() + 1 === currentMonth &&
        subStartDate.getFullYear() === currentYear
      ) {
        const startDay = subStartDate.getDate();
        subscriptionDays = currentDay - startDay + 1;
        subscriptionAmount = Math.round((prices.monthlyPrice / daysInMonth) * subscriptionDays);
      } else {
        subscriptionDays = currentDay;
        subscriptionAmount = prices.monthlyPrice;
      }
    }

    const totalAmount = subscriptionAmount + extraTiffinsAmount;
    const subscriptionPrices = subscription ? getSubscriptionPrice(subscription) : null;

    return {
      month: currentMonth,
      year: currentYear,
      monthName: getMonthName(currentMonth),
      subscription: subscription
        ? {
            mealType: subscription.mealType,
            monthlyPrice: subscriptionPrices.monthlyPrice,
            pricePerTiffin: subscriptionPrices.pricePerTiffin,
            status: subscription.status,
          }
        : null,
      subscriptionAmount,
      subscriptionDays,
      extraTiffinsCount,
      extraTiffinsAmount,
      totalAmount,
      extraOrders,
    };
  }

  /**
   * Get a single bill by ID
   * @param {string} billId - Bill ID
   * @param {Object} user - Requesting user
   * @returns {Object} Bill
   */
  async getBillById(billId, user) {
    const bill = await billRepository.findById(billId);

    if (!bill) {
      throw ApiError.notFound('Bill not found');
    }

    // Check ownership or admin
    if (bill.user._id.toString() !== user._id.toString() && user.role !== 'admin') {
      throw ApiError.forbidden('Not authorized');
    }

    return bill;
  }

  /**
   * Generate a monthly bill for a user (Admin only)
   * @param {Object} billData - { userId, month, year }
   * @returns {Object} Created bill
   */
  async generateBill(billData) {
    const { userId, month, year } = billData;

    // Check if bill already exists
    const existingBill = await billRepository.findByUserMonthYear(userId, month, year);
    if (existingBill) {
      throw ApiError.badRequest('Bill already exists for this month');
    }

    // Get subscription for price
    const subscription = await subscriptionRepository.findActiveByUserId(userId);
    if (!subscription) {
      throw ApiError.badRequest('No active subscription found for this user');
    }

    // Calculate subscription amount
    const daysInMonth = getDaysInMonth(month, year);
    let subscriptionAmount = subscription.monthlyPrice;
    let subscriptionDays = daysInMonth;

    const subStartDate = new Date(subscription.startDate);
    if (subStartDate.getMonth() + 1 === month && subStartDate.getFullYear() === year) {
      const startDay = subStartDate.getDate();
      subscriptionDays = daysInMonth - startDay + 1;
      subscriptionAmount = Math.round((subscription.monthlyPrice / daysInMonth) * subscriptionDays);
    }

    // Get extra tiffin orders for the month
    const { startDate, endDate } = getMonthDateRange(month, year);
    const extraOrders = await billRepository.findExtraOrdersByDateRange(userId, startDate, endDate);

    const extraTiffinsCount = extraOrders.length;
    const extraTiffinsAmount = extraOrders.reduce((sum, order) => sum + order.price, 0);

    // Mark extra orders as added to bill
    await billRepository.markExtraOrdersAsBilled(userId, startDate, endDate);

    const totalAmount = subscriptionAmount + extraTiffinsAmount;

    const bill = await billRepository.create({
      user: userId,
      month,
      year,
      subscriptionAmount,
      subscriptionDays,
      extraTiffinsCount,
      extraTiffinsAmount,
      totalAmount,
      status: 'pending',
      dueDate: new Date(year, month, 10),
    });

    return bill;
  }

  /**
   * Generate bills for all users for a month (Admin only)
   * @param {Object} data - { month, year }
   * @returns {Object} { message, results }
   */
  async generateAllBills(data = {}) {
    const now = new Date();
    const month = data.month || now.getMonth() + 1;
    const year = data.year || now.getFullYear();

    const subscriptions = await subscriptionRepository.findAllActive('user', 'name email');

    if (subscriptions.length === 0) {
      return {
        message: 'No active subscriptions found. Users need to subscribe first.',
        results: [],
      };
    }

    const results = [];
    const daysInMonth = getDaysInMonth(month, year);
    const { startDate, endDate } = getMonthDateRange(month, year);

    for (const sub of subscriptions) {
      try {
        const existingBill = await billRepository.findByUserMonthYear(sub.user._id, month, year);

        let subscriptionAmount = sub.monthlyPrice;
        let subscriptionDays = daysInMonth;

        const subStartDate = new Date(sub.startDate);
        if (subStartDate.getMonth() + 1 === month && subStartDate.getFullYear() === year) {
          const startDay = subStartDate.getDate();
          subscriptionDays = daysInMonth - startDay + 1;
          subscriptionAmount = Math.round((sub.monthlyPrice / daysInMonth) * subscriptionDays);
        }

        const extraOrders = await billRepository.findExtraOrdersByDateRange(
          sub.user._id,
          startDate,
          endDate
        );

        const extraTiffinsCount = extraOrders.length;
        const extraTiffinsAmount = extraOrders.reduce((sum, order) => sum + order.price, 0);

        await billRepository.markExtraOrdersAsBilled(sub.user._id, startDate, endDate);

        const totalAmount = subscriptionAmount + extraTiffinsAmount;

        if (existingBill) {
          existingBill.subscriptionAmount = subscriptionAmount;
          existingBill.subscriptionDays = subscriptionDays;
          existingBill.extraTiffinsCount = extraTiffinsCount;
          existingBill.extraTiffinsAmount = extraTiffinsAmount;
          existingBill.totalAmount = totalAmount;
          await billRepository.save(existingBill);

          results.push({
            user: sub.user.name,
            status: 'updated',
            subscriptionAmount,
            extraTiffinsCount,
            extraTiffinsAmount,
            totalAmount,
          });
        } else {
          await billRepository.create({
            user: sub.user._id,
            month,
            year,
            subscriptionAmount,
            subscriptionDays,
            extraTiffinsCount,
            extraTiffinsAmount,
            totalAmount,
            status: 'pending',
            dueDate: new Date(year, month, 10),
          });

          results.push({
            user: sub.user.name,
            status: 'created',
            subscriptionAmount,
            extraTiffinsCount,
            extraTiffinsAmount,
            totalAmount,
          });
        }
      } catch (err) {
        results.push({
          user: sub.user.name,
          status: 'error',
          message: err.message,
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'created' || r.status === 'updated').length;
    return {
      message: `Generated/Updated ${successCount} bills for ${getMonthName(month)} ${year}`,
      results,
    };
  }

  /**
   * Mark bill as paid (Admin only)
   * @param {string} billId - Bill ID
   * @returns {Object} Updated bill
   */
  async markBillAsPaid(billId) {
    const bill = await billRepository.updateById(billId, {
      status: 'paid',
      paidAt: new Date(),
    });

    if (!bill) {
      throw ApiError.notFound('Bill not found');
    }

    return bill;
  }

  /**
   * Toggle bill payment status (Admin only)
   * @param {string} billId - Bill ID
   * @returns {Object} Updated bill
   */
  async toggleBillStatus(billId) {
    const bill = await billRepository.findByIdRaw(billId);

    if (!bill) {
      throw ApiError.notFound('Bill not found');
    }

    if (bill.status === 'paid') {
      bill.status = 'pending';
      bill.paidAt = null;
    } else {
      bill.status = 'paid';
      bill.paidAt = new Date();
    }

    await billRepository.save(bill);

    const updatedBill = await billRepository.findById(billId);
    return updatedBill;
  }
}

module.exports = new BillService();