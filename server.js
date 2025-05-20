require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (commented out for now)
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/music-school', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.log('MongoDB connection error:', err));

// Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/teachers', require('./routes/teachers'));
// app.use('/api/students', require('./routes/students'));
// app.use('/api/bands', require('./routes/bands'));
// app.use('/api/payments', require('./routes/payments'));
app.use('/api/reports', require('./server/routes/reports'));
app.use('/api/calendar', require('./server/routes/calendar'));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 