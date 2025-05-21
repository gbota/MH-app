require('module-alias/register');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const logger = require('@utils/logger');
const User = require('@models/User');

// Load environment variables
require('dotenv').config();

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    isActive: true
  },
  {
    name: 'Teacher One',
    email: 'teacher1@example.com',
    password: 'teacher123',
    role: 'teacher',
    isActive: true
  },
  {
    name: 'Student One',
    email: 'student1@example.com',
    password: 'student123',
    role: 'student',
    isActive: true
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed database
const seedDatabase = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    logger.info('Cleared existing users');

    // Hash passwords and create users
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        return {
          ...user,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      })
    );

    // Insert users
    await User.insertMany(createdUsers);
    logger.info('Database seeded successfully');
    
    // Log the created users
    const userList = await User.find().select('-password');
    logger.info('Created users:', userList);
    
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
