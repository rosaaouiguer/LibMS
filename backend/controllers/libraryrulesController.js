const LibraryRule = require('../models/libraryrules');

// Create a new rule
exports.createRule = async (req, res) => {
  try {
    const rule = await LibraryRule.create(req.body);
    res.status(201).json(rule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all rules
exports.getAllRules = async (req, res) => {
  try {
    const rules = await LibraryRule.find();
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one rule
exports.getRuleById = async (req, res) => {
  try {
    const rule = await LibraryRule.findById(req.params.id);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a rule
exports.updateRule = async (req, res) => {
  try {
    const rule = await LibraryRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    res.json(rule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a rule
exports.deleteRule = async (req, res) => {
  try {
    const rule = await LibraryRule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
