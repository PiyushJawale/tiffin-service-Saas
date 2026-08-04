const menuRepository = require('../repositories/menuRepository');
const ApiError = require('../../../utils/ApiError');
const { getDayName, formatDate } = require('../../../helpers/dateHelper');

/**
 * Menu Service
 * Contains business logic for menu operations
 */
class MenuService {
  /**
   * Get today's menu items
   * @returns {Object} Today's menu grouped by meal type
   */
  async getTodayMenu() {
    const today = getDayName();

    const menuItems = await menuRepository.findAll(
      {
        isAvailable: true,
        dayOfWeek: { $in: [today, 'All'] },
      },
      { mealType: 1 }
    );

    const todayMenu = {
      veg: menuItems.find((item) => item.mealType === 'veg') || null,
      'non-veg': menuItems.find((item) => item.mealType === 'non-veg') || null,
      jain: menuItems.find((item) => item.mealType === 'jain') || null,
      dayName: today,
      date: formatDate(new Date()),
    };

    return todayMenu;
  }

  /**
   * Get all menu items with optional filters
   * @param {Object} query - { mealType, day }
   * @returns {Object} { count, data }
   */
  async getAllMenuItems(query = {}) {
    const { mealType, day } = query;
    const filter = { isAvailable: true };

    if (mealType) filter.mealType = mealType;
    if (day) filter.dayOfWeek = { $in: [day, 'All'] };

    const menuItems = await menuRepository.findAll(filter);

    return {
      count: menuItems.length,
      data: menuItems,
    };
  }

  /**
   * Get a single menu item by ID
   * @param {string} id - Menu item ID
   * @returns {Object} Menu item
   */
  async getMenuById(id) {
    const menuItem = await menuRepository.findById(id);

    if (!menuItem) {
      throw ApiError.notFound('Menu item not found');
    }

    return menuItem;
  }

  /**
   * Create a new menu item (Admin only)
   * @param {Object} menuData - Menu item data
   * @returns {Object} Created menu item
   */
  async createMenuItem(menuData) {
    return menuRepository.create(menuData);
  }

  /**
   * Update a menu item (Admin only)
   * @param {string} id - Menu item ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated menu item
   */
  async updateMenuItem(id, updateData) {
    const menuItem = await menuRepository.updateById(id, updateData);

    if (!menuItem) {
      throw ApiError.notFound('Menu item not found');
    }

    return menuItem;
  }

  /**
   * Delete a menu item (Admin only)
   * @param {string} id - Menu item ID
   */
  async deleteMenuItem(id) {
    const menuItem = await menuRepository.deleteById(id);

    if (!menuItem) {
      throw ApiError.notFound('Menu item not found');
    }

    return { message: 'Menu item deleted successfully' };
  }
}

module.exports = new MenuService();
