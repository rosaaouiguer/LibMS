// models/Student.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Borrowing = require('./Borrowing'); // Import Borrowing model

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:\.[A-Za-z]{2,})*$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: false,
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  image: {
    type: String,
    default: 'assets/defaultItemPic.png'
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentCategory',
    required: true
  },
  banned: {
    type: Boolean,
    default: false
  },
  bannedUntil: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Cascade delete borrowings when a student is deleted
studentSchema.pre('deleteOne', { document: true }, async function(next) {
  try {
    // Delete all borrowings associated with this student
    await Borrowing.deleteMany({ studentId: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
studentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;