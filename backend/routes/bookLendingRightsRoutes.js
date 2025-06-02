// routes/bookLendingRightsRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllBookLendingRights,
  getBookLendingRights,
  getLendingRightsByBookId,
  createBookLendingRights,
  updateBookLendingRights,
  deleteBookLendingRights
} = require('../controllers/bookLendingRightsController');

// Routes for /api/book-lending-rights
router.route('/')
  .get(getAllBookLendingRights)
  .post(createBookLendingRights);

router.route('/:id')
  .get(getBookLendingRights)
  .put(updateBookLendingRights)
  .delete(deleteBookLendingRights);

// Special route to get lending rights by book ID
router.route('/book/:bookId')
  .get(getLendingRightsByBookId);

module.exports = router;