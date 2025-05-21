const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/musichub?authSource=admin',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// User model
const User = require('../server/models/User');

const fixTestUser = async () => {
  let conn;
  try {
    conn = await connectDB();
    
    const TEST_EMAIL = 'test@example.com';
    const TEST_PASSWORD = 'test1234';
    
    // Check if user already exists
    let user = await User.findOne({ email: TEST_EMAIL });
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, salt);
    
    if (user) {
      console.log('Updating existing test user...');
      // Update the user with the hashed password
      user.password = hashedPassword;
      await user.save();
      console.log('Test user password updated successfully');
    } else {
      console.log('Creating new test user...');
      // Create new user with hashed password
      user = await User.create({
        name: 'Test User',
        email: TEST_EMAIL,
        password: hashedPassword,
        isAdmin: true
      });
      console.log('Test user created successfully');
    }
    
    // Verify the user was created/updated correctly
    const updatedUser = await User.findOne({ email: TEST_EMAIL }).select('+password').lean();
    console.log('User details:', {
      _id: updatedUser._id,
      email: updatedUser.email,
      hasPassword: !!updatedUser.password,
      passwordType: typeof updatedUser.password,
      passwordLength: updatedUser.password ? updatedUser.password.length : 0,
      isAdmin: updatedUser.isAdmin
    });
    
    // Verify password works
    const isMatch = await bcrypt.compare(TEST_PASSWORD, updatedUser.password);
    console.log('Password verification:', isMatch ? '✅ Success' : '❌ Failed');
    
    console.log('Test user ready. You can now log in with:');
    console.log(`Email: ${TEST_EMAIL}`);
    console.log(`Password: ${TEST_PASSWORD}`);
    
    await conn.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error fixing test user:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    if (conn) await conn.disconnect();
    process.exit(1);
  }
};

fixTestUser();
