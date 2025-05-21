const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please add a name']
  },
  email: { 
    type: String, 
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: { 
    type: String, 
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'],
    default: 'user' 
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isAdmin: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  // Basic validation
  if (!enteredPassword || typeof enteredPassword !== 'string') {
    console.error('Invalid password format:', { 
      type: typeof enteredPassword,
      userId: this._id 
    });
    return false;
  }
  
  if (!this.password) {
    console.error('No password hash found for user:', { userId: this._id });
    return false;
  }
  
  try {
    // Log basic info (don't log actual passwords)
    console.log('Password comparison for user:', this.email);
    console.log('Entered password length:', enteredPassword.length);
    console.log('Stored hash length:', this.password.length);
    
    // Compare passwords
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('Password match result:', isMatch);
    
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', {
      error: error.message,
      userId: this._id,
      email: this.email
    });
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);