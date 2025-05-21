const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const allowedOrigins = [
  'https://dashboard.music-hub.ro',
  'https://music-school-frontend.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.options('*', cors());

app.use(express.json());

const reportsRouter = require(path.join(__dirname, 'routes', 'reports'));
const performanceRouter = require(path.join(__dirname, 'routes', 'performance'));
const authRouter = require(path.join(__dirname, 'routes', 'auth'));

app.use('/api/reports', reportsRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/auth', authRouter);

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
  console.error('Global error handler:', err.stack || err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
}); 