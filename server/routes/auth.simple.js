const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.simple');
const { protect } = require('../middleware/auth.simple');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateProfile);
router.delete('/me', protect, authController.deleteAccount);

module.exports = router;
