const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Menu = require('./models/Menu');
const Subscription = require('./models/Subscription');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tiffin-service')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedData = async () => {
  try {
    // Check if data already exists
    const existingUsers = await User.countDocuments();
    const existingMenus = await Menu.countDocuments();
    
    if (existingUsers > 0 && existingMenus > 0) {
      console.log('Database already seeded. Skipping...');
      return;
    }
    
    // Clear existing data only if needed
    await User.deleteMany({});
    await Menu.deleteMany({});
    await Subscription.deleteMany({});
    
    console.log('Cleared existing data...');

    // Create Admin User
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@tiffin.com',
      phone: '+91 98765 43210',
      password: 'admin123',
      role: 'admin',
      address: {
        street: '123 Admin Street',
        area: 'Andheri West',
        city: 'Mumbai',
        pincode: '400058'
      }
    });
    console.log('Admin user created:', admin.email);

    // Create Demo User
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'user@tiffin.com',
      phone: '+91 98765 43211',
      password: 'user123',
      role: 'user',
      address: {
        street: '456 User Avenue',
        area: 'Bandra West',
        city: 'Mumbai',
        pincode: '400050'
      }
    });
    console.log('Demo user created:', demoUser.email);

    // Create additional test users (using create() to trigger password hashing middleware)
    const piyush = await User.create({
      name: 'Piyush Jawale',
      email: 'piyushjawale.applications@gmail.com',
      phone: '+353892024804',
      password: 'password123',
      role: 'user',
      address: {
        street: '39 Aderig Avenue',
        area: 'Adamstown',
        city: 'Dublin',
        pincode: 'K78 F9Y0'
      }
    });
    console.log('Piyush user created:', piyush.email);

    const priya = await User.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+91 98765 43212',
      password: 'user123',
      role: 'user',
      address: {
        street: '789 Hill Road',
        area: 'Juhu',
        city: 'Mumbai',
        pincode: '400049'
      }
    });

    const rahul = await User.create({
      name: 'Rahul Patel',
      email: 'rahul@example.com',
      phone: '+91 98765 43213',
      password: 'user123',
      role: 'user',
      address: {
        street: '101 Marine Drive',
        area: 'Churchgate',
        city: 'Mumbai',
        pincode: '400020'
      }
    });

    const anita = await User.create({
      name: 'Anita Desai',
      email: 'anita@example.com',
      phone: '+91 98765 43214',
      password: 'user123',
      role: 'user',
      address: {
        street: '202 Linking Road',
        area: 'Khar West',
        city: 'Mumbai',
        pincode: '400052'
      }
    });

    const testUsers = [piyush, priya, rahul, anita];
    console.log('Test users created:', testUsers.length);

    // Create 7 Menu Items - One for each day of the week
    const menuItems = await Menu.insertMany([
      {
        name: 'Monday Special Thali',
        description: 'Start your week with Paneer special and wholesome sides',
        mealType: 'veg',
        price: 150,
        items: ['Paneer Butter Masala', 'Aloo Gobi', '3 Rotis', 'Jeera Rice', 'Raita', 'Salad'],
        dayOfWeek: 'Monday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 720,
          protein: '22g',
          carbs: '80g',
          fat: '28g'
        }
      },
      {
        name: 'Tuesday Veg Delight',
        description: 'Featuring Rajma and seasonal vegetables',
        mealType: 'veg',
        price: 130,
        items: ['Rajma Masala', 'Bhindi Fry', '3 Rotis', 'Steamed Rice', 'Pickle', 'Papad'],
        dayOfWeek: 'Tuesday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 680,
          protein: '20g',
          carbs: '88g',
          fat: '20g'
        }
      },
      {
        name: 'Wednesday Veg Feast',
        description: 'Mid-week special with Chole and more',
        mealType: 'veg',
        price: 140,
        items: ['Chole Masala', 'Aloo Matar', '3 Rotis', 'Pulao', 'Raita', 'Salad'],
        dayOfWeek: 'Wednesday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 700,
          protein: '21g',
          carbs: '86g',
          fat: '24g'
        }
      },
      {
        name: 'Thursday Special',
        description: 'Delicious Kadhi with crispy pakoras',
        mealType: 'veg',
        price: 135,
        items: ['Kadhi Pakora', 'Baingan Bharta', '3 Rotis', 'Steamed Rice', 'Pickle', 'Papad'],
        dayOfWeek: 'Thursday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 690,
          protein: '19g',
          carbs: '82g',
          fat: '26g'
        }
      },
      {
        name: 'Friday Treat',
        description: 'Weekend vibes with Dal Makhani',
        mealType: 'veg',
        price: 160,
        items: ['Dal Makhani', 'Palak Paneer', '3 Rotis', 'Jeera Rice', 'Raita', 'Salad'],
        dayOfWeek: 'Friday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 750,
          protein: '24g',
          carbs: '78g',
          fat: '32g'
        }
      },
      {
        name: 'Saturday Special',
        description: 'Special weekend meal with extra treats',
        mealType: 'non-veg',
        price: 220,
        items: ['Chicken Curry', 'Dal Tadka', '3 Rotis', 'Steamed Rice', 'Pickle', 'Papad'],
        dayOfWeek: 'Saturday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 780,
          protein: '35g',
          carbs: '75g',
          fat: '32g'
        }
      },
      {
        name: 'Sunday Grand Feast',
        description: 'Grand Sunday meal with multiple delicacies',
        mealType: 'non-veg',
        price: 280,
        items: ['Chicken Biryani', 'Mirchi Ka Salan', '2 Rotis', 'Raita', 'Gulab Jamun', 'Salad'],
        dayOfWeek: 'Sunday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 950,
          protein: '42g',
          carbs: '90g',
          fat: '42g'
        }
      }
    ]);
    console.log('Menu items created:', menuItems.length);

    // Create subscriptions for test users
    const subscriptions = await Subscription.insertMany([
      {
        user: demoUser._id,
        mealType: 'veg',
        planType: 'monthly',
        pricePerTiffin: 120,
        status: 'active',
        startDate: new Date(),
        deliveryTime: 'lunch',
        specialInstructions: 'No spicy food please'
      },
      {
        user: testUsers[0]._id,
        mealType: 'non-veg',
        planType: 'monthly',
        pricePerTiffin: 180,
        status: 'active',
        startDate: new Date(),
        deliveryTime: 'lunch',
        specialInstructions: ''
      },
      {
        user: testUsers[1]._id,
        mealType: 'jain',
        planType: 'monthly',
        pricePerTiffin: 130,
        status: 'active',
        startDate: new Date(),
        deliveryTime: 'dinner',
        specialInstructions: 'Strict Jain - no root vegetables'
      },
      {
        user: testUsers[2]._id,
        mealType: 'veg',
        planType: 'weekly',
        pricePerTiffin: 130,
        status: 'active',
        startDate: new Date(),
        deliveryTime: 'lunch',
        specialInstructions: 'Extra rotis please'
      }
    ]);
    console.log('Subscriptions created:', subscriptions.length);

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@tiffin.com / admin123');
    console.log('User:  user@tiffin.com / user123');
    console.log('Piyush: piyushjawale.applications@gmail.com / password123');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    // Close mongoose connection so the script can exit
    await mongoose.disconnect();
  }
};

seedData();
