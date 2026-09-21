const ContactMessage = require('../../../models/ContactMessage');

/**
 * Contact Repository
 * Handles all database operations for contact form submissions
 */
class ContactRepository {
  /**
   * Store a contact form submission
   * @param {Object} messageData - { name, email, phone, message }
   * @returns {Promise<Object>}
   */
  async create(messageData) {
    return ContactMessage.create(messageData);
  }

  /**
   * List submissions, newest first.
   * ponytail: hard cap of 200 rows and no pagination - plenty for a contact
   * inbox. Add paging/filtering here if the volume ever outgrows that.
   * @param {number} limit - max rows to return
   * @returns {Promise<Array>}
   */
  async findAll(limit = 200) {
    return ContactMessage.find().sort({ createdAt: -1, _id: -1 }).limit(limit).exec();
  }
}

module.exports = new ContactRepository();
