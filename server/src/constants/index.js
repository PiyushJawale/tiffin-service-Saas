/**
 * Application Constants
 * Centralized constants used across the application
 */

const CONSTANTS = {
  // User roles
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },

  // Subscription status
  SUBSCRIPTION_STATUS: {
    ACTIVE: 'active',
    PAUSED: 'paused',
    CANCELLED: 'cancelled',
  },

  // Bill status
  BILL_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    OVERDUE: 'overdue',
  },

  // Meal types
  MEAL_TYPES: {
    VEG: 'veg',
    NON_VEG: 'non-veg',
    JAIN: 'jain',
  },

  // Delivery times
  DELIVERY_TIMES: {
    LUNCH: 'lunch',
    DINNER: 'dinner',
  },

  // Days of week
  DAYS_OF_WEEK: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  // Months
  MONTHS: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],

  // Pricing configuration
  PRICING: {
    veg: {
      monthlyPrice: 2200,
      pricePerTiffin: 120,
    },
    'non-veg': {
      monthlyPrice: 2800,
      pricePerTiffin: 150,
    },
    jain: {
      monthlyPrice: 2400,
      pricePerTiffin: 130,
    },
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // API versions
  API_VERSIONS: ['v1'],
};

module.exports = CONSTANTS;
module.exports.ROLES = CONSTANTS.ROLES;
module.exports.SUBSCRIPTION_STATUS = CONSTANTS.SUBSCRIPTION_STATUS;
module.exports.BILL_STATUS = CONSTANTS.BILL_STATUS;
module.exports.MEAL_TYPES = CONSTANTS.MEAL_TYPES;
module.exports.DELIVERY_TIMES = CONSTANTS.DELIVERY_TIMES;
module.exports.PRICING = CONSTANTS.PRICING;
module.exports.PAGINATION = CONSTANTS.PAGINATION;
