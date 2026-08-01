const menuService = require('../services/menuService');
const { sendSuccess } = require('../../../utils/responseFormatter');
const asyncHandler = require('../../../utils/asyncHandler');

/**
 * Menu Controller
 * Handles HTTP requests for menu operations
 */
class MenuController {
  /**
   * GET /menu/today
   * Get today's menu items
   */
  getTodayMenu = asyncHandler(async (req, res) => {
    const todayMenu = await menuService.getTodayMenu();
    return sendSuccess(res, 200, "Today's menu retrieved successfully", todayMenu);
  });

  /**
   * GET /menu
   * Get all menu items with optional filters
   */
  getAllMenuItems = asyncHandler(async (req, res) => {
    const result = await menuService.getAllMenuItems(req.query);
    return sendSuccess(res, 200, 'Menu items retrieved successfully', result.data, {
      count: result.count,
    });
  });

  /**
   * GET /menu/:id
   * Get a single menu item
   */
  getMenuById = asyncHandler(async (req, res) => {
    const menuItem = await menuService.getMenuById(req.params.id);
    return sendSuccess(res, 200, 'Menu item retrieved successfully', menuItem);
  });

  /**
   * POST /menu
   * Create a new menu item (Admin only)
   */
  createMenuItem = asyncHandler(async (req, res) => {
    const menuItem = await menuService.createMenuItem(req.body);
    return sendSuccess(res, 201, 'Menu item created successfully', menuItem);
  });

  /**
   * PUT /menu/:id
   * Update a menu item (Admin only)
   */
  updateMenuItem = asyncHandler(async (req, res) => {
    const menuItem = await menuService.updateMenuItem(req.params.id, req.body);
    return sendSuccess(res, 200, 'Menu item updated successfully', menuItem);
  });

  /**
   * DELETE /menu/:id
   * Delete a menu item (Admin only)
   */
  deleteMenuItem = asyncHandler(async (req, res) => {
    const result = await menuService.deleteMenuItem(req.params.id);
    return sendSuccess(res, 200, result.message);
  });
}

module.exports = new MenuController();