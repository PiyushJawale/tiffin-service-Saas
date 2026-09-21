const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { env } = require('./config/env');
const {
  helmetMiddleware,
  corsMiddleware,
  apiLimiter,
  mongoSanitizeMiddleware,
  xssMiddleware,
  hppMiddleware,
} = require('./middleware/security');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./modules/auth/routes/authRoutes');
const menuRoutes = require('./modules/menu/routes/menuRoutes');
const subscriptionRoutes = require('./modules/subscriptions/routes/subscriptionRoutes');
const deliveryRoutes = require('./modules/deliveries/routes/deliveryRoutes');
const billRoutes = require('./modules/billing/routes/billRoutes');
const adminRoutes = require('./modules/admin/routes/adminRoutes');
const extraTiffinRoutes = require('./modules/extraTiffins/routes/extraTiffinRoutes');
const contactRoutes = require('./modules/contact/routes/contactRoutes');

/**
 * Express Application Setup
 */
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser (for refresh tokens)
app.use(cookieParser());

// Data sanitization
app.use(mongoSanitizeMiddleware);
app.use(xssMiddleware);
app.use(hppMiddleware);

// Rate limiting
app.use('/api', apiLimiter);

// API versioning and routes
const apiBase = `/api/${env.apiVersion}`;

app.use(`${apiBase}/auth`, authRoutes);
app.use(`${apiBase}/menu`, menuRoutes);
app.use(`${apiBase}/subscriptions`, subscriptionRoutes);
app.use(`${apiBase}/deliveries`, deliveryRoutes);
app.use(`${apiBase}/bills`, billRoutes);
app.use(`${apiBase}/admin`, adminRoutes);
app.use(`${apiBase}/extra-tiffins`, extraTiffinRoutes);
app.use(`${apiBase}/contact`, contactRoutes);

// Backward compatibility: also mount routes without version prefix
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/extra-tiffins', extraTiffinRoutes);
app.use('/api/contact', contactRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// API root route - list available endpoints
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Mumbai Tiffin Service API v1',
    endpoints: {
      auth: '/api/v1/auth',
      menu: '/api/v1/menu',
      subscriptions: '/api/v1/subscriptions',
      deliveries: '/api/v1/deliveries',
      bills: '/api/v1/bills',
      admin: '/api/v1/admin',
      extraTiffins: '/api/v1/extra-tiffins',
      contact: '/api/v1/contact',
    },
    documentation: '/api/docs',
    health: '/api/health',
  });
});

// API root route (backward compatibility)
app.get('/api', (req, res) => {
  res.redirect('/api/v1');
});

// Serve static files from React build in production
if (env.nodeEnv === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
  });
}

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
