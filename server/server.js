const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors({
  origin: [
    'https://dashboard.music-hub.ro',
    'https://music-school-frontend.onrender.com'
  ],
  credentials: true // if you use cookies
}));
app.options('*', cors());
app.use(express.json());

const reportsRouter = require(path.join(__dirname, 'routes', 'reports'));
const performanceRouter = require(path.join(__dirname, 'routes', 'performance'));

app.use('/api/reports', reportsRouter);
app.use('/api/performance', performanceRouter);

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