const LibraryRule = require('../models/LibraryRule');

// @desc    Get all library rules
// @route   GET /api/rules
// @access  Public
exports.getRules = async (req, res, next) => {
  try {
    const rules = await LibraryRule.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rules.length,
      data: rules
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single library rule
// @route   GET /api/rules/:id
// @access  Public
exports.getRule = async (req, res, next) => {
  try {
    const rule = await LibraryRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new library rule
// @route   POST /api/rules
// @access  Private/Admin
exports.createRule = async (req, res, next) => {
  try {
    const rule = await LibraryRule.create(req.body);

    res.status(201).json({
      success: true,
      data: rule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update library rule
// @route   PUT /api/rules/:id
// @access  Private/Admin
exports.updateRule = async (req, res, next) => {
  try {
    const rule = await LibraryRule.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      {
        new: true,
        runValidators: true
      }
    );

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete library rule
// @route   DELETE /api/rules/:id
// @access  Private/Admin
exports.deleteRule = async (req, res, next) => {
  try {
    const rule = await LibraryRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    await rule.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search library rules
// @route   GET /api/rules/search
// @access  Public
exports.searchRules = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search keyword'
      });
    }

    const rules = await LibraryRule.find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ]
    });

    res.status(200).json({
      success: true,
      count: rules.length,
      data: rules
    });
  } catch (error) {
    next(error);
  }
};