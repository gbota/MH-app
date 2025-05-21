const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../server/models/User');

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://admin:admin123@mh-mongodb:27017/musichub?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create test user
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'test1234',
      isAdmin: true
    });

    // Save user (password will be hashed by the pre-save hook)
    await user.save();
    
    console.log('Test user created successfully:', {
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser();
