const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const {
  createSubscriptionValidation,
  updateSubscriptionValidation,
} = require('../validators/subscriptionValidator');

/**
 * Subscription Routes
 * Base path: /api/v1/subscriptions
 */

// Public route
router.get('/pricing', subscriptionController.getPricing);

// Protected routes
router.get('/', protect, subscriptionController.getMySubscriptions);
router.post('/', protect, createSubscriptionValidation, validate, subscriptionController.createSubscription);
router.put('/:id', protect, updateSubscriptionValidation, validate, subscriptionController.updateSubscription);
router.put('/:id/pause', protect, subscriptionController.pauseSubscription);
router.put('/:id/resume', protect, subscriptionController.resumeSubscription);
router.delete('/:id', protect, subscriptionController.cancelSubscription);

module.exports = router;