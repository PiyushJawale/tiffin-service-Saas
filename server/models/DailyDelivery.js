const mongoose = require('mongoose');

const dailyDeliverySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  delivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index to ensure one delivery record per user per date
dailyDeliverySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyDelivery', dailyDeliverySchema)