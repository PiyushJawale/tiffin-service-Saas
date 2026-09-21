const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect, adminOnly } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const { submitContactValidation } = require('../validators/contactValidator');

/**
 * Contact Routes
 * Base path: /api/v1/contact
 * The global api limiter already covers /api, so the public route stays rate limited.
 */

// Public route - the "Contact Us" page form
router.post('/', submitContactValidation, validate, contactController.submitMessage);

// Admin only - the Messages tab in the admin panel
router.get('/', protect, adminOnly, contactController.listMessages);

module.exports = router;
