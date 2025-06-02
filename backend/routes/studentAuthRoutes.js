// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const studentAuthController = require('../controllers/studentAuthController');

// Auth routes
router.post('/login', studentAuthController.loginStudent);


module.exports = router;