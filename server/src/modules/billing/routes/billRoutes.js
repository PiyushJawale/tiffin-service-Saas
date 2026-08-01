const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { protect, adminOnly } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const { generateBillValidation, generateAllBillsValidation } = require('../validators/billValidator');

/**
 * Bill Routes
 * Base path: /api/v1/bills
 */

// Protected routes
router.get('/my-bills', protect, billController.getMyBills);
router.get('/current-summary', protect, billController.getCurrentSummary);
router.get('/:id', protect, billController.getBillById);

// Admin only routes
router.get('/all', protect, adminOnly, billController.getAllBills);
router.post('/generate', protect, adminOnly, generateBillValidation, validate, billController.generateBill);
router.post('/generate-all', protect, adminOnly, generateAllBillsValidation, validate, billController.generateAllBills);
router.put('/:id/pay', protect, adminOnly, billController.markBillAsPaid);
router.put('/:id/toggle-status', protect, adminOnly, billController.toggleBillStatus);

module.exports = router;