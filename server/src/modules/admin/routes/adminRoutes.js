const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const { createUserValidation } = require('../validators/adminValidator');

/**
 * Admin Routes
 * Base path: /api/v1/admin
 * All routes require admin access
 */

router.use(protect, adminOnly);

router.post('/users', createUserValidation, validate, adminController.createUser);
router.get('/users', adminController.getAllUsers);
router.get('/user/:id', adminController.getUserDetails);
router.get('/dashboard', adminController.getDashboardStats);
router.get('/monthly-report', adminController.getMonthlyReport);

module.exports = router;