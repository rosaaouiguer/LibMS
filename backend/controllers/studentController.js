// controllers/studentController.js
const Student = require('../models/Student');
const StudentCategory = require('../models/StudentCategory');
const Borrowing = require('../models/Borrowing');
const mongoose = require('mongoose');

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    // Updated to include all category fields, especially extensionLimit
    const students = await Student.find().populate('category');
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single student
exports.getStudent = async (req, res) => {
  try {
    // Updated to include all category fields, especially extensionLimit
    const student = await Student.findById(req.params.id).populate('category');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID format'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get current student (new method)
exports.getCurrentStudent = async (req, res) => {
  try {
    // Get the authenticated student from req object (set by auth middleware)
    if (!req.student) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }
    
    // Get full student data with populated category
    const student = await Student.findById(req.student._id).populate('category');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create new student
exports.createStudent = async (req, res) => {
  try {
    // Validate that the category exists
    if (req.body.category) {
      const categoryExists = await StudentCategory.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category ID. Category does not exist.'
        });
      }
    }

    const student = await Student.create(req.body);
    
    // Populate category for response - include all fields
    const populatedStudent = await Student.findById(student._id).populate('category');
    
    res.status(201).json({
      success: true,
      data: populatedStudent
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else if (error.code === 11000) {
      // Handle duplicate key error (unique constraint violation)
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      return res.status(400).json({
        success: false,
        error: `${field === 'studentId' ? 'Student ID' : field} '${value}' is already used`
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    // Validate that the category exists if provided
    if (req.body.category) {
      const categoryExists = await StudentCategory.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category ID. Category does not exist.'
        });
      }
    }
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category'); // Include all category fields
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else if (error.code === 11000) {
      // Handle duplicate key error (unique constraint violation)
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      return res.status(400).json({
        success: false,
        error: `${field === 'studentId' ? 'Student ID' : field} '${value}' is already used`
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



exports.deleteStudent = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    // Start a transaction to ensure atomic operation
    session.startTransaction();
    
    // Find the student first
    const student = await Student.findById(req.params.id).session(session);
    
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Delete associated borrowings first
    await Borrowing.deleteMany({ studentId: student._id }).session(session);
    
    // Then delete the student
    await student.deleteOne({ session });
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      success: true,
      data: {},
      message: 'Student and associated borrowings deleted successfully'
    });
  } catch (error) {
    // If transaction fails, abort and end session
    await session.abortTransaction();
    session.endSession();
    
    console.error('Delete student error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

/**
 * Update category for multiple students
 * @route POST /api/student/bulk-update-category
 * @access Private
 */
exports.bulkUpdateCategory = async (req, res) => {
  try {
    const { studentIds, fromCategoryId, toCategoryId } = req.body;
    
    // Validate request body
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of student IDs'
      });
    }
    
    if (!toCategoryId) {
      return res.status(400).json({
        success: false,
        error: 'Target category ID is required'
      });
    }
    
    // Verify that the target category exists
    const targetCategory = await StudentCategory.findById(toCategoryId);
    if (!targetCategory) {
      return res.status(400).json({
        success: false,
        error: 'Target category does not exist'
      });
    }
    
    // Build query - if fromCategoryId is provided, only update students from that category
    const query = { studentId: { $in: studentIds } };
    if (fromCategoryId) {
      query.category = fromCategoryId;
    }
    
    // Update all matching students
    const result = await Student.updateMany(
      query,
      { $set: { category: toCategoryId } }
    );
    
    res.status(200).json({
      success: true,
      message: `Successfully updated student categories`,
      updatedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    
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
  exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const studentId = req.params.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    // Find student by ID
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Check if current password matches
    const isMatch = await student.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    student.password = newPassword;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
// Search students
exports.searchStudents = async (req, res) => {
  try {
    const { name, email, studentId, category } = req.query;
    const searchQuery = {};
    
    if (name) searchQuery.name = { $regex: name, $options: 'i' };
    if (email) searchQuery.email = { $regex: email, $options: 'i' };
    if (studentId) searchQuery.studentId = { $regex: studentId, $options: 'i' };
    
    // Search by category ID or name
    if (category) {
      // If a valid ObjectId is provided, search directly
      if (mongoose.Types.ObjectId.isValid(category)) {
        searchQuery.category = category;
      } else {
        // If not a valid ObjectId, search by category name
        const categories = await StudentCategory.find({ 
          name: { $regex: category, $options: 'i' } 
        });
        const categoryIds = categories.map(cat => cat._id);
        if (categoryIds.length > 0) {
          searchQuery.category = { $in: categoryIds };
        }
      }
    }
    
    // Updated to include all category fields, especially extensionLimit
    const students = await Student.find(searchQuery).populate('category');
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};