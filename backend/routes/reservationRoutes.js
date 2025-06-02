const express = require('express');
const router = express.Router();
const {
  getReservations,
  getMyReservations,
  getReservation,
  createReservation,
  updateReservationStatus,
  cancelReservation,
  getReservationsByBook,
  checkoutReservation,
  getReservationsByStudent,
  extendReservation,
  deleteReservation
} = require('../controllers/reservationController');

// Get all reservations
router.get('/', getReservations);


// Get reservations for a specific book
router.get('/book/:bookId', getReservationsByBook);

// Get reservations for a specific student
router.get('/student/:studentId', getReservationsByStudent);


// Create a new reservation
router.post('/', createReservation);

// Get a specific reservation
router.get('/:id', getReservation);

router.get('/student/:studentId', getMyReservations);


// Update reservation status
router.put('/:id/status', updateReservationStatus);

// Cancel a reservation
router.put('/:id/cancel', cancelReservation);

// Check out a reserved book
router.delete('/:id/checkout', checkoutReservation);

// Extend a reservation deadline
router.put('/:id/extend',  extendReservation);

router.delete("/:id", deleteReservation);

module.exports = router;
