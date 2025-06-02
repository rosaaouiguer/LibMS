// controllers/studentCategoryController.js
const StudentCategory = require('../models/StudentCategory');

// Get all student categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await StudentCategory.find();
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single category
exports.getCategory = async (req, res) => {
  try {
    const category = await StudentCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID format'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const category = await StudentCategory.create(req.body);
    res.status(201).json({
      success: true,
      data: category
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
      return res.status(400).json({
        success: false,
        error: 'Category name already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await StudentCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
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
      return res.status(400).json({
        success: false,
        error: 'Category name already exists'
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

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await StudentCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    // Check if any students use this category before deleting
    const Student = require('../models/Student');
    const studentCount = await Student.countDocuments({ category: req.params.id });
    
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category: ${studentCount} student(s) are using this category`
      });
    }
    
    await category.deleteOne();
    
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