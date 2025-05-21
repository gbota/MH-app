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
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const updateUserPassword = async () => {
  let conn;
  try {
    conn = await connectDB();
    
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
      hasPassword: !!user.password,
      passwordType: typeof user.password,
      passwordLength: user.password ? user.password.length : 0
    });
    
    // Set a new password
    const newPassword = 'test1234';
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Save the user with the new password
    await user.save();
    
    console.log('Password updated successfully');
    console.log('New password hash:', user.password);
    
    // Verify the new password
    const isMatch = await bcrypt.compare(newPassword, user.password);
    console.log('New password verification:', isMatch);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating user password:', error);
    process.exit(1);
  } finally {
    if (conn) {
      await conn.disconnect();
    }
  }
};

updateUserPassword();
