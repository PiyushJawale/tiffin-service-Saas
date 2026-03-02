const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/tiffin-service')
  .then(() => {
    console.log('Connected to MongoDB');
    
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      phone: String,
      role: String
    });
    
    const User = mongoose.model('User', userSchema);
    
    return User.find({});
  })
  .then(users => {
    console.log('\n=== Users in Database ===\n');
    if (users.length === 0) {
      console.log('No users found in database!');
    } else {
      users.forEach((u, i) => {
        console.log(`${i + 1}. Email: ${u.email}`);
        console.log(`   Name: ${u.name}`);
        console.log(`   Role: ${u.role}`);
        console.log('');
      });
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });