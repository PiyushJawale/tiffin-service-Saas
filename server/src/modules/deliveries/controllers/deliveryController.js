const deliveryService = require('../services/deliveryService');
const { sendSuccess } = require('../../../utils/responseFormatter');
const asyncHandler = require('../../../utils/asyncHandler');

/**
 * Delivery Controller
 * Handles HTTP requests for delivery operations
 */
class DeliveryController {
  /**
   * GET /deliveries/my-deliveries
   * Get deliveries for logged in user
   */
  getMyDeliveries = asyncHandler(async (req, res) => {
    const result = await deliveryService.getMyDeliveries(req.user._id, req.query);
    return sendSuccess(res, 200, 'Deliveries retrieved successfully', result.data, {
      count: result.count,
    });
  });

  /**
   * GET /deliveries/date/:date
   * Get all deliveries for a specific date (Admin only)
   */
  getDeliveriesByDate = asyncHandler(async (req, res) => {
    const result = await deliveryService.getDeliveriesByDate(req.params.date);
    return sendSuccess(res, 200, 'Deliveries retrieved successfully', result.data, {
      count: result.count,
    });
  });

  /**
   * PUT /deliveries/:id
   * Mark delivery as delivered/not delivered (Admin only)
   */
  updateDeliveryStatus = asyncHandler(async (req, res) => {
    const delivery = await deliveryService.updateDeliveryStatus(
      req.params.id,
      req.body,
      req.user._id
    );
    return sendSuccess(res, 200, 'Delivery updated successfully', delivery);
  });

  /**
   * POST /deliveries/create-daily
   * Create delivery records for all active subscriptions (Admin only)
   */
  createDailyDeliveries = asyncHandler(async (req, res) => {
    const result = await deliveryService.createDailyDeliveries(req.body.date);
    return sendSuccess(res, 200, result.message, null, { count: result.count });
  });
}

module.exports = new DeliveryController();