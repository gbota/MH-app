const User = require('../models/User');
const logger = require('./logger');

const seedAdminUser = async () => {
  try {
    // Check if any admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      logger.info('Admin user already exists');
      return;
    }

    // Create default admin user
    const adminUser = new User({
      name: process.env.ADMIN_NAME || 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    logger.info('Default admin user created successfully');
  } catch (error) {
    logger.error('Error seeding admin user:', error);
  }
};

const seedDatabase = async () => {
  try {
    await seedAdminUser();
    // Add more seed functions here if needed
  } catch (error) {
    logger.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
