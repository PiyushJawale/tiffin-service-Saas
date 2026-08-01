const adminService = require('../services/adminService');
const { sendSuccess } = require('../../../utils/responseFormatter');
const asyncHandler = require('../../../utils/asyncHandler');

/**
 * Admin Controller
 * Handles HTTP requests for admin operations
 */
class AdminController {
  /**
   * POST /admin/users
   * Create a new user (admin or regular)
   */
  createUser = asyncHandler(async (req, res) => {
    const result = await adminService.createUser(req.body);
    return sendSuccess(res, 201, result.message, result.user);
  });

  /**
   * GET /admin/users
   * Get all users with subscriptions
   */
  getAllUsers = asyncHandler(async (req, res) => {
    const result = await adminService.getAllUsers();
    return sendSuccess(res, 200, 'Users retrieved successfully', result.data, {
      count: result.count,
    });
  });

  /**
   * GET /admin/user/:id
   * Get single user with details
   */
  getUserDetails = asyncHandler(async (req, res) => {
    const result = await adminService.getUserDetails(req.params.id);
    return sendSuccess(res, 200, 'User details retrieved successfully', result);
  });

  /**
   * GET /admin/dashboard
   * Get dashboard stats
   */
  getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await adminService.getDashboardStats();
    return sendSuccess(res, 200, 'Dashboard stats retrieved successfully', stats);
  });

  /**
   * GET /admin/monthly-report
   * Get monthly delivery report
   */
  getMonthlyReport = asyncHandler(async (req, res) => {
    const report = await adminService.getMonthlyReport(req.query);
    return sendSuccess(res, 200, 'Monthly report retrieved successfully', report);
  });
}

module.exports = new AdminController();