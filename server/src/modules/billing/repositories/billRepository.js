const Bill = require('../../../models/Bill');
const ExtraTiffinOrder = require('../../../models/ExtraTiffinOrder');

/**
 * Bill Repository
 * Handles all database operations for bills
 */
class BillRepository {
  /**
   * Find all bills (Admin)
   * @param {Object} sort - Sort options
   * @returns {Promise<Array>}
   */
  async findAll(sort = { year: -1, month: -1 }) {
    return Bill.find().populate('user', 'name email phone address').sort(sort).exec();
  }

  /**
   * Find bills by user ID
   * @param {string} userId - User ID
   * @param {Object} sort - Sort options
   * @returns {Promise<Array>}
   */
  async findByUserId(userId, sort = { year: -1, month: -1 }) {
    return Bill.find({ user: userId }).sort(sort).exec();
  }

  /**
   * Find a bill by ID
   * @param {string} id - Bill ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return Bill.findById(id).populate('user', 'name email phone address').exec();
  }

  /**
   * Find a bill by user, month, and year
   * @param {string} userId - User ID
   * @param {number} month - Month number
   * @param {number} year - Year
   * @returns {Promise<Object|null>}
   */
  async findByUserMonthYear(userId, month, year) {
    return Bill.findOne({ user: userId, month, year }).exec();
  }

  /**
   * Find pending bills
   * @returns {Promise<Array>}
   */
  async findPendingBills() {
    return Bill.find({ status: 'pending' }).populate('user', 'name email phone').exec();
  }

  /**
   * Create a new bill
   * @param {Object} billData - Bill data
   * @returns {Promise<Object>}
   */
  async create(billData) {
    return Bill.create(billData);
  }

  /**
   * Update a bill by ID
   * @param {string} id - Bill ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>}
   */
  async updateById(id, updateData) {
    return Bill.findByIdAndUpdate(id, updateData, { new: true })
      .populate('user', 'name email phone')
      .exec();
  }

  /**
   * Find a bill by ID without populate
   * @param {string} id - Bill ID
   * @returns {Promise<Object|null>}
   */
  async findByIdRaw(id) {
    return Bill.findById(id).exec();
  }

  /**
   * Save a bill document
   * @param {Object} bill - Bill document
   * @returns {Promise<Object>}
   */
  async save(bill) {
    return bill.save();
  }

  /**
   * Find extra tiffin orders for a user within a date range
   * @param {string} userId - User ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {boolean} unbilledOnly - Only unbilled orders
   * @returns {Promise<Array>}
   */
  async findExtraOrdersByDateRange(userId, startDate, endDate, unbilledOnly = true) {
    const filter = {
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    };
    if (unbilledOnly) {
      filter.addedToBill = false;
    }
    return ExtraTiffinOrder.find(filter).exec();
  }

  /**
   * Mark extra tiffin orders as added to bill
   * @param {string} userId - User ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>}
   */
  async markExtraOrdersAsBilled(userId, startDate, endDate) {
    return ExtraTiffinOrder.updateMany(
      { user: userId, date: { $gte: startDate, $lte: endDate }, addedToBill: false },
      { addedToBill: true }
    ).exec();
  }
}

module.exports = new BillRepository();
