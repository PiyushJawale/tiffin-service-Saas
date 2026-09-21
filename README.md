# Mumbai Tiffin Service - Enterprise SaaS Platform

A production-ready MERN stack SaaS application for managing tiffin service subscriptions, deliveries, and billing.

## 🏗️ Architecture Overview

This application follows enterprise-grade architecture patterns suitable for scaling to thousands of customers, multiple vendors, and future mobile app support.

### Backend Architecture (Layered)

```
server/
├── src/
│   ├── config/           # Environment and app configuration
│   ├── database/         # MongoDB connection management
│   ├── modules/          # Feature-based modules
│   │   ├── auth/         # Authentication module
│   │   ├── menu/         # Menu management
│   │   ├── subscriptions/# Subscription handling
│   │   ├── deliveries/   # Delivery tracking
│   │   ├── billing/      # Bill generation
│   │   ├── admin/        # Admin operations
│   │   └── extraTiffins/ # Extra order handling
│   ├── models/           # Mongoose data models
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions
│   ├── helpers/          # Helper functions
│   └── constants/        # Application constants
├── __tests__/            # Test files
└── docs/                 # API documentation
```

Each module contains:

- **Controller**: HTTP request handling
- **Service**: Business logic
- **Repository**: Database operations
- **Validator**: Input validation
- **Routes**: API endpoints

### Frontend Architecture (Feature-Based)

```
client/
├── src/
│   ├── api/              # Centralized API layer
│   ├── components/       # Reusable components
│   │   ├── common/       # Generic components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI primitives
│   ├── features/         # Feature-based modules
│   │   ├── auth/
│   │   ├── menu/
│   │   ├── subscriptions/
│   │   ├── billing/
│   │   ├── deliveries/
│   │   └── admin/
│   ├── hooks/            # Custom React hooks
│   ├── context/          # React context providers
│   ├── utils/            # Utility functions
│   ├── constants/        # Application constants
│   └── pages/            # Page components
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/PiyushJawale/tiffin-service-Saas.git
cd tiffin-service

# Install all dependencies
npm run install:all

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your configuration

# Start development server
npm run dev
```

### Environment Variables

Create a `server/.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/tiffin-service

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# API Configuration
API_VERSION=v1
```

## 📁 Project Structure

### Backend Structure

| Directory     | Purpose                                       |
| ------------- | --------------------------------------------- |
| `config/`     | Environment configuration, constants          |
| `database/`   | MongoDB connection, graceful shutdown         |
| `modules/`    | Feature-based architecture (auth, menu, etc.) |
| `models/`     | Mongoose schemas and models                   |
| `middleware/` | Auth, error handling, validation, security    |
| `utils/`      | Logger, response formatter, API error classes |
| `helpers/`    | Date utilities, business helpers              |
| `constants/`  | App-wide constants (roles, status codes)      |

### Frontend Structure

| Directory     | Purpose                            |
| ------------- | ---------------------------------- |
| `api/`        | Axios client, API service modules  |
| `components/` | Reusable UI components             |
| `features/`   | Feature-based state and components |
| `hooks/`      | Custom React hooks                 |
| `context/`    | React Context providers            |
| `pages/`      | Route-level page components        |
| `utils/`      | Frontend utilities                 |
| `constants/`  | Frontend constants                 |

## 🔐 Security Features

- **Helmet**: HTTP headers security
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API request throttling
- **Mongo Sanitize**: NoSQL injection prevention
- **XSS Clean**: Cross-site scripting protection
- **HPP**: HTTP parameter pollution prevention
- **JWT**: Access and refresh token authentication
- **Password Hashing**: bcryptjs with salt rounds

## 🧪 Testing

```bash
# Run server tests
npm run test

# Run client tests
npm run test:client

# Run with coverage
npm run test:coverage
```

## 🐳 Docker Deployment

```bash
# Build Docker image
npm run docker:build

# Run with Docker Compose
npm run docker:run

# Stop containers
npm run docker:down
```

## 📝 Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

Pre-commit hooks automatically lint and format code via Husky.

## 🔄 CI/CD Pipeline

GitHub Actions workflow includes:

- Lint and format checks
- Server tests
- Client build
- Docker build test
- Security audit
- Production deployment (on main branch)

## 📚 API Documentation

API documentation is available via Swagger UI at `/api/docs` when running the server.

### API Versioning

All endpoints are versioned:

- Current version: `/api/v1/*`
- Backward compatibility: `/api/*` (maps to v1)

### Key Endpoints

| Module        | Endpoint                  | Description                 |
| ------------- | ------------------------- | --------------------------- |
| Auth          | `/api/v1/auth/*`          | Registration, login, tokens |
| Menu          | `/api/v1/menu/*`          | Menu CRUD operations        |
| Subscriptions | `/api/v1/subscriptions/*` | Subscription management     |
| Deliveries    | `/api/v1/deliveries/*`    | Delivery tracking           |
| Bills         | `/api/v1/bills/*`         | Billing operations          |
| Admin         | `/api/v1/admin/*`         | Admin dashboard             |

## 🏛️ Design Principles

- **SOLID**: Single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion
- **DRY**: Don't Repeat Yourself - reusable components and utilities
- **KISS**: Keep It Simple, Stupid - clear, maintainable code
- **Separation of Concerns**: Clear layer separation
- **Clean Code**: Meaningful names, small functions, clear intent

## 📈 Scalability

The architecture supports:

- Horizontal scaling via stateless design
- Database connection pooling
- Redis caching (ready for integration)
- Message queue support (ready for integration)
- Microservices migration path

## 🔧 Configuration

### Development

```bash
npm run dev          # Start server with nodemon
npm run dev:client   # Start React development server
```

### Production

```bash
npm run build        # Build React client
npm start            # Start production server
```

## 📦 Dependencies

### Backend

- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- helmet - Security headers
- cors - CORS middleware
- express-rate-limit - Rate limiting
- express-validator - Input validation
- swagger-jsdoc - API documentation
- swagger-ui-express - Swagger UI

### Frontend

- react - UI library
- react-router-dom - Routing
- axios - HTTP client

## 🤝 Contributing

1. Create a feature branch from `production-refactor`
2. Make changes following the established patterns
3. Ensure tests pass and code is linted
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details.

---

**Version**: 2.0.0  
**Last Updated**: 2026
