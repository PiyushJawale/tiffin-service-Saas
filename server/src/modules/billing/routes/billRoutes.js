const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { protect, adminOnly } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const {
  generateBillValidation,
  generateAllBillsValidation,
} = require('../validators/billValidator');

/**
 * Bill Routes
 * Base path: /api/v1/bills
 */

// Protected routes
router.get('/my-bills', protect, billController.getMyBills);
router.get('/current-summary', protect, billController.getCurrentSummary);

// Admin only routes
// NOTE: `/all` MUST be declared before `/:id` — otherwise Express matches
// `/bills/all` against `/:id` and tries to cast "all" as a Mongo ObjectId,
// which returns "Invalid _id: all" and silently breaks the admin
// "Generated Bills" section.
router.get('/all', protect, adminOnly, billController.getAllBills);
router.get('/:id', protect, billController.getBillById);
router.post(
  '/generate',
  protect,
  adminOnly,
  generateBillValidation,
  validate,
  billController.generateBill
);
router.post(
  '/generate-all',
  protect,
  adminOnly,
  generateAllBillsValidation,
  validate,
  billController.generateAllBills
);
router.put('/:id/pay', protect, adminOnly, billController.markBillAsPaid);
router.put('/:id/toggle-status', protect, adminOnly, billController.toggleBillStatus);

module.exports = router;
