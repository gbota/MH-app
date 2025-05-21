#!/usr/bin/env node
const mongoose = require('mongoose');
const User = require('../server/models/User');
require('dotenv').config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (admin) {
      console.log('Admin user already exists:', ADMIN_EMAIL);
    } else {
      admin = new User({
        name: 'Admin User',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        isAdmin: true,
        role: 'admin',
      });
      await admin.save();
      console.log('Admin user created:', ADMIN_EMAIL);
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin user:', err.message);
    process.exit(1);
  }
})(); 