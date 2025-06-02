const HelpSection = require('../models/helpCenter');

// Get all help sections with their items
exports.getAllSections = async (req, res) => {
  try {
    const sections = await HelpSection.find();
    res.status(200).json({
      success: true,
      count: sections.length,
      data: sections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get a specific help section by ID
exports.getSectionById = async (req, res) => {
  try {
    const section = await HelpSection.findOne({ id: req.params.id });
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Help section not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create a new help section
exports.createSection = async (req, res) => {
  try {
    const section = await HelpSection.create(req.body);
    res.status(201).json({
      success: true,
      data: section
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A section with this ID already exists'
      });
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update a help section
exports.updateSection = async (req, res) => {
  try {
    const section = await HelpSection.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Help section not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: section
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete a help section
exports.deleteSection = async (req, res) => {
  try {
    const section = await HelpSection.findOneAndDelete({ id: req.params.id });
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Help section not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get a specific help item within a section
exports.getHelpItem = async (req, res) => {
  try {
    const section = await HelpSection.findOne({ id: req.params.sectionId });
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Help section not found'
      });
    }
    
    const item = section.items.find(item => item.id === req.params.itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Help item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add a help item to a section
exports.addHelpItem = async (req, res) => {
  try {
    const section = await HelpSection.findOne({ id: req.params.sectionId });
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Help section not found'
      });
    }
    
    // Check if item with the same ID already exists
    if (section.items.some(item => item.id === req.body.id)) {
      return res.status(400).json({
        success: false,
        error: 'An item with this ID already exists in the section'
      });
    }
    
    section.items.push(req.body);
    await section.save();
    
    res.status(200).json({
      success: true,
      data: section
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update a help item in a section
exports.updateHelpItem = async (req, res) => {
  try {
    const section = await HelpSection.findOne({ id: req.params.sectionId });
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Help section not found'
      });
    }
    
    const itemIndex = section.items.findIndex(item => item.id === req.params.itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Help item not found'
      });
    }
    
    section.items[itemIndex] = {
      ...section.items[itemIndex].toObject(),
      ...req.body
    };
    
    await section.save();
    
    res.status(200).json({
      success: true,
      data: section.items[itemIndex]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete a help item from a section
exports.deleteHelpItem = async (req, res) => {
  try {
    const section = await HelpSection.findOne({ id: req.params.sectionId });
    
    if (!section) {
      return res.status(404).json({
        success: false,
        error: 'Help section not found'
      });
    }
    
    const itemIndex = section.items.findIndex(item => item.id === req.params.itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Help item not found'
      });
    }
    
    section.items.splice(itemIndex, 1);
    await section.save();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};