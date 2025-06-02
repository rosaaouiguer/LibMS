// controllers/bookLendingRightsController.js
const BookLendingRights = require('../models/BookLendingRights');
const Book = require('../models/Book');

// @desc    Get all book lending rights
// @route   GET /api/book-lending-rights
// @access  Private/Admin
exports.getAllBookLendingRights = async (req, res) => {
  try {
    const lendingRights = await BookLendingRights.find().populate('bookId', 'title author isbn');
    
    res.status(200).json({
      success: true,
      count: lendingRights.length,
      data: lendingRights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get lending rights for a specific book
// @route   GET /api/book-lending-rights/:id
// @access  Private
exports.getBookLendingRights = async (req, res) => {
  try {
    const lendingRights = await BookLendingRights.findById(req.params.id)
      .populate('bookId', 'title author isbn');
    
    if (!lendingRights) {
      return res.status(404).json({
        success: false,
        error: 'Book lending rights not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: lendingRights
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get lending rights by book ID
// @route   GET /api/book-lending-rights/book/:bookId
// @access  Private
exports.getLendingRightsByBookId = async (req, res) => {
  try {
    const lendingRights = await BookLendingRights.findOne({ bookId: req.params.bookId })
      .populate('bookId', 'title author isbn');
    
    if (!lendingRights) {
      return res.status(404).json({
        success: false,
        error: 'Book lending rights not found for this book'
      });
    }
    
    res.status(200).json({
      success: true,
      data: lendingRights
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid book ID format'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create book lending rights
// @route   POST /api/book-lending-rights
// @access  Private/Admin
exports.createBookLendingRights = async (req, res) => {
  try {
    // Check if book exists
    const book = await Book.findById(req.body.bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    // Check if lending rights already exist for this book
    const existingRights = await BookLendingRights.findOne({ bookId: req.body.bookId });
    if (existingRights) {
      return res.status(400).json({
        success: false,
        error: 'Lending rights already exist for this book'
      });
    }
    
    const lendingRights = await BookLendingRights.create(req.body);
    
    res.status(201).json({
      success: true,
      data: lendingRights
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update book lending rights
// @route   PUT /api/book-lending-rights/:id
// @access  Private/Admin
exports.updateBookLendingRights = async (req, res) => {
  try {
    const lendingRights = await BookLendingRights.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('bookId', 'title author isbn');
    
    if (!lendingRights) {
      return res.status(404).json({
        success: false,
        error: 'Book lending rights not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: lendingRights
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete book lending rights
// @route   DELETE /api/book-lending-rights/:id
// @access  Private/Admin
exports.deleteBookLendingRights = async (req, res) => {
  try {
    const lendingRights = await BookLendingRights.findById(req.params.id);
    
    if (!lendingRights) {
      return res.status(404).json({
        success: false,
        error: 'Book lending rights not found'
      });
    }
    
    await lendingRights.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};