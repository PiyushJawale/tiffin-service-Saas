const contactRepository = require('../repositories/contactRepository');

/**
 * Contact Service
 * Contains business logic for contact form submissions
 */
class ContactService {
  /**
   * Save a public contact form submission
   * @param {Object} messageData - { name, email, phone, message }
   * @returns {Object} Created message
   */
  async submitMessage(messageData) {
    // Pick the fields explicitly so extra body keys can never be persisted.
    const { name, email, phone, message } = messageData;
    return contactRepository.create({ name, email, phone, message });
  }

  /**
   * List contact messages for the admin panel
   * @returns {Object} { count, data }
   */
  async listMessages() {
    const messages = await contactRepository.findAll();

    return {
      count: messages.length,
      data: messages,
    };
  }
}

module.exports = new ContactService();
