// models/BookLendingRights.js
const mongoose = require('mongoose');

const bookLendingRightsSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book reference is required'],
    unique: true
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

const BookLendingRights = mongoose.model('BookLendingRights', bookLendingRightsSchema);

module.exports = BookLendingRights;