const { DAYS_OF_WEEK, MONTHS } = require('../constants');

/**
 * Date Helper Utility
 * Centralized date manipulation functions
 */

/**
 * Get the day name for a given date
 * @param {Date} date - Date object (defaults to now)
 * @returns {string} Day name (e.g., 'Monday')
 */
const getDayName = (date = new Date()) => {
  return DAYS_OF_WEEK[date.getDay()];
};

/**
 * Get the month name for a given month number
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name (e.g., 'January')
 */
const getMonthName = (month) => {
  return MONTHS[month - 1];
};

/**
 * Get start and end dates for a given month and year
 * @param {number} month - Month number (1-12)
 * @param {number} year - Full year (e.g., 2025)
 * @returns {Object} { startDate, endDate }
 */
const getMonthDateRange = (month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  return { startDate, endDate };
};

/**
 * Get the number of days in a given month
 * @param {number} month - Month number (1-12)
 * @param {number} year - Full year
 * @returns {number} Number of days in month
 */
const getDaysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};

/**
 * Get start and end of a given day
 * @param {Date|string} date - Date or date string
 * @returns {Object} { startOfDay, endOfDay }
 */
const getDayRange = (date) => {
  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
  return { startOfDay, endOfDay };
};

/**
 * Format a date for display
 * @param {Date} date - Date to format
 * @param {string} locale - Locale string (default: 'en-IN')
 * @returns {string} Formatted date string
 */
const formatDate = (date, locale = 'en-IN') => {
  return new Date(date).toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Check if a date is in the current month
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
const isCurrentMonth = (date) => {
  const now = new Date();
  const target = new Date(date);
  return (
    target.getMonth() === now.getMonth() &&
    target.getFullYear() === now.getFullYear()
  );
};

module.exports = {
  getDayName,
  getMonthName,
  getMonthDateRange,
  getDaysInMonth,
  getDayRange,
  formatDate,
  isCurrentMonth,
};