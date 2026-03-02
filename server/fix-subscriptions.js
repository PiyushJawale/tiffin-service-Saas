const mongoose = require('mongoose');

// Pricing configuration
const PRICING = {
  veg: {
    monthlyPrice: 2200,
    pricePerTiffin: 120
  },
  'non-veg': {
    monthlyPrice: 2800,
    pricePerTiffin: 150
  },
  jain: {
    monthlyPrice: 2400,
    pricePerTiffin: 130
  }
};

mongoose.connect('mongodb://localhost:27017/tiffin-service')
  .then(() => {
    console.log('Connected to MongoDB');
    
    const subSchema = new mongoose.Schema({
      user: Object,
      mealType: String,
      pricePerTiffin: Number,
      monthlyPrice: Number,
      status: String
    });
    
    const Subscription = mongoose.model('Subscription', subSchema);
    
    return Subscription.find({}).then(subs => ({ Subscription, subs }));
  })
  .then(({ Subscription, subs }) => {
    console.log(`\nFound ${subs.length} subscriptions to fix...\n`);
    
    const updates = subs.map(sub => {
      const pricing = PRICING[sub.mealType];
      if (pricing) {
        console.log(`Fixing: ${sub.mealType} - Setting monthlyPrice: ${pricing.monthlyPrice}, pricePerTiffin: ${pricing.pricePerTiffin}`);
        return Subscription.updateOne(
          { _id: sub._id },
          { 
            $set: { 
              monthlyPrice: pricing.monthlyPrice,
              pricePerTiffin: pricing.pricePerTiffin
            }
          }
        );
      }
      return Promise.resolve();
    });
    
    return Promise.all(updates);
  })
  .then(() => {
    console.log('\n✅ All subscriptions fixed!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });