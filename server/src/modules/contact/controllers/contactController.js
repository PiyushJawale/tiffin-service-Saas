const contactService = require('../services/contactService');
const { sendSuccess } = require('../../../utils/responseFormatter');
const asyncHandler = require('../../../utils/asyncHandler');

/**
 * Contact Controller
 * Handles HTTP requests for contact form submissions
 */
class ContactController {
  /**
   * POST /contact
   * Store a public contact form submission
   */
  submitMessage = asyncHandler(async (req, res) => {
    const message = await contactService.submitMessage(req.body);

    // Only the id goes back to the public caller - never the stored record.
    return sendSuccess(res, 201, 'Message sent successfully. We will get back to you soon.', {
      id: message._id,
    });
  });

  /**
   * GET /contact
   * List contact messages (Admin only)
   */
  listMessages = asyncHandler(async (req, res) => {
    const result = await contactService.listMessages();

    return sendSuccess(res, 200, 'Contact messages retrieved successfully', result.data, {
      count: result.count,
    });
  });
}

module.exports = new ContactController();
