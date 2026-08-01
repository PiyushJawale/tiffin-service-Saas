const { env } = require('../config/env');

/**
 * Centralized Logger Utility
 * Provides structured logging with levels: info, warn, error, debug
 */
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[env.logLevel] ?? LEVELS.info;

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
  };

  if (meta !== undefined) {
    logEntry.meta = meta;
  }

  return logEntry;
};

const logger = {
  error(message, meta) {
    if (currentLevel >= LEVELS.error) {
      const entry = formatMessage('error', message, meta);
      console.error(JSON.stringify(entry));
    }
  },

  warn(message, meta) {
    if (currentLevel >= LEVELS.warn) {
      const entry = formatMessage('warn', message, meta);
      console.warn(JSON.stringify(entry));
    }
  },

  info(message, meta) {
    if (currentLevel >= LEVELS.info) {
      const entry = formatMessage('info', message, meta);
      console.info(JSON.stringify(entry));
    }
  },

  debug(message, meta) {
    if (currentLevel >= LEVELS.debug) {
      const entry = formatMessage('debug', message, meta);
      console.debug(JSON.stringify(entry));
    }
  },
};

module.exports = logger;