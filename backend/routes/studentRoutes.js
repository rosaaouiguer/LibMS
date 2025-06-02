// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware'); 

// Handle file uploads
const multer = require('multer');

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/students');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop();
    cb(null, `student-${uniqueSuffix}.${extension}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept only images
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  },
  fileFilter: fileFilter
});

// Middleware to handle image upload
const handleImageUpload = upload.single('image');

// Handle image upload in create/update routes
const processImageUpload = (req, res, next) => {
  handleImageUpload(req, res, function(err) {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    
    // Add image path to req.body if image uploaded
    if (req.file) {
      req.body.image = `/uploads/students/${req.file.filename}`;
    }
    
    next();
  });
};

// Current student route - IMPORTANT: place this before the /:id route!
router.get('/me', protect, studentController.getCurrentStudent);

// Routes
router.route('/')
  .get(studentController.getAllStudents)
  .post(processImageUpload, studentController.createStudent);

router.route('/search')
  .get(studentController.searchStudents);

router.route('/:id')
  .get(studentController.getStudent)
  .put(processImageUpload, studentController.updateStudent)
  .delete(studentController.deleteStudent);

router.route('/bulk-update-category')
  .post(studentController.bulkUpdateCategory);

router.put('/change-password/:id', protect, studentController.changePassword);

module.exports = router;