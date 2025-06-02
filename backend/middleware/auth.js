// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const Role = require('../models/Role');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  // Check if token exists in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id in token
    req.user = await User.findById(decoded.id);

    // Check if user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // Check if user is banned
    if (req.user.isBanned()) {
      return res.status(403).json({
        success: false,
        message: `Your account is banned until ${req.user.bannedUntil.toISOString()}`
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return async (req, res, next) => {
    // Make sure user has a role
    if (!req.user.roleId) {
      return res.status(403).json({
        success: false,
        message: 'User has no assigned role'
      });
    }

    try {
      // Get user's role
      const role = await Role.findById(req.user.roleId);
      
      if (!role) {
        return res.status(403).json({
          success: false,
          message: 'Role not found'
        });
      }

      // Check if user's role is in the list of allowed roles
      if (!roles.includes(role.roleName)) {
        return res.status(403).json({
          success: false,
          message: `User role '${role.roleName}' is not authorized to access this route`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error verifying role permissions'
      });
    }
  };
};

// Check if user has specific permissions
exports.hasPermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      // Get user's role
      const role = await Role.findById(req.user.roleId);
      
      if (!role) {
        return res.status(403).json({
          success: false,
          message: 'Role not found'
        });
      }

      // Check if user's role has all required permissions
      const hasAllPermissions = permissions.every(permission => 
        role.permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: 'You do not have the required permissions to access this resource'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error verifying permissions'
      });
    }
  };
};