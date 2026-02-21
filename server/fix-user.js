const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tiffin-service')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const fixUser = async () => {
  try {
    const email = 'piyushjawale.applications@gmail.com';
    const plainPassword = 'Venompj@123';

    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    console.log('Found user:', user.email);

    // Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    
    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password updated successfully!');
    console.log('You can now login with:');
    console.log('Email:', email);
    console.log('Password:', plainPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

fixUser();