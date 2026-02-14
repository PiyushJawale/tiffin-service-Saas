const express = require('express');
const router = express.Router();
const DailyDelivery = require('../models/DailyDelivery');
const Subscription = require('../models/Subscription');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/deliveries/my-deliveries
// @desc    Get deliveries for logged in user
// @access  Private
router.get('/my-deliveries', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = { user: req.user._id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const deliveries = await DailyDelivery.find(query)
      .populate('subscription', 'mealType pricePerTiffin')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: deliveries.length,
      data: deliveries
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/deliveries/date/:date
// @desc    Get all deliveries for a specific date (Admin only)
// @access  Private/Admin
router.get('/date/:date', protect, adminOnly, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const deliveries = await DailyDelivery.find({
      date: { $gte: date, $lt: nextDate }
    })
      .populate('user', 'name email phone address')
      .populate('subscription', 'mealType pricePerTiffin planType')
      .sort({ 'user.name': 1 });

    res.json({
      success: true,
      count: deliveries.length,
      data: deliveries
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/deliveries/:id
// @desc    Mark delivery as delivered/not delivered (Admin only)
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { delivered, notes } = req.body;

    const delivery = await DailyDelivery.findByIdAndUpdate(
      req.params.id,
      {
        delivered,
        deliveredAt: delivered ? new Date() : null,
        notes,
        markedBy: req.user._id
      },
      { new: true }
    ).populate('user', 'name email phone');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery record not found'
      });
    }

    res.json({
      success: true,
      data: delivery
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/deliveries/create-daily
// @desc    Create delivery records for all active subscriptions (Admin only)
// @access  Private/Admin
router.post('/create-daily', protect, adminOnly, async (req, res) => {
  try {
    const { date } = req.body;
    const deliveryDate = new Date(date);
    const dayName = deliveryDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Get all active subscriptions
    const subscriptions = await Subscription.find({ 
      status: 'active',
      days: dayName 
    });

    const deliveryRecords = [];

    for (const sub of subscriptions) {
      // Check if delivery already exists for this user and date
      const existingDelivery = await DailyDelivery.findOne({
        user: sub.user,
        date: {
          $gte: new Date(deliveryDate.setHours(0, 0, 0, 0)),
          $lt: new Date(deliveryDate.setHours(23, 59, 59, 999))
        }
      });

      if (!existingDelivery) {
        deliveryRecords.push({
          user: sub.user,
          subscription: sub._id,
          date: deliveryDate,
          delivered: false
        });
      }
    }

    if (deliveryRecords.length > 0) {
      await DailyDelivery.insertMany(deliveryRecords);
    }

    res.json({
      success: true,
      message: `Created ${deliveryRecords.length} delivery records`,
      count: deliveryRecords.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;