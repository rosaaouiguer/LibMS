const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book ID is required']
  },
  reservationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Held', 'Awaiting Pickup', 'Cancelled'],
    default: 'Held'
  },
  availableDate: {
    type: Date,
    default: null
  },
  pickupDeadline: {
    type: Date,
    default: null
  },
  daysUntilExpiry: {
    type: Number,
    required: [true, 'Days until expiry is required'],
    min: [1, 'Minimum days until expiry is 1']
  },
}, {
  timestamps: true
});

// Compound index to prevent duplicate reservations by the same student for the same book
ReservationSchema.index({ studentId: 1, bookId: 1 }, { unique: true });

// Set availableDate and pickupDeadline when status changes to Awaiting Pickup
ReservationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'Awaiting Pickup' && !this.availableDate) {
    // Set the availableDate to now
    this.availableDate = new Date();
    
    // Calculate the pickup deadline based on daysUntilExpiry
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + this.daysUntilExpiry);
    this.pickupDeadline = deadline;
  }
  next();
});

module.exports = mongoose.model('Reservation', ReservationSchema);