const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mealType: {
    type: String,
    enum: ['veg', 'non-veg', 'jain'],
    required: true
  },
  pricePerTiffin: {
    type: Number,
    required: true,
    min: 0
  },
  monthlyPrice: {
    type: Number,
    required: true,
    min: 0
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    default: 'active'
  },
  deliveryTime: {
    type: String,
    enum: ['lunch', 'dinner'],
    default: 'lunch'
  },
  specialInstructions: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
subscriptionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);