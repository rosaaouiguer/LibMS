const express = require('express');
const router = express.Router();
const {
  borrowBook,
  returnBook,
  getAllBorrowings,
  getStudentBorrowings,
  getBookBorrowings,
  updateBorrowingStatus,
  updateBorrowing,
  deleteBorrowing
} = require('../controllers/borrowingController');

// Basic routes
router.route('/')
  .post(borrowBook)
  .get(getAllBorrowings);

// Student borrowings route
router.get('/student/:studentId', getStudentBorrowings);

// Book borrowings route
router.get('/book/:bookId', getBookBorrowings);

// Status update route
router.get('/update-status', updateBorrowingStatus);

// Book return route
router.put('/:id/return', returnBook);

// Add this new route for updating borrowings (for renewals)
router.put('/:id', updateBorrowing);

router.delete('/:id', deleteBorrowing);


module.exports = router;