const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const app = express();

const allowedOrigins = [
  'https://dashboard.music-hub.ro',
  'https://music-school-frontend.onrender.com'
];

dotenv.config();

// Request logging middleware
app.use(morgan('dev'));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// CORS middleware - temporarily allow all origins for debugging
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const reportsRouter = require(path.join(__dirname, 'routes', 'reports'));
const performanceRouter = require(path.join(__dirname, 'routes', 'performance'));
const authRouter = require(path.join(__dirname, 'routes', 'auth'));
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');

app.use('/api/reports', reportsRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);

app.get('/cors-test', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Add global error handler
app.use((err, req, res, next) => {
  console.error('--- GLOBAL ERROR HANDLER ---');
  console.error('Request:', req.method, req.url);
  console.error('Headers:', JSON.stringify(req.headers, null, 2));
  console.error('Error:', err.stack || err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Error handling middleware
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler); 