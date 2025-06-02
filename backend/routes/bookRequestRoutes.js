// routes/bookRequestRoutes.js
const express = require('express');
const router = express.Router();
const bookRequestController = require('../controllers/bookRequestController');

// Routes
router.route('/')
  .get(bookRequestController.getAllBookRequests)
  .post(bookRequestController.createBookRequest);

router.route('/:id')
  .get(bookRequestController.getBookRequest)
  .put(bookRequestController.updateBookRequest)
  .delete(bookRequestController.deleteBookRequest);

router.route('/student/:studentId')
  .get(bookRequestController.getBookRequestsByStudent);

router.route('/status/:status')
  .get(bookRequestController.getBookRequestsByStatus);

module.exports = router;