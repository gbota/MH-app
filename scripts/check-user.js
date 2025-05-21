const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/musichub?authSource=admin');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const checkUser = async () => {
  try {
    await connectDB();
    
    // Get the User model
    const User = require('../server/models/User');
    
    // Find the test user
    const user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }
    
    console.log('User found:', {
      _id: user._id,
      email: user.email,
      password: user.password ? '*** hashed ***' : 'NO PASSWORD',
      passwordLength: user.password ? user.password.length : 0,
      passwordType: typeof user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
    
    // Try to verify the password
    const password = 'test1234';
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password '${password}' matches:`, isMatch);
    
    // Try to hash the same password to see if it matches
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('New hash for same password:', hashedPassword);
    
    // Check if the stored password is a valid bcrypt hash
    const isHashValid = user.password.startsWith('$2a$') && user.password.split('$').length === 4;
    console.log('Stored password is valid bcrypt hash:', isHashValid);
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking user:', error);
    process.exit(1);
  }
};

checkUser();
