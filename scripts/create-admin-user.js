const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27018/musichub?authSource=admin',
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

const createAdminUser = async () => {
  let conn;
  try {
    conn = await connectDB();
    
    const ADMIN_EMAIL = 'admin@example.com';
    const ADMIN_PASSWORD = 'admin123';
    
    // Delete existing admin user if exists
    await User.deleteOne({ email: ADMIN_EMAIL });
    
    // Create new admin user
    const adminUser = new User({
      name: 'Admin User',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      isAdmin: true,
      role: 'admin'
    });
    
    // Save the user manually to trigger the pre-save hook
    await adminUser.save();
    
    console.log('Admin user created successfully:', {
      _id: adminUser._id,
      email: adminUser.email,
      isAdmin: adminUser.isAdmin,
      role: adminUser.role,
      hasPassword: !!adminUser.password,
      passwordType: typeof adminUser.password,
      passwordLength: adminUser.password ? adminUser.password.length : 0
    });
    
    // Verify the user was saved correctly
    const savedUser = await User.findOne({ email: ADMIN_EMAIL }).select('+password').lean();
    console.log('Saved user from DB:', {
      _id: savedUser._id,
      email: savedUser.email,
      hasPassword: !!savedUser.password,
      passwordType: typeof savedUser.password,
      passwordLength: savedUser.password ? savedUser.password.length : 0,
      isAdmin: savedUser.isAdmin,
      role: savedUser.role
    });
    
    // Verify password works
    const isMatch = await bcrypt.compare(ADMIN_PASSWORD, savedUser.password);
    console.log('Password verification:', isMatch ? '✅ Success' : '❌ Failed');
    
    console.log('\nAdmin user created successfully!');
    console.log('You can now log in with:');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    
    await conn.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyValue: error.keyValue
    });
    
    if (conn) await conn.disconnect();
    process.exit(1);
  }
};

createAdminUser();
