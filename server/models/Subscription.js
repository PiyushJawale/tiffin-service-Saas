const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
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
  days: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
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

module.exports = mongoose.model('Subscription', subscriptionSchema);