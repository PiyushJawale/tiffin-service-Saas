const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const DailyDelivery = require('../models/DailyDelivery');
const Bill = require('../models/Bill');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/admin/users
// @desc    Get all users with subscriptions
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Get subscription info for each user
    const usersWithSubscriptions = await Promise.all(
      users.map(async (user) => {
        const subscription = await Subscription.findOne({ 
          user: user._id, 
          status: 'active' 
        });
        return {
          ...user.toObject(),
          subscription
        };
      })
    );

    res.json({
      success: true,
      count: usersWithSubscriptions.length,
      data: usersWithSubscriptions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/user/:id
// @desc    Get single user with details
// @access  Private/Admin
router.get('/user/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const subscription = await Subscription.find({ user: user._id })
      .sort({ createdAt: -1 });

    const bills = await Bill.find({ user: user._id })
      .sort({ year: -1, month: -1 });

    res.json({
      success: true,
      data: {
        user,
        subscriptions: subscription,
        bills
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get dashboard stats
// @access  Private/Admin
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    
    // Get today's deliveries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDeliveries = await DailyDelivery.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('user', 'name phone');

    const deliveredCount = todayDeliveries.filter(d => d.delivered).length;
    const pendingCount = todayDeliveries.length - deliveredCount;

    // Get pending bills
    const pendingBills = await Bill.find({ status: 'pending' })
      .populate('user', 'name email phone');
    const totalPendingAmount = pendingBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeSubscriptions,
        todayTotal: todayDeliveries.length,
        todayDelivered: deliveredCount,
        todayPending: pendingCount,
        pendingBillsCount: pendingBills.length,
        totalPendingAmount
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/monthly-report
// @desc    Get monthly delivery report
// @access  Private/Admin
router.get('/monthly-report', protect, adminOnly, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const deliveries = await DailyDelivery.find({
      date: { $gte: startDate, $lte: endDate }
    })
      .populate('user', 'name email phone address')
      .populate('subscription', 'mealType pricePerTiffin')
      .sort({ date: 1 });

    // Group by user
    const userReport = {};
    deliveries.forEach(delivery => {
      const userId = delivery.user._id.toString();
      if (!userReport[userId]) {
        userReport[userId] = {
          user: delivery.user,
          subscription: delivery.subscription,
          totalDays: 0,
          deliveredDays: 0
        };
      }
      userReport[userId].totalDays++;
      if (delivery.delivered) {
        userReport[userId].deliveredDays++;
      }
    });

    const report = Object.values(userReport).map(item => ({
      ...item,
      billAmount: item.deliveredDays * (item.subscription?.pricePerTiffin || 0)
    }));

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;