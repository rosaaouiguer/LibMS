// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  getMe, 
  forgotPassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);

// Protected routes
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;