#!/usr/bin/env node
const mongoose = require('mongoose');
const User = require('../server/models/User');
require('dotenv').config();

const [,, name, email, password, role] = process.argv;

if (!name || !email || !password || !role) {
  console.error('Usage: node scripts/create-user.js <name> <email> <password> <role>');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const user = new User({ name, email, password, role });
    await user.save();
    console.log('User created successfully:', { name, email, role });
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error creating user:', err.message);
    process.exit(1);
  }
})(); 