const app = require('./app');
const { env, validateEnv } = require('./config/env');
const databaseManager = require('./database/connection');
const logger = require('./utils/logger');

/**
 * Server Entry Point
 * Handles startup, database connection, and graceful shutdown
 */

// Validate environment variables
validateEnv();

let server;

/**
 * Start the server
 */
async function startServer() {
  try {
    // Connect to MongoDB
    await databaseManager.connect();

    // Start Express server
    server = app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Promise Rejection:', {
        message: err.message,
        stack: err.stack,
      });
      shutdownServer(1);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', {
        message: err.message,
        stack: err.stack,
      });
      shutdownServer(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function shutdownServer(exitCode = 0) {
  logger.info('Shutting down server gracefully...');

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        await databaseManager.disconnect();
        logger.info('Database connection closed');
        process.exit(exitCode);
      } catch (error) {
        logger.error('Error during shutdown:', error.message);
        process.exit(1);
      }
    });
  } else {
    process.exit(exitCode);
  }
}

// Handle SIGTERM and SIGINT
process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  shutdownServer(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received');
  shutdownServer(0);
});

// Start the server
startServer();

module.exports = server;