const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  mealType: {
    type: String,
    enum: ['veg', 'non-veg', 'jain'],
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  items: [{
    type: String,
    trim: true
  }],
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All'],
    default: 'All'
  },
  image: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  nutritionalInfo: {
    calories: Number,
    protein: String,
    carbs: String,
    fat: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Menu', menuSchema)