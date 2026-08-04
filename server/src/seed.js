/* eslint-disable no-console, no-process-exit */
/**
 * Database Seeder
 * Creates demo users and sample menu data for local development.
 *
 * Usage:  npm run seed --prefix server
 *
 * Credentials created:
 *   Admin: admin@tiffin.com / admin123
 *   User:  user@tiffin.com / user123
 *
 * Safe to re-run: it clears the users and menus collections first.
 */
const databaseManager = require('./database/connection');
const { validateEnv } = require('./config/env');
const User = require('./models/User');
const Menu = require('./models/Menu');

const users = [
  {
    name: 'Admin User',
    email: 'admin@tiffin.com',
    phone: '+91 90000 00001',
    password: 'admin123',
    role: 'admin',
    isActive: true,
    address: {
      street: '1 Admin Street',
      area: 'Andheri',
      city: 'Mumbai',
      pincode: '400001',
    },
  },
  {
    name: 'Demo User',
    email: 'user@tiffin.com',
    phone: '+91 90000 00002',
    password: 'user123',
    role: 'user',
    isActive: true,
    address: {
      street: '2 User Street',
      area: 'Bandra',
      city: 'Mumbai',
      pincode: '400050',
    },
  },
];

const menuItems = [
  {
    name: 'Veg Thali',
    description: 'Fresh seasonal vegetables, dal, rice, roti, salad and a sweet',
    mealType: 'veg',
    price: 120,
    items: ['Dal', 'Seasonal Veg', 'Rice', 'Roti', 'Salad', 'Sweet'],
    dayOfWeek: 'All',
    isAvailable: true,
    nutritionalInfo: { calories: 650, protein: '18g', carbs: '90g', fat: '20g' },
  },
  {
    name: 'Non-Veg Thali',
    description: 'Chicken/Fish curry, dal, rice, roti, salad and a sweet',
    mealType: 'non-veg',
    price: 150,
    items: ['Chicken Curry', 'Dal', 'Rice', 'Roti', 'Salad', 'Sweet'],
    dayOfWeek: 'All',
    isAvailable: true,
    nutritionalInfo: { calories: 780, protein: '35g', carbs: '85g', fat: '28g' },
  },
  {
    name: 'Jain Thali',
    description: 'Pure Jain meals without onion, garlic and root vegetables',
    mealType: 'jain',
    price: 130,
    items: ['Jain Sabzi', 'Dal', 'Rice', 'Roti', 'Salad', 'Sweet'],
    dayOfWeek: 'All',
    isAvailable: true,
    nutritionalInfo: { calories: 620, protein: '16g', carbs: '88g', fat: '18g' },
  },
];

async function seed() {
  // validateEnv only throws in production; seeding is a dev tool so this is a no-op locally.
  validateEnv();

  console.log('Connecting to MongoDB...');
  await databaseManager.connect();

  console.log('Clearing existing users and menu items...');
  await User.deleteMany({});
  await Menu.deleteMany({});

  console.log('Creating demo users...');
  // User.pre('save') hashes the password automatically.
  const createdUsers = await User.create(users);
  createdUsers.forEach((u) =>
    console.log(`  - ${u.role}: ${u.email} / ${users.find((d) => d.email === u.email).password}`)
  );

  console.log('Creating sample menu items...');
  const createdMenu = await Menu.create(menuItems);
  createdMenu.forEach((m) => console.log(`  - [${m.mealType}] ${m.name} (₹${m.price})`));

  console.log('\nSeed completed successfully!');
  await databaseManager.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  databaseManager.disconnect().finally(() => process.exit(1));
});
