noconst mongoose = require('mongoose');

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
    
    return Subscription.find({ status: { $in: ['active', 'paused'] } }).populate('user', 'name email');
  })
  .then(subs => {
    console.log('\n=== Active Subscriptions ===\n');
    if (subs.length === 0) {
      console.log('No active subscriptions found!');
    } else {
      subs.forEach((s, i) => {
        console.log(`${i + 1}. User: ${s.user?.name || 'N/A'}`);
        console.log(`   Email: ${s.user?.email || 'N/A'}`);
        console.log(`   Meal Type: ${s.mealType}`);
        console.log(`   Price Per Tiffin: ${s.pricePerTiffin}`);
        console.log(`   Monthly Price: ${s.monthlyPrice || 'NOT SET'}`);
        console.log(`   Status: ${s.status}`);
        console.log('');
      });
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });