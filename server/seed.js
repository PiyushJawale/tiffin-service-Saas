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
    // Clear existing data
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

    // Create additional test users
    const testUsers = await User.insertMany([
      {
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
      },
      {
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
      },
      {
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
      }
    ]);
    console.log('Test users created:', testUsers.length);

    // Create Menu Items
    const menuItems = await Menu.insertMany([
      // Veg Items
      {
        name: 'Classic Veg Thali',
        description: 'A complete vegetarian meal with dal, sabzi, roti, rice, and pickle',
        mealType: 'veg',
        price: 120,
        items: ['Dal Tadka', 'Mix Veg Sabzi', '3 Rotis', 'Steamed Rice', 'Pickle', 'Papad'],
        dayOfWeek: 'All',
        isAvailable: true,
        nutritionalInfo: {
          calories: 650,
          protein: '18g',
          carbs: '85g',
          fat: '22g'
        }
      },
      {
        name: 'Monday Special Veg',
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
        name: 'Thursday Veg Special',
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
        name: 'Friday Veg Treat',
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
        name: 'Weekend Veg Special',
        description: 'Special weekend meal with extra treats',
        mealType: 'veg',
        price: 180,
        items: ['Paneer Tikka Masala', 'Veg Biryani', '2 Rotis', 'Raita', 'Gulab Jamun', 'Salad'],
        dayOfWeek: 'Saturday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 820,
          protein: '26g',
          carbs: '95g',
          fat: '35g'
        }
      },
      {
        name: 'Sunday Veg Feast',
        description: 'Grand Sunday meal with multiple delicacies',
        mealType: 'veg',
        price: 200,
        items: ['Paneer Lababdar', 'Veg Pulao', '3 Rotis', 'Dal Fry', 'Raita', 'Kheer', 'Salad'],
        dayOfWeek: 'Sunday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 880,
          protein: '28g',
          carbs: '100g',
          fat: '38g'
        }
      },
      // Non-Veg Items
      {
        name: 'Classic Non-Veg Thali',
        description: 'Hearty non-vegetarian meal with chicken curry and sides',
        mealType: 'non-veg',
        price: 180,
        items: ['Chicken Curry', 'Dal Tadka', '3 Rotis', 'Steamed Rice', 'Pickle', 'Papad'],
        dayOfWeek: 'All',
        isAvailable: true,
        nutritionalInfo: {
          calories: 780,
          protein: '35g',
          carbs: '75g',
          fat: '32g'
        }
      },
      {
        name: 'Monday Non-Veg Special',
        description: 'Butter Chicken with fragrant rice',
        mealType: 'non-veg',
        price: 220,
        items: ['Butter Chicken', 'Aloo Gobi', '3 Rotis', 'Jeera Rice', 'Raita', 'Salad'],
        dayOfWeek: 'Monday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 850,
          protein: '38g',
          carbs: '72g',
          fat: '38g'
        }
      },
      {
        name: 'Tuesday Non-Veg Delight',
        description: 'Egg curry special with wholesome sides',
        mealType: 'non-veg',
        price: 160,
        items: ['Egg Curry', 'Bhindi Fry', '3 Rotis', 'Steamed Rice', 'Pickle', 'Papad'],
        dayOfWeek: 'Tuesday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 720,
          protein: '28g',
          carbs: '78g',
          fat: '30g'
        }
      },
      {
        name: 'Wednesday Non-Veg Feast',
        description: 'Chicken Tikka Masala with special rice',
        mealType: 'non-veg',
        price: 230,
        items: ['Chicken Tikka Masala', 'Aloo Matar', '3 Rotis', 'Pulao', 'Raita', 'Salad'],
        dayOfWeek: 'Wednesday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 880,
          protein: '40g',
          carbs: '76g',
          fat: '40g'
        }
      },
      {
        name: 'Thursday Non-Veg Special',
        description: 'Mutton curry with traditional sides',
        mealType: 'non-veg',
        price: 280,
        items: ['Mutton Curry', 'Baingan Bharta', '3 Rotis', 'Steamed Rice', 'Pickle', 'Papad'],
        dayOfWeek: 'Thursday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 920,
          protein: '42g',
          carbs: '74g',
          fat: '45g'
        }
      },
      {
        name: 'Friday Non-Veg Treat',
        description: 'Fish curry special for the weekend',
        mealType: 'non-veg',
        price: 250,
        items: ['Fish Curry', 'Palak Paneer', '3 Rotis', 'Jeera Rice', 'Raita', 'Salad'],
        dayOfWeek: 'Friday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 800,
          protein: '38g',
          carbs: '70g',
          fat: '36g'
        }
      },
      {
        name: 'Weekend Non-Veg Special',
        description: 'Biryani special with chicken and sides',
        mealType: 'non-veg',
        price: 300,
        items: ['Chicken Biryani', 'Mirchi Ka Salan', '2 Rotis', 'Raita', 'Gulab Jamun', 'Salad'],
        dayOfWeek: 'Saturday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 950,
          protein: '42g',
          carbs: '90g',
          fat: '42g'
        }
      },
      {
        name: 'Sunday Non-Veg Feast',
        description: 'Grand Sunday feast with multiple non-veg items',
        mealType: 'non-veg',
        price: 350,
        items: ['Mutton Biryani', 'Chicken Korma', '2 Rotis', 'Raita', 'Kheer', 'Salad'],
        dayOfWeek: 'Sunday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 1050,
          protein: '48g',
          carbs: '95g',
          fat: '48g'
        }
      },
      // Jain Items
      {
        name: 'Classic Jain Thali',
        description: 'Pure Jain meal without onion, garlic, and root vegetables',
        mealType: 'jain',
        price: 130,
        items: ['Dal Fry (No Onion/Garlic)', 'Lauki Sabzi', '3 Rotis', 'Steamed Rice', 'Pickle', 'Papad'],
        dayOfWeek: 'All',
        isAvailable: true,
        nutritionalInfo: {
          calories: 620,
          protein: '16g',
          carbs: '82g',
          fat: '20g'
        }
      },
      {
        name: 'Monday Jain Special',
        description: 'Paneer special prepared Jain style',
        mealType: 'jain',
        price: 160,
        items: ['Paneer Tomato Sabzi', 'Aloo Matar', '3 Rotis', 'Jeera Rice', 'Raita', 'Salad'],
        dayOfWeek: 'Monday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 680,
          protein: '20g',
          carbs: '78g',
          fat: '26g'
        }
      },
      {
        name: 'Tuesday Jain Delight',
        description: 'Traditional Jain meal with variety',
        mealType: 'jain',
        price: 140,
        items: ['Kadhi (No Onion/Garlic)', 'Tinda Masala', '3 Rotis', 'Steamed Rice', 'Pickle', 'Papad'],
        dayOfWeek: 'Tuesday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 640,
          protein: '18g',
          carbs: '80g',
          fat: '22g'
        }
      },
      {
        name: 'Wednesday Jain Feast',
        description: 'Mid-week Jain special',
        mealType: 'jain',
        price: 150,
        items: ['Chole (No Onion/Garlic)', 'Aloo Gobi', '3 Rotis', 'Pulao', 'Raita', 'Salad'],
        dayOfWeek: 'Wednesday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 700,
          protein: '20g',
          carbs: '84g',
          fat: '24g'
        }
      },
      {
        name: 'Thursday Jain Special',
        description: 'Rajma prepared Jain style',
        mealType: 'jain',
        price: 145,
        items: ['Rajma Masala (No Onion/Garlic)', 'Parwal Sabzi', '3 Rotis', 'Steamed Rice', 'Pickle', 'Papad'],
        dayOfWeek: 'Thursday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 660,
          protein: '19g',
          carbs: '82g',
          fat: '21g'
        }
      },
      {
        name: 'Friday Jain Treat',
        description: 'Weekend Jain special',
        mealType: 'jain',
        price: 170,
        items: ['Paneer Makhanwala (No Onion/Garlic)', 'Kaddu Sabzi', '3 Rotis', 'Jeera Rice', 'Raita', 'Salad'],
        dayOfWeek: 'Friday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 740,
          protein: '22g',
          carbs: '76g',
          fat: '30g'
        }
      },
      {
        name: 'Weekend Jain Special',
        description: 'Special weekend Jain meal',
        mealType: 'jain',
        price: 190,
        items: ['Paneer Tikka (Jain Style)', 'Veg Biryani (No Onion/Garlic)', '2 Rotis', 'Raita', 'Moong Dal Halwa', 'Salad'],
        dayOfWeek: 'Saturday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 800,
          protein: '24g',
          carbs: '92g',
          fat: '34g'
        }
      },
      {
        name: 'Sunday Jain Feast',
        description: 'Grand Sunday Jain meal',
        mealType: 'jain',
        price: 210,
        items: ['Paneer Lababdar (Jain Style)', 'Veg Pulao', '3 Rotis', 'Dal Fry', 'Raita', 'Rabdi', 'Salad'],
        dayOfWeek: 'Sunday',
        isAvailable: true,
        nutritionalInfo: {
          calories: 860,
          protein: '26g',
          carbs: '98g',
          fat: '36g'
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
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();