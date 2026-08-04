const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    mealType: {
      type: String,
      enum: ['veg', 'non-veg', 'jain'],
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    items: [
      {
        type: String,
        trim: true,
      },
    ],
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All'],
      default: 'All',
    },
    image: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    nutritionalInfo: {
      calories: { type: Number, min: 0 },
      protein: { type: String },
      carbs: { type: String },
      fat: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
menuSchema.index({ isAvailable: 1, dayOfWeek: 1, mealType: 1 });

module.exports = mongoose.model('Menu', menuSchema);
