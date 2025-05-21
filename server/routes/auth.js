const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const cors = require('cors');

// Public routes
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);

// Protected routes
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Handle CORS preflight for /login
router.options('/login', cors(), (req, res) => {
  res.sendStatus(204);
});

module.exports = router;