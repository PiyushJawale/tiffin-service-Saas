const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { protect, adminOnly } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const { createMenuValidation, updateMenuValidation } = require('../validators/menuValidator');

/**
 * Menu Routes
 * Base path: /api/v1/menu
 */

// Public routes
router.get('/today', menuController.getTodayMenu);
router.get('/', menuController.getAllMenuItems);
router.get('/:id', menuController.getMenuById);

// Admin only routes
router.post('/', protect, adminOnly, createMenuValidation, validate, menuController.createMenuItem);
router.put('/:id', protect, adminOnly, updateMenuValidation, validate, menuController.updateMenuItem);
router.delete('/:id', protect, adminOnly, menuController.deleteMenuItem);

module.exports = router;