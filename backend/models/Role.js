// models/Role.js
const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: [true, 'Please add a role name'],
    unique: true,
    enum: ['Admin', 'Librarian', 'Staff', 'Faculty', 'Student', 'User'],
    trim: true
  },
  description: {
    type: String,
    required: false
  },
  permissions: {
    type: [String],
    required: true,
    default: []
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
  timestamps: true // This will automatically handle createdAt and updatedAt
});

module.exports = mongoose.model('Role', RoleSchema);