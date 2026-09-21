const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      // Storage guard only - the API validator (utils/validationRules.js) is the
      // real gate; kept free of the old `\w+` limits so "user+tag@gmail.com"
      // and long TLDs are storable.
      match: [
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      // Shape guard only: must contain a number; "+"/"----"/blank are rejected.
      match: [/^\+?\d[\d\s-]{5,19}$/, 'Please provide a valid phone number'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

contactMessageSchema.index({ createdAt: -1, _id: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
