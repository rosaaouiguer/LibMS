// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser, 
  banUser, 
  unbanUser, 
  changeUserRole, 
  updateProfile, 
  changePassword,
  checkBanned
} = require('../controllers/userController');
const { protect, authorize, hasPermission } = require('../middleware/auth');

// Regular user routes - protected but accessible to any authenticated user
router.put('/profile', protect, checkBanned, updateProfile);
router.put('/changepassword', protect, checkBanned, changePassword);


// Protected routes with role-based access
router.route('/')
  .get(protect, authorize('Admin', 'Librarian'), getUsers)
  .post(protect, authorize('Admin'), createUser);

router.route('/:id')
  .get(protect, authorize('Admin', 'Librarian'), getUser)
  .put(protect, authorize('Admin'), updateUser)
  .delete(protect, authorize('Admin'), deleteUser);

router.put('/:id/ban', protect, authorize('Admin'), banUser);
router.put('/:id/unban', protect, authorize('Admin'), unbanUser);
router.put('/:id/role', protect, authorize('Admin'), changeUserRole);


module.exports = router;