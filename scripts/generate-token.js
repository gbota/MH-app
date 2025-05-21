require('module-alias/register');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate a JWT token for testing
const generateToken = (userId, role = 'user') => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Example usage
const testToken = generateToken('test-user-id', 'admin');
console.log('Generated Token:', testToken);

// If you want to verify the token
if (process.env.JWT_SECRET) {
  try {
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);
  } catch (error) {
    console.error('Error verifying token:', error.message);
  }
} else {
  console.log('Set JWT_SECRET in .env to enable token verification');
}

module.exports = { generateToken };
