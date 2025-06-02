// controllers/roleController.js
const Role = require('../models/Role');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/Admin
exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find();

    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single role
// @route   GET /api/roles/:id
// @access  Private/Admin
exports.getRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create role
// @route   POST /api/roles
// @access  Private/Admin
exports.createRole = async (req, res, next) => {
  try {
    const role = await Role.create(req.body);

    res.status(201).json({
      success: true,
      data: role
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private/Admin
exports.updateRole = async (req, res, next) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private/Admin
exports.deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Don't allow deletion of critical roles
    if (['Admin', 'Librarian', 'Student', 'User'].includes(role.roleName)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a core system role'
      });
    }

    await role.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update role permissions
// @route   PUT /api/roles/:id/permissions
// @access  Private/Admin
exports.updatePermissions = async (req, res, next) => {
  try {
    const { permissions } = req.body;
    
    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of permissions'
      });
    }

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { permissions },
      { new: true, runValidators: true }
    );

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    next(error);
  }
};