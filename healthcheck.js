const http = require('http');
const mongoose = require('mongoose');
const logger = require('./server/utils/logger');

const PORT = process.env.PORT || 5050;
const HOST = '0.0.0.0';

// Check MongoDB connection
const checkMongoDB = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    logger.error('MongoDB health check failed:', error);
    return false;
  }
};

// Create a simple HTTP server for health checks
const server = http.createServer(async (req, res) => {
  if (req.url === '/health') {
    try {
      const dbStatus = await checkMongoDB();
      const status = dbStatus ? 'healthy' : 'unhealthy';
      const statusCode = dbStatus ? 200 : 503;
      
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status,
        timestamp: new Date().toISOString(),
        database: dbStatus ? 'connected' : 'disconnected'
      }));
    } catch (error) {
      logger.error('Health check failed:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', error: error.message }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'not_found' }));
  }
});

// Start the health check server
server.listen(PORT, HOST, () => {
  logger.info(`Health check server running at http://${HOST}:${PORT}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection:', error);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

// Handle termination signals
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Health check server stopped');
    process.exit(0);
  });
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Health check server stopped');
    process.exit(0);
  });
});
