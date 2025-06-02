// routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getRoles, 
  getRole, 
  createRole, 
  updateRole, 
  deleteRole, 
  updatePermissions 
} = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);
router.use(authorize('Admin')); // Only admins can manage roles

router.route('/')
  .get(getRoles)
  .post(createRole);

router.route('/:id')
  .get(getRole)
  .put(updateRole)
  .delete(deleteRole);

router.put('/:id/permissions', updatePermissions);

module.exports = router;