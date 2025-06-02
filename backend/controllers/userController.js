const User = require('../models/Users');
const Borrowing = require('../models/Borrowing');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate('roleId');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('roleId');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    // Create user
    const user = await User.create(req.body);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    // Don't allow password updates through this endpoint
    if (req.body.password) {
      delete req.body.password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('roleId');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has any active borrowings
    const activeBorrowings = await Borrowing.find({
      userId: user._id,
      status: { $in: ['Borrowed', 'Overdue'] }
    });

    if (activeBorrowings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active borrowings'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ban user
// @route   PUT /api/users/:id/ban
// @access  Private/Admin
exports.banUser = async (req, res, next) => {
  try {
    const { banDuration } = req.body; // Duration in days
    
    if (!banDuration || isNaN(Number(banDuration))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid ban duration in days'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate ban end date
    const bannedUntil = new Date();
    bannedUntil.setDate(bannedUntil.getDate() + Number(banDuration));

    user.bannedUntil = bannedUntil;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: `User banned until ${bannedUntil.toISOString()}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unban user
// @route   PUT /api/users/:id/unban
// @access  Private/Admin
exports.unbanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.bannedUntil = null;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: 'User has been unbanned'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.changeUserRole = async (req, res, next) => {
  try {
    const { roleId } = req.body;
    
    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a role ID'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { roleId },
      { new: true, runValidators: true }
    ).populate('roleId');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (for logged in user)
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    // Fields that users can update
    const fieldsToUpdate = {
      name: req.body.name,
      dateOfBirth: req.body.dateOfBirth,
      phoneNumber: req.body.phoneNumber
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password (for logged in user)
// @route   PUT /api/users/changepassword
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Middleware for checking if user is banned
exports.checkBanned = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.isBanned()) {
      return res.status(403).json({
        success: false,
        message: `Your account is banned until ${user.bannedUntil.toISOString()}`
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};