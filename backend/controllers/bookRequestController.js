// controllers/bookRequestController.js
const BookRequest = require('../models/BookRequest');

// Get all book requests
exports.getAllBookRequests = async (req, res) => {
  try {
    const bookRequests = await BookRequest.find()
      .populate('studentId', 'name email studentId');
    
    res.status(200).json({
      success: true,
      count: bookRequests.length,
      data: bookRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single book request
exports.getBookRequest = async (req, res) => {
  try {
    const bookRequest = await BookRequest.findById(req.params.id)
      .populate('studentId', 'name email studentId');
    
    if (!bookRequest) {
      return res.status(404).json({
        success: false,
        error: 'Book request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: bookRequest
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid book request ID format'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create new book request
exports.createBookRequest = async (req, res) => {
  try {
    const bookRequest = await BookRequest.create(req.body);
    res.status(201).json({
      success: true,
      data: bookRequest
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

// Update book request
exports.updateBookRequest = async (req, res) => {
  try {
    const bookRequest = await BookRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('studentId', 'name email studentId');
    
    if (!bookRequest) {
      return res.status(404).json({
        success: false,
        error: 'Book request not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: bookRequest
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

// Delete book request
exports.deleteBookRequest = async (req, res) => {
  try {
    const bookRequest = await BookRequest.findById(req.params.id);
    
    if (!bookRequest) {
      return res.status(404).json({
        success: false,
        error: 'Book request not found'
      });
    }
    
    await bookRequest.deleteOne();
    
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

// Get book requests by student ID
exports.getBookRequestsByStudent = async (req, res) => {
  try {
    const bookRequests = await BookRequest.find({ studentId: req.params.studentId });
    
    res.status(200).json({
      success: true,
      count: bookRequests.length,
      data: bookRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get book requests by status
exports.getBookRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate status
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status parameter. Must be Pending, Approved, or Rejected'
      });
    }
    
    const bookRequests = await BookRequest.find({ status })
      .populate('studentId', 'name email studentId');
    
    res.status(200).json({
      success: true,
      count: bookRequests.length,
      data: bookRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};