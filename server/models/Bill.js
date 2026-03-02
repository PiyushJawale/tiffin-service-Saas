const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  // Subscription details
  subscriptionAmount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  subscriptionDays: {
    type: Number,
    default: 0
  },
  // Extra tiffins
  extraTiffinsCount: {
    type: Number,
    default: 0
  },
  extraTiffinsAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Legacy fields for backward compatibility
  totalTiffins: {
    type: Number,
    default: 0
  },
  pricePerTiffin: {
    type: Number,
    default: 0
  },
  // Total amount
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  paidAt: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for unique bill per user per month/year
billSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Bill', billSchema);