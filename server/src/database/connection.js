const mongoose = require('mongoose');
const { env } = require('../config/env');
const logger = require('../utils/logger');

/**
 * MongoDB Connection Manager
 * Handles connection, reconnection, and graceful shutdown
 */
class DatabaseManager {
  constructor() {
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000;
  }

  /**
   * Connect to MongoDB with retry logic
   */
  async connect() {
    try {
      mongoose.set('strictQuery', true);

      await mongoose.connect(env.mongodbUri, {
        ...env.mongoOptions,
        autoIndex: env.nodeEnv !== 'production',
      });

      this.isConnected = true;
      this.retryCount = 0;
      logger.info('Connected to MongoDB successfully');

      this.setupEventHandlers();
    } catch (error) {
      this.retryCount++;
      logger.error(`MongoDB connection attempt ${this.retryCount} failed:`, error.message);

      if (this.retryCount < this.maxRetries) {
        logger.info(`Retrying connection in ${this.retryDelay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this.connect();
      }

      throw error;
    }
  }

  /**
   * Setup Mongoose connection event handlers
   */
  setupEventHandlers() {
    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      this.isConnected = false;
      logger.error('Mongoose connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      logger.warn('Mongoose disconnected from MongoDB');
    });

    mongoose.connection.on('reconnected', () => {
      this.isConnected = true;
      logger.info('Mongoose reconnected to MongoDB');
    });
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error.message);
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  isReady() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

// Export singleton instance
module.exports = new DatabaseManager();