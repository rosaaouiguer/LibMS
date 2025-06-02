const Book = require('../models/Book');
const Borrowing = require('../models/Borrowing');
const Reservation = require('../models/Reservation');
const BookLendingRights = require('../models/BookLendingRights');
// @desc    Get all books
// @route   GET /api/books
// @access  Public
// In bookController.js
exports.getBooks = async (req, res, next) => {
  try {
    // Build query
    let query = Book.find();
    
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude from query
    const removeFields = ['select', 'sort', 'search'];
    
    // Remove fields from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Apply the parsed query
    query = query.find(JSON.parse(queryStr));
    
    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.or([
        { title: { $regex: searchRegex } },
        { author: { $regex: searchRegex } },
        { keywords: { $regex: searchRegex } }
      ]);
    }
    
    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Executing query - no pagination
    const books = await query;
    
    res.status(200).json({
      success: true,
      count: books.length,
      total: books.length,
      data: books
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Create new book
// @route   POST /api/books
// @access  Private/Admin
exports.createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    
    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Admin
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    
    // Check if book has any active borrowings
    const activeBorrowings = await Borrowing.find({
      bookId: book._id,
      status: { $in: ['Borrowed', 'Overdue','Returned'] }
    });
    
    if (activeBorrowings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book with existing borrowings, delete the borrowings first'
      });
    }
    
    // Delete all reservations for the book
    await Reservation.deleteMany({ bookId: book._id });
    
    await BookLendingRights.deleteMany({ bookId: book._id });

    // Delete the book
    await book.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};