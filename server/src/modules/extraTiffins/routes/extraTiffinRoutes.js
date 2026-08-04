const express = require('express');
const router = express.Router();
const extraTiffinController = require('../controllers/extraTiffinController');
const { protect } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const { orderExtraTiffinValidation } = require('../validators/extraTiffinValidator');

/**
 * Extra Tiffin Routes
 * Base path: /api/v1/extra-tiffins
 */

// Protected routes
router.post(
  '/order',
  protect,
  orderExtraTiffinValidation,
  validate,
  extraTiffinController.orderExtraTiffin
);
router.get('/my-orders', protect, extraTiffinController.getMyOrders);
router.get('/current-month', protect, extraTiffinController.getCurrentMonthOrders);
router.put('/:id/deliver', protect, extraTiffinController.markAsDelivered);
router.get('/all', protect, extraTiffinController.getAllOrders);

module.exports = router;
