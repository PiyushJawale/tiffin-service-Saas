const extraTiffinService = require('../services/extraTiffinService');
const { sendSuccess } = require('../../../utils/responseFormatter');
const asyncHandler = require('../../../utils/asyncHandler');
const { ROLES } = require('../../../constants');
const ApiError = require('../../../utils/ApiError');

/**
 * Extra Tiffin Controller
 * Handles HTTP requests for extra tiffin order operations
 */
class ExtraTiffinController {
  /**
   * POST /extra-tiffins/order
   * Order an extra tiffin
   */
  orderExtraTiffin = asyncHandler(async (req, res) => {
    const order = await extraTiffinService.orderExtraTiffin(req.user._id, req.body);
    return sendSuccess(res, 201, 'Extra tiffin ordered successfully', order);
  });

  /**
   * GET /extra-tiffins/my-orders
   * Get all extra tiffin orders for logged in user
   */
  getMyOrders = asyncHandler(async (req, res) => {
    const result = await extraTiffinService.getMyOrders(req.user._id, req.query);
    return sendSuccess(res, 200, 'Orders retrieved successfully', result.data, {
      count: result.count,
      totalAmount: result.totalAmount,
    });
  });

  /**
   * GET /extra-tiffins/current-month
   * Get extra tiffin orders for current month
   */
  getCurrentMonthOrders = asyncHandler(async (req, res) => {
    const result = await extraTiffinService.getCurrentMonthOrders(req.user._id);
    return sendSuccess(res, 200, 'Current month orders retrieved successfully', result.data, {
      count: result.count,
      totalAmount: result.totalAmount,
    });
  });

  /**
   * PUT /extra-tiffins/:id/deliver
   * Mark extra tiffin as delivered
   */
  markAsDelivered = asyncHandler(async (req, res) => {
    const order = await extraTiffinService.markAsDelivered(req.params.id, req.user);
    return sendSuccess(res, 200, 'Order marked as delivered', order);
  });

  /**
   * GET /extra-tiffins/all
   * Get all extra tiffin orders (Admin only)
   */
  getAllOrders = asyncHandler(async (req, res) => {
    if (req.user.role !== ROLES.ADMIN) {
      throw ApiError.forbidden('Admin access required');
    }

    const result = await extraTiffinService.getAllOrders(req.query);
    return sendSuccess(res, 200, 'All orders retrieved successfully', result.data, {
      count: result.count,
    });
  });
}

module.exports = new ExtraTiffinController();