const mongoose = require('mongoose');
const User = require('./models/User');
const Menu = require('./models/Menu');
const Subscription = require('./models/Subscription');

mongoose.connect('mongodb://localhost:27017/tiffin-service')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

const verify = async () => {
  try {
    const users = await User.find({});
    console.log('\n=== USERS ===');
    console.log('Total users:', users.length);
    users.forEach(u => console.log(` - ${u.email} (${u.role})`));

    const menus = await Menu.find({});
    console.log('\n=== MENU ITEMS ===');
    console.log('Total menu items:', menus.length);
    menus.forEach(m => console.log(` - ${m.name} (${m.mealType}) - ₹${m.price}`));

    const subs = await Subscription.find({});
    console.log('\n=== SUBSCRIPTIONS ===');
    console.log('Total subscriptions:', subs.length);
    subs.forEach(s => console.log(` - User: ${s.user}, Type: ${s.mealType}, Status: ${s.status}`));

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
};

verify();