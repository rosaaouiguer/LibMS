const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Please add an author'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'Please add an ISBN'],
    unique: true,
    trim: true
  },
  callNumber: {
    type: String,
    required: false,
    trim: true
  },
  totalCopies: {
    type: Number,
    required: [true, 'Please specify total copies'],
    min: [1, 'Total copies must be at least 1']
  },
  availableCopies: {
    type: Number,
    required: [true, 'Please specify available copies'],
    min: [0, 'Available copies cannot be negative'],
  },
  barcode: {
    type: String,
    // We're completely removing any uniqueness constraints
    trim: true,
    required: false
  },
  summary: {
    type: String
  },
  keywords: {
    type: String
  },
  imageURL: {
    type: String
  },
  ebookLink: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field and handle empty barcode
BookSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Ensure availableCopies doesn't exceed totalCopies
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  
  // Convert empty string barcodes to null
  if (this.barcode === '') {
    this.barcode = null;
  }
  
  next();
});

module.exports = mongoose.model('Book', BookSchema);