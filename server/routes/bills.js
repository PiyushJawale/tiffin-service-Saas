const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const DailyDelivery = require('../models/DailyDelivery');
const Subscription = require('../models/Subscription');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/bills/my-bills
// @desc    Get bills for logged in user
// @access  Private
router.get('/my-bills', protect, async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.user._id })
      .sort({ year: -1, month: -1 });

    res.json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/bills/:id
// @desc    Get single bill
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('user', 'name email phone address');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Check if user owns bill or is admin
    if (bill.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/bills/generate
// @desc    Generate monthly bill for a user (Admin only)
// @access  Private/Admin
router.post('/generate', protect, adminOnly, async (req, res) => {
  try {
    const { userId, month, year } = req.body;

    // Check if bill already exists
    const existingBill = await Bill.findOne({ user: userId, month, year });
    if (existingBill) {
      return res.status(400).json({
        success: false,
        message: 'Bill already exists for this month'
      });
    }

    // Get subscription for price
    const subscription = await Subscription.findOne({ 
      user: userId, 
      status: 'active' 
    });

    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found for this user'
      });
    }

    // Count delivered tiffins for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const deliveries = await DailyDelivery.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
      delivered: true
    });

    const totalTiffins = deliveries.length;
    const pricePerTiffin = subscription.pricePerTiffin;
    const totalAmount = totalTiffins * pricePerTiffin;

    // Create bill
    const bill = await Bill.create({
      user: userId,
      month,
      year,
      totalTiffins,
      pricePerTiffin,
      totalAmount,
      status: 'pending',
      dueDate: new Date(year, month, 10) // Due on 10th of next month
    });

    res.status(201).json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/bills/generate-all
// @desc    Generate bills for all users for a month (Admin only)
// @access  Private/Admin
router.post('/generate-all', protect, adminOnly, async (req, res) => {
  try {
    const { month, year } = req.body;

    // Get all active subscriptions
    const subscriptions = await Subscription.find({ status: 'active' })
      .populate('user', 'name email');

    const results = [];

    for (const sub of subscriptions) {
      // Check if bill already exists
      const existingBill = await Bill.findOne({ 
        user: sub.user._id, 
        month, 
        year 
      });

      if (existingBill) {
        results.push({
          user: sub.user.name,
          status: 'skipped',
          reason: 'Bill already exists'
        });
        continue;
      }

      // Count delivered tiffins
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const deliveries = await DailyDelivery.find({
        user: sub.user._id,
        date: { $gte: startDate, $lte: endDate },
        delivered: true
      });

      const totalTiffins = deliveries.length;
      const totalAmount = totalTiffins * sub.pricePerTiffin;

      // Create bill
      await Bill.create({
        user: sub.user._id,
        month,
        year,
        totalTiffins,
        pricePerTiffin: sub.pricePerTiffin,
        totalAmount,
        status: 'pending',
        dueDate: new Date(year, month, 10)
      });

      results.push({
        user: sub.user.name,
        status: 'created',
        totalTiffins,
        totalAmount
      });
    }

    res.json({
      success: true,
      message: `Generated ${results.filter(r => r.status === 'created').length} bills`,
      results
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/bills/:id/pay
// @desc    Mark bill as paid (Admin only)
// @access  Private/Admin
router.put('/:id/pay', protect, adminOnly, async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'paid',
        paidAt: new Date()
      },
      { new: true }
    ).populate('user', 'name email phone');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;