const mongoose = require('mongoose');

const studentCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  borrowingLimit: {
    type: Number,
    required: [true, 'Borrowing limit is required'],
    default: 2,
    min: 0
  },
  loanDuration: {
    type: Number,
    required: [true, 'Loan duration is required'],
    default: 14,
    min: 1
  },
  loanExtensionAllowed: {
    type: Boolean,
    default: true
  },
  extensionLimit: {
    type: Number,
    default: 2,
    min: 0
  },
  extensionDuration: {
    type: Number,
    default: 7,
    min: 0
  },
  defaultBanDuration: {
    type: Number,
    default: 14,
    min: 0
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

const StudentCategory = mongoose.model('StudentCategory', studentCategorySchema);

module.exports = StudentCategory;