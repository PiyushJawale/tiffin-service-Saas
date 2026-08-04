const mongoose = require('mongoose');

const extraTiffinOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
    },
    mealType: {
      type: String,
      enum: ['veg', 'non-veg', 'jain'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    addedToBill: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
extraTiffinOrderSchema.index({ user: 1, date: 1 });
extraTiffinOrderSchema.index({ user: 1, addedToBill: 1 });

module.exports = mongoose.model('ExtraTiffinOrder', extraTiffinOrderSchema);
