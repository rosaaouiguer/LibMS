const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  addBookCopy,
  getBookCopies,
  updateBookCopy,
} = require('../controllers/bookController.js');

// Public routes (no authentication)
router.route('/')
  .get(getBooks)       // GET /api/books
  .post(createBook);   // POST /api/books

router.route('/:id')
  .get(getBook)        // GET /api/books/:id
  .put(updateBook)     // PUT /api/books/:id
  .delete(deleteBook); // DELETE /api/books/:id


module.exports = router;