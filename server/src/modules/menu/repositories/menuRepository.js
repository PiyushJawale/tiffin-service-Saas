const Menu = require('../../../models/Menu');

/**
 * Menu Repository
 * Handles all database operations for menu items
 */
class MenuRepository {
  /**
   * Find all menu items with optional filters
   * @param {Object} filter - Query filter
   * @param {Object} sort - Sort options
   * @returns {Promise<Array>}
   */
  async findAll(filter = {}, sort = { createdAt: -1 }) {
    return Menu.find(filter).sort(sort).exec();
  }

  /**
   * Find a single menu item by ID
   * @param {string} id - Menu item ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return Menu.findById(id).exec();
  }

  /**
   * Create a new menu item
   * @param {Object} menuData - Menu item data
   * @returns {Promise<Object>}
   */
  async create(menuData) {
    return Menu.create(menuData);
  }

  /**
   * Update a menu item by ID
   * @param {string} id - Menu item ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>}
   */
  async updateById(id, updateData) {
    return Menu.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  /**
   * Delete a menu item by ID
   * @param {string} id - Menu item ID
   * @returns {Promise<Object|null>}
   */
  async deleteById(id) {
    return Menu.findByIdAndDelete(id).exec();
  }
}

module.exports = new MenuRepository();
