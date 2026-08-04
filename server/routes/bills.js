const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Subscription = require('../models/Subscription');
const ExtraTiffinOrder = require('../models/ExtraTiffinOrder');
const { protect, adminOnly } = require('../middleware/auth');

// Helper function to get month name
function getMonthName(month) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[month - 1];
}

// Pricing configuration (for backward compatibility)
const PRICING = {
  veg: {
    monthlyPrice: 2200,
    pricePerTiffin: 120,
  },
  'non-veg': {
    monthlyPrice: 2800,
    pricePerTiffin: 150,
  },
  jain: {
    monthlyPrice: 2400,
    pricePerTiffin: 130,
  },
};

// Helper to get subscription price
function getSubscriptionPrice(subscription) {
  if (subscription.monthlyPrice) {
    return {
      monthlyPrice: subscription.monthlyPrice,
      pricePerTiffin: subscription.pricePerTiffin,
    };
  }
  // Fallback to pricing config for backward compatibility
  const pricing = PRICING[subscription.mealType];
  return pricing || { monthlyPrice: 2200, pricePerTiffin: 120 };
}

// @route   GET /api/bills/all
// @desc    Get all bills (Admin only)
// @access  Private/Admin
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate('user', 'name email phone address')
      .sort({ year: -1, month: -1 });

    res.json({
      success: true,
      count: bills.length,
      data: bills,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/bills/my-bills
// @desc    Get bills for logged in user
// @access  Private
router.get('/my-bills', protect, async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.user._id }).sort({ year: -1, month: -1 });

    res.json({
      success: true,
      count: bills.length,
      data: bills,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/bills/current-summary
// @desc    Get current month billing summary for logged in user
// @access  Private
router.get('/current-summary', protect, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get user's subscription (active or paused - both should show in billing)
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: { $in: ['active', 'paused'] },
    });

    // Get extra tiffin orders for current month
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    const extraOrders = await ExtraTiffinOrder.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate },
      addedToBill: false,
    });

    const extraTiffinsCount = extraOrders.length;
    const extraTiffinsAmount = extraOrders.reduce((sum, order) => sum + order.price, 0);

    // Calculate subscription amount (pro-rated if mid-month start)
    let subscriptionAmount = 0;
    let subscriptionDays = 0;

    if (subscription) {
      const prices = getSubscriptionPrice(subscription);
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const currentDay = now.getDate();

      // Check if subscription started this month
      const subStartDate = new Date(subscription.startDate);
      if (
        subStartDate.getMonth() + 1 === currentMonth &&
        subStartDate.getFullYear() === currentYear
      ) {
        // Pro-rate from start date
        const startDay = subStartDate.getDate();
        subscriptionDays = currentDay - startDay + 1;
        subscriptionAmount = Math.round((prices.monthlyPrice / daysInMonth) * subscriptionDays);
      } else {
        // Full month
        subscriptionDays = currentDay;
        subscriptionAmount = prices.monthlyPrice;
      }
    }

    const totalAmount = subscriptionAmount + extraTiffinsAmount;

    // Get prices for response (with backward compatibility)
    const subscriptionPrices = subscription ? getSubscriptionPrice(subscription) : null;

    res.json({
      success: true,
      data: {
        month: currentMonth,
        year: currentYear,
        monthName: getMonthName(currentMonth),
        subscription: subscription
          ? {
              mealType: subscription.mealType,
              monthlyPrice: subscriptionPrices.monthlyPrice,
              pricePerTiffin: subscriptionPrices.pricePerTiffin,
              status: subscription.status,
            }
          : null,
        subscriptionAmount,
        subscriptionDays,
        extraTiffinsCount,
        extraTiffinsAmount,
        totalAmount,
        extraOrders,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/bills/:id
// @desc    Get single bill
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('user', 'name email phone address');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    // Check if user owns bill or is admin
    if (bill.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    res.json({
      success: true,
      data: bill,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
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
        message: 'Bill already exists for this month',
      });
    }

    // Get subscription for price
    const subscription = await Subscription.findOne({
      user: userId,
      status: 'active',
    });

    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found for this user',
      });
    }

    // Calculate subscription amount
    const daysInMonth = new Date(year, month, 0).getDate();
    let subscriptionAmount = subscription.monthlyPrice;
    let subscriptionDays = daysInMonth;

    // Check if subscription started mid-month
    const subStartDate = new Date(subscription.startDate);
    if (subStartDate.getMonth() + 1 === month && subStartDate.getFullYear() === year) {
      const startDay = subStartDate.getDate();
      subscriptionDays = daysInMonth - startDay + 1;
      subscriptionAmount = Math.round((subscription.monthlyPrice / daysInMonth) * subscriptionDays);
    }

    // Get extra tiffin orders for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const extraOrders = await ExtraTiffinOrder.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
      addedToBill: false,
    });

    const extraTiffinsCount = extraOrders.length;
    const extraTiffinsAmount = extraOrders.reduce((sum, order) => sum + order.price, 0);

    // Mark extra orders as added to bill
    await ExtraTiffinOrder.updateMany(
      { user: userId, date: { $gte: startDate, $lte: endDate }, addedToBill: false },
      { addedToBill: true }
    );

    const totalAmount = subscriptionAmount + extraTiffinsAmount;

    // Create bill
    const bill = await Bill.create({
      user: userId,
      month,
      year,
      subscriptionAmount,
      subscriptionDays,
      extraTiffinsCount,
      extraTiffinsAmount,
      totalAmount,
      status: 'pending',
      dueDate: new Date(year, month, 10), // Due on 10th of next month
    });

    res.status(201).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/bills/generate-all
// @desc    Generate bills for all users for a month (Admin only)
// @access  Private/Admin
router.post('/generate-all', protect, adminOnly, async (req, res) => {
  try {
    // Use current month/year if not provided
    const now = new Date();
    const month = req.body.month || now.getMonth() + 1;
    const year = req.body.year || now.getFullYear();

    // Get all active subscriptions
    const subscriptions = await Subscription.find({ status: 'active' }).populate(
      'user',
      'name email'
    );

    if (subscriptions.length === 0) {
      return res.json({
        success: false,
        message: 'No active subscriptions found. Users need to subscribe first.',
      });
    }

    const results = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (const sub of subscriptions) {
      try {
        // Check if bill already exists
        const existingBill = await Bill.findOne({
          user: sub.user._id,
          month,
          year,
        });

        // Calculate subscription amount
        let subscriptionAmount = sub.monthlyPrice;
        let subscriptionDays = daysInMonth;

        // Check if subscription started mid-month
        const subStartDate = new Date(sub.startDate);
        if (subStartDate.getMonth() + 1 === month && subStartDate.getFullYear() === year) {
          const startDay = subStartDate.getDate();
          subscriptionDays = daysInMonth - startDay + 1;
          subscriptionAmount = Math.round((sub.monthlyPrice / daysInMonth) * subscriptionDays);
        }

        // Get extra tiffin orders for the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const extraOrders = await ExtraTiffinOrder.find({
          user: sub.user._id,
          date: { $gte: startDate, $lte: endDate },
          addedToBill: false,
        });

        const extraTiffinsCount = extraOrders.length;
        const extraTiffinsAmount = extraOrders.reduce((sum, order) => sum + order.price, 0);

        // Mark extra orders as added to bill
        await ExtraTiffinOrder.updateMany(
          { user: sub.user._id, date: { $gte: startDate, $lte: endDate }, addedToBill: false },
          { addedToBill: true }
        );

        const totalAmount = subscriptionAmount + extraTiffinsAmount;

        if (existingBill) {
          // Update existing bill
          existingBill.subscriptionAmount = subscriptionAmount;
          existingBill.subscriptionDays = subscriptionDays;
          existingBill.extraTiffinsCount = extraTiffinsCount;
          existingBill.extraTiffinsAmount = extraTiffinsAmount;
          existingBill.totalAmount = totalAmount;
          await existingBill.save();

          results.push({
            user: sub.user.name,
            status: 'updated',
            subscriptionAmount,
            extraTiffinsCount,
            extraTiffinsAmount,
            totalAmount,
          });
        } else {
          // Create new bill
          await Bill.create({
            user: sub.user._id,
            month,
            year,
            subscriptionAmount,
            subscriptionDays,
            extraTiffinsCount,
            extraTiffinsAmount,
            totalAmount,
            status: 'pending',
            dueDate: new Date(year, month, 10),
          });

          results.push({
            user: sub.user.name,
            status: 'created',
            subscriptionAmount,
            extraTiffinsCount,
            extraTiffinsAmount,
            totalAmount,
          });
        }
      } catch (err) {
        results.push({
          user: sub.user.name,
          status: 'error',
          message: err.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Generated/Updated ${results.filter((r) => r.status === 'created' || r.status === 'updated').length} bills for ${getMonthName(month)} ${year}`,
      results,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
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
        paidAt: new Date(),
      },
      { new: true }
    ).populate('user', 'name email phone');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    res.json({
      success: true,
      data: bill,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/bills/:id/toggle-status
// @desc    Toggle bill payment status (Admin only)
// @access  Private/Admin
router.put('/:id/toggle-status', protect, adminOnly, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    // Toggle status
    if (bill.status === 'paid') {
      bill.status = 'pending';
      bill.paidAt = null;
    } else {
      bill.status = 'paid';
      bill.paidAt = new Date();
    }

    await bill.save();

    const updatedBill = await Bill.findById(req.params.id).populate(
      'user',
      'name email phone address'
    );

    res.json({
      success: true,
      data: updatedBill,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
