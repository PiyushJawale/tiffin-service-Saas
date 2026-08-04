const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const { protect } = require('../middleware/auth');

// Pricing configuration
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

// @route   GET /api/subscriptions/pricing
// @desc    Get subscription pricing
// @access  Public
router.get('/pricing', (req, res) => {
  res.json({
    success: true,
    data: PRICING,
  });
});

// @route   GET /api/subscriptions
// @desc    Get all subscriptions for logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id })
      .populate('user', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/subscriptions
// @desc    Create new subscription
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { mealType, deliveryTime, specialInstructions } = req.body;

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      user: req.user._id,
      status: { $in: ['active', 'paused'] },
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message:
          'You already have an active subscription. Please cancel it first to subscribe to a new plan.',
      });
    }

    // Get pricing based on meal type
    const pricing = PRICING[mealType];
    if (!pricing) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal type. Choose from: veg, non-veg, jain',
      });
    }

    const subscription = await Subscription.create({
      user: req.user._id,
      mealType,
      pricePerTiffin: pricing.pricePerTiffin,
      monthlyPrice: pricing.monthlyPrice,
      deliveryTime: deliveryTime || 'lunch',
      specialInstructions,
      startDate: new Date(),
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: `Successfully subscribed to ${mealType} plan at ₹${pricing.monthlyPrice}/month`,
      data: subscription,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/subscriptions/:id
// @desc    Update subscription
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    // Check if user owns subscription
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this subscription',
      });
    }

    // If mealType is being changed, update pricing
    if (req.body.mealType && req.body.mealType !== subscription.mealType) {
      const pricing = PRICING[req.body.mealType];
      if (pricing) {
        req.body.pricePerTiffin = pricing.pricePerTiffin;
        req.body.monthlyPrice = pricing.monthlyPrice;
      }
    }

    subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/subscriptions/:id/pause
// @desc    Pause subscription
// @access  Private
router.put('/:id/pause', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    // Check if user owns subscription
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    subscription.status = 'paused';
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription paused successfully',
      data: subscription,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/subscriptions/:id/resume
// @desc    Resume paused subscription
// @access  Private
router.put('/:id/resume', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    // Check if user owns subscription
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    subscription.status = 'active';
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription resumed successfully',
      data: subscription,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/subscriptions/:id
// @desc    Cancel subscription
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    // Check if user owns subscription
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this subscription',
      });
    }

    subscription.status = 'cancelled';
    subscription.endDate = new Date();
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
