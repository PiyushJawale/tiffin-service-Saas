const billService = require('../services/billService');
const { sendSuccess } = require('../../../utils/responseFormatter');
const asyncHandler = require('../../../utils/asyncHandler');

/**
 * Bill Controller
 * Handles HTTP requests for billing operations
 */
class BillController {
  /**
   * GET /bills/all
   * Get all bills (Admin only)
   */
  getAllBills = asyncHandler(async (req, res) => {
    const result = await billService.getAllBills();
    return sendSuccess(res, 200, 'Bills retrieved successfully', result.data, {
      count: result.count,
    });
  });

  /**
   * GET /bills/my-bills
   * Get bills for logged in user
   */
  getMyBills = asyncHandler(async (req, res) => {
    const result = await billService.getMyBills(req.user._id);
    return sendSuccess(res, 200, 'Bills retrieved successfully', result.data, {
      count: result.count,
    });
  });

  /**
   * GET /bills/current-summary
   * Get current month billing summary for logged in user
   */
  getCurrentSummary = asyncHandler(async (req, res) => {
    const summary = await billService.getCurrentSummary(req.user._id);
    return sendSuccess(res, 200, 'Billing summary retrieved successfully', summary);
  });

  /**
   * GET /bills/:id
   * Get a single bill
   */
  getBillById = asyncHandler(async (req, res) => {
    const bill = await billService.getBillById(req.params.id, req.user);
    return sendSuccess(res, 200, 'Bill retrieved successfully', bill);
  });

  /**
   * POST /bills/generate
   * Generate monthly bill for a user (Admin only)
   */
  generateBill = asyncHandler(async (req, res) => {
    const bill = await billService.generateBill(req.body);
    return sendSuccess(res, 201, 'Bill generated successfully', bill);
  });

  /**
   * POST /bills/generate-all
   * Generate bills for all users for a month (Admin only)
   */
  generateAllBills = asyncHandler(async (req, res) => {
    const result = await billService.generateAllBills(req.body);
    return sendSuccess(res, 200, result.message, result.results);
  });

  /**
   * PUT /bills/:id/pay
   * Mark bill as paid (Admin only)
   */
  markBillAsPaid = asyncHandler(async (req, res) => {
    const bill = await billService.markBillAsPaid(req.params.id);
    return sendSuccess(res, 200, 'Bill marked as paid', bill);
  });

  /**
   * PUT /bills/:id/toggle-status
   * Toggle bill payment status (Admin only)
   */
  toggleBillStatus = asyncHandler(async (req, res) => {
    const bill = await billService.toggleBillStatus(req.params.id);
    return sendSuccess(res, 200, 'Bill status updated', bill);
  });
}

module.exports = new BillController();
