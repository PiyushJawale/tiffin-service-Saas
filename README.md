"# Mumbai Tiffin Service 🍱

A full-stack tiffin service application for Mumbai, India. Users can subscribe to daily homemade meals, and admins can track deliveries and generate monthly bills.

## Features ✨

### For Users
- 📋 View daily menu with meal options (Veg, Non-Veg, Jain)
- 📅 Subscribe to daily, weekly, or monthly plans
- 📊 Track delivery history
- 💰 View monthly bills based on actual deliveries

### For Admins
- 👥 Manage all users and subscriptions
- 📦 Track daily tiffin deliveries (mark delivered/not delivered)
- 💰 Generate monthly bills automatically
- 📊 Dashboard with key statistics

## Tech Stack 🛠️

| Layer | Technology |
|-------|------------|
| Frontend | React.js |
| Backend | Node.js + Express.js |
| Database | MongoDB |
| Authentication | JWT |

## Color Palette 🎨

- **Primary Orange**: #FF6B35 (Buttons, highlights)
- **Teal**: #00796B (Secondary accent)
- **Warm Yellow**: #F7C548 (Accents)
- **Fresh Green**: #2E7D32 (Veg indicator, success)
- **Red**: #C62828 (Non-Veg indicator)

## Project Structure 📁

```
tiffin-service/
├── server/                 # Backend
│   ├── models/             # MongoDB models
│   │   ├── User.js
│   │   ├── Menu.js
│   │   ├── Subscription.js
│   │   ├── DailyDelivery.js
│   │   └── Bill.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── menu.js
│   │   ├── subscriptions.js
│   │   ├── deliveries.js
│   │   ├── bills.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── client/                 # Frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
│
└── README.md
```

## Setup Instructions 🚀

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### 1. Clone and Setup Backend

```bash
# Navigate to server folder
cd tiffin-service/server

# Install dependencies
npm install

# Create .env file
# Edit .env with your MongoDB connection string
# MONGODB_URI=mongodb://localhost:27017/tiffin-service
# JWT_SECRET=your-secret-key
# PORT=5000

# Start the server
npm run dev
```

### 2. Setup Frontend

```bash
# Navigate to client folder
cd tiffin-service/client

# Install dependencies
npm install

# Start React development server
npm start
```

### 3. Seed Database (Optional)

You can create sample menu items and admin user by running:

```bash
cd server
node seed.js
```

## API Endpoints 🔌

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

### Menu
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/menu | Get all menu items |
| GET | /api/menu/:id | Get single menu item |
| POST | /api/menu | Add menu item (admin) |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/subscriptions | Get user subscriptions |
| POST | /api/subscriptions | Create subscription |
| PUT | /api/subscriptions/:id | Update subscription |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/users | Get all users |
| GET | /api/admin/dashboard | Get dashboard stats |
| GET | /api/admin/monthly-report | Get monthly report |

## How Billing Works 💡

```
User: Rahul Sharma
Subscription: Daily Veg Tiffin @ ₹120/tiffin

January 2025:
- Total days in month: 31
- Tiffins delivered: 28 (user didn't take 3 days)
- Final Bill: 28 × ₹120 = ₹3,360
```

Users only pay for the tiffins actually delivered!

## Demo Credentials 👤

- **Admin**: admin@tiffin.com / admin123
- **User**: user@tiffin.com / user123

## Future Enhancements 🔮

- [ ] Razorpay payment integration
- [ ] WhatsApp notifications
- [ ] Mobile app (React Native)
- [ ] Real-time delivery tracking
- [ ] Loyalty program

---

Made with ❤️ for Mumbai"
