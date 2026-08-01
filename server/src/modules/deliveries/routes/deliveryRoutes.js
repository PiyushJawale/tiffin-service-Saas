const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { protect, adminOnly } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const { updateDeliveryValidation, createDailyValidation } = require('../validators/deliveryValidator');

/**
 * Delivery Routes
 * Base path: /api/v1/deliveries
 */

// Protected routes
router.get('/my-deliveries', protect, deliveryController.getMyDeliveries);

// Admin only routes
router.get('/date/:date', protect, adminOnly, deliveryController.getDeliveriesByDate);
router.put('/:id', protect, adminOnly, updateDeliveryValidation, validate, deliveryController.updateDeliveryStatus);
router.post('/create-daily', protect, adminOnly, createDailyValidation, validate, deliveryController.createDailyDeliveries);

module.exports = router;