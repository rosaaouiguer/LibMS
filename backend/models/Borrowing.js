const mongoose = require('mongoose');

const BorrowingSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  borrowingDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  lendingCondition: {
    type: String,
    enum: ['Perfect', 'Good', 'Fair', 'Poor'],
    required: true
  },
  returnCondition: {
    type: String,
    enum: ['Perfect', 'Good', 'Fair', 'Poor']
  },
  status: {
    type: String,
    enum: ['Borrowed', 'Returned', 'Overdue'],
    default: 'Borrowed'
  }
}, {
  timestamps: true
});

// Check if book is overdue before save
BorrowingSchema.pre('save', function(next) {
  // Only check if status is still 'Borrowed'
  if (this.status === 'Borrowed') {
    const now = new Date();
    if (now > this.dueDate) {
      this.status = 'Overdue';
    }
  }
  next();
});

module.exports = mongoose.model('Borrowing', BorrowingSchema);