// controllers/studentAuthController.js
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key', {
    expiresIn: '30d'
  });
};

// Login student
exports.loginStudent = async (req, res) => {
  try {
    console.log('Login attempt:', req.body.email);
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Find student by email
    const student = await Student.findOne({ email }).populate('category');
    console.log('Found student:', student ? student.email : 'Not found');

    // Check if student exists
    if (!student) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await student.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if student is banned
    if (student.banned) {
      // If banned until date exists and is in the future
      if (student.bannedUntil && student.bannedUntil > new Date()) {
        return res.status(403).json({
          success: false,
          error: `Your account is banned until ${student.bannedUntil.toDateString()}`
        });
      } 
      // If banned indefinitely (bannedUntil is null)
      else if (!student.bannedUntil) {
        return res.status(403).json({
          success: false,
          error: 'Your account has been banned'
        });
      }
      // If bannedUntil date has passed, unban the user
      else {
        student.banned = false;
        student.bannedUntil = null;
        await student.save();
      }
    }

    // Create a sanitized student object (without password)
    const sanitizedStudent = {
      _id: student._id,
      name: student.name,
      studentId: student.studentId,
      email: student.email,
      dateOfBirth: student.dateOfBirth,
      image: student.image,
      phoneNumber: student.phoneNumber,
      category: student.category,
      banned: student.banned,
      bannedUntil: student.bannedUntil,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt
    };

    // Return token and student data
    res.status(200).json({
      success: true,
      token: generateToken(student._id),
      data: sanitizedStudent
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};