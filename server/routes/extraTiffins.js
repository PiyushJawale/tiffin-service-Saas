const express = require('express');
const router = express.Router();
const ExtraTiffinOrder = require('../models/ExtraTiffinOrder');
const Menu = require('../models/Menu');
const { protect } = require('../middleware/auth');

// @route   POST /api/extra-tiffins/order
// @desc    Order an extra tiffin from today's menu
// @access  Private
router.post('/order', protect, async (req, res) => {
  try {
    const { menuId, mealType, price, notes } = req.body;

    // Validate menu item exists if menuId provided
    if (menuId) {
      const menuItem = await Menu.findById(menuId);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found',
        });
      }
    }

    const order = await ExtraTiffinOrder.create({
      user: req.user._id,
      menu: menuId || null,
      mealType: mealType || 'veg',
      price: price || 120,
      date: new Date(),
      delivered: false,
      addedToBill: false,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Extra tiffin ordered successfully',
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/extra-tiffins/my-orders
// @desc    Get all extra tiffin orders for logged in user
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const { month, year, unbilledOnly } = req.query;

    let query = { user: req.user._id };

    // Filter by month/year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Filter unbilled only
    if (unbilledOnly === 'true') {
      query.addedToBill = false;
    }

    const orders = await ExtraTiffinOrder.find(query)
      .populate('menu', 'name mealType price')
      .sort({ date: -1 });

    // Calculate total
    const totalAmount = orders.reduce((sum, order) => sum + order.price, 0);

    res.json({
      success: true,
      count: orders.length,
      totalAmount,
      data: orders,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/extra-tiffins/current-month
// @desc    Get extra tiffin orders for current month
// @access  Private
router.get('/current-month', protect, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    const orders = await ExtraTiffinOrder.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate },
      addedToBill: false,
    }).populate('menu', 'name mealType price');

    const totalAmount = orders.reduce((sum, order) => sum + order.price, 0);

    res.json({
      success: true,
      count: orders.length,
      totalAmount,
      data: orders,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/extra-tiffins/:id/deliver
// @desc    Mark extra tiffin as delivered
// @access  Private
router.put('/:id/deliver', protect, async (req, res) => {
  try {
    const order = await ExtraTiffinOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    order.delivered = true;
    await order.save();

    res.json({
      success: true,
      message: 'Order marked as delivered',
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/extra-tiffins/all
// @desc    Get all extra tiffin orders (Admin only)
// @access  Private/Admin
router.get('/all', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    const { month, year, date } = req.query;

    let query = {};

    // Filter by specific date
    if (date) {
      const targetDate = new Date(date);
      query.date = {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lte: new Date(targetDate.setHours(23, 59, 59, 999)),
      };
    }
    // Filter by month/year
    else if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const orders = await ExtraTiffinOrder.find(query)
      .populate('user', 'name email phone address')
      .populate('menu', 'name mealType price')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
