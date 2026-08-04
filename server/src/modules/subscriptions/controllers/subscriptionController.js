const subscriptionService = require('../services/subscriptionService');
const { sendSuccess } = require('../../../utils/responseFormatter');
const asyncHandler = require('../../../utils/asyncHandler');

/**
 * Subscription Controller
 * Handles HTTP requests for subscription operations
 */
class SubscriptionController {
  /**
   * GET /subscriptions/pricing
   * Get subscription pricing
   */
  getPricing = asyncHandler(async (req, res) => {
    const pricing = subscriptionService.getPricing();
    return sendSuccess(res, 200, 'Pricing retrieved successfully', pricing);
  });

  /**
   * GET /subscriptions
   * Get all subscriptions for logged in user
   */
  getMySubscriptions = asyncHandler(async (req, res) => {
    const result = await subscriptionService.getUserSubscriptions(req.user._id);
    return sendSuccess(res, 200, 'Subscriptions retrieved successfully', result.data, {
      count: result.count,
    });
  });

  /**
   * POST /subscriptions
   * Create a new subscription
   */
  createSubscription = asyncHandler(async (req, res) => {
    const result = await subscriptionService.createSubscription(req.user._id, req.body);
    return sendSuccess(res, 201, result.message, result.subscription);
  });

  /**
   * PUT /subscriptions/:id
   * Update a subscription
   */
  updateSubscription = asyncHandler(async (req, res) => {
    const subscription = await subscriptionService.updateSubscription(
      req.user._id,
      req.params.id,
      req.body
    );
    return sendSuccess(res, 200, 'Subscription updated successfully', subscription);
  });

  /**
   * PUT /subscriptions/:id/pause
   * Pause a subscription
   */
  pauseSubscription = asyncHandler(async (req, res) => {
    const subscription = await subscriptionService.pauseSubscription(req.user._id, req.params.id);
    return sendSuccess(res, 200, 'Subscription paused successfully', subscription);
  });

  /**
   * PUT /subscriptions/:id/resume
   * Resume a paused subscription
   */
  resumeSubscription = asyncHandler(async (req, res) => {
    const subscription = await subscriptionService.resumeSubscription(req.user._id, req.params.id);
    return sendSuccess(res, 200, 'Subscription resumed successfully', subscription);
  });

  /**
   * DELETE /subscriptions/:id
   * Cancel a subscription
   */
  cancelSubscription = asyncHandler(async (req, res) => {
    const result = await subscriptionService.cancelSubscription(req.user._id, req.params.id);
    return sendSuccess(res, 200, result.message);
  });
}

module.exports = new SubscriptionController();
