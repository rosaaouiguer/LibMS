const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const Student = require('../models/Student');
const Borrowing = require('../models/Borrowing');
const Notification = require('../models/Notification');
const BookLendingRights = require('../models/BookLendingRights');
const StudentCategory = require('../models/StudentCategory');
exports.getReservationsByBook = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({
      bookId: req.params.bookId,
      status: { $in: ['Held', 'Awaiting Pickup'] }
    })
    .sort({ reservationDate: 1 }) // Sort by reservation date (FCFS)
    .populate('studentId', 'name studentId email');

    // Process reservations to include current borrower info for 'Held' status
    const enhancedReservations = await Promise.all(
      reservations.map(async (reservation) => {
        const reservationObj = reservation.toObject();
        
        if (reservationObj.status === 'Held') {
          const currentBorrowing = await Borrowing.findOne({
            bookId: reservationObj.bookId,
            status: { $in: ['Borrowed', 'Overdue'] }
          })
          .sort({ dueDate: 1 })
          .populate('studentId', 'name studentId');
          
          if (currentBorrowing) {
            reservationObj.currentBorrower = {
              name: currentBorrowing.studentId.name,
              studentId: currentBorrowing.studentId.studentId,
              dueDate: currentBorrowing.dueDate
            };
          }
        }
        
        return reservationObj;
      })
    );

    res.status(200).json({
      success: true,
      count: enhancedReservations.length,
      data: enhancedReservations
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyReservations = async (req, res, next) => {
  try {
    // This will need to be updated based on your app's authentication
    // For now we'll assume the student ID is passed in the request
    const studentId = req.user?.studentId;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }
    
    const reservations = await Reservation.find({ studentId })
      .populate('bookId', 'title author isbn imageURL');

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Public
exports.getReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find()
      .populate('studentId', 'name studentId email category')
      .populate({
        path: 'studentId',
        populate: {
          path: 'category',
          model: 'StudentCategory'
        }
      })
      .populate('bookId', 'title author isbn');

    // Process reservations to include current borrower info for 'Held' status
    const enhancedReservations = await Promise.all(
      reservations.map(async (reservation) => {
        // Convert Mongoose document to a plain JavaScript object
        const reservationObj = reservation.toObject();
        
        // Only fetch current borrower for 'Held' status
        if (reservationObj.status === 'Held') {
          // Find the current borrower (with closest due date)
          const currentBorrowing = await Borrowing.findOne({
            bookId: reservationObj.bookId._id.toString(),
            status: { $in: ['Borrowed', 'Overdue'] }
          })
          .sort({ dueDate: 1 }) // Sort by due date (ascending)
          .populate('studentId', 'name studentId');
          
          // Add current borrower info if exists
          if (currentBorrowing) {
            reservationObj.currentBorrower = {
              name: currentBorrowing.studentId.name,
              studentId: currentBorrowing.studentId.studentId,
              dueDate: currentBorrowing.dueDate
            };
          }
        }
        
        return reservationObj;
      })
    );

    res.status(200).json({
      success: true,
      count: enhancedReservations.length,
      data: enhancedReservations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single reservation
// @route   GET /api/reservations/:id
// @access  Public
exports.getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('studentId', 'name studentId email')
      .populate('bookId', 'title author isbn imageURL');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Convert to plain object
    const reservationObj = reservation.toObject();
    
    // Only fetch current borrower for 'Held' status
    if (reservationObj.status === 'Held') {
      // Find the current borrower (with closest due date)
      const currentBorrowing = await Borrowing.findOne({
        bookId: reservationObj.bookId._id,
        status: { $in: ['Borrowed', 'Overdue'] }
      })
      .sort({ dueDate: 1 }) // Sort by due date (ascending)
      .populate('studentId', 'name studentId');
      
      // Add current borrower info if exists
      if (currentBorrowing) {
        reservationObj.currentBorrower = {
          name: currentBorrowing.studentId.name,
          studentId: currentBorrowing.studentId.studentId,
          dueDate: currentBorrowing.dueDate
        };
      }
    }

    res.status(200).json({
      success: true,
      data: reservationObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new reservation
// @route   POST /api/reservations
// @access  Public
exports.createReservation = async (req, res, next) => {
  try {
    const { bookId, studentId, daysUntilExpiry } = req.body;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if student is banned
    if (student.banned) {
      return res.status(403).json({
        success: false,
        message: 'This student is currently banned from library services'
      });
    }

    // Check if student already has a reservation for this book
    const existingReservation = await Reservation.findOne({
      studentId,
      bookId,
      status: { $in: ['Held', 'Awaiting Pickup'] }
    });

    if (existingReservation) {
      return res.status(400).json({
        success: false,
        message: 'This student already has an active reservation for this book'
      });
    }
    const existingBorrowing = await Borrowing.findOne({
      studentId,
      bookId,
      status: { $in: ['Borrowed', 'Overdue'] }
    });

    if (existingBorrowing) {
      return res.status(400).json({
        success: false,
        message: 'This book is currently borrowed by the student'
      });
    }
    // Check student borrowing limit
    const studentWithCategory = await Student.findById(studentId).populate('category');
    if (!studentWithCategory || !studentWithCategory.category) {
      return res.status(400).json({
        success: false,
        message: 'Student category not found'
      });
    }

    const borrowingLimit = studentWithCategory.category.borrowingLimit;
    
    // Count active borrowings
    const activeBorrowings = await Borrowing.countDocuments({
      studentId,
      status: { $in: ['Borrowed', 'Overdue'] }
    });

    // Determine initial status based on book availability and borrowing limit
    let initialStatus = 'Held';
    if (book.availableCopies > 0) {
      if (activeBorrowings < borrowingLimit) {
        initialStatus = 'Awaiting Pickup';
      } else {
        // Student is at borrowing limit, will still hold reservation but add a note
        initialStatus = 'Held';
      }
    }

    const reservation = new Reservation({
      bookId,
      studentId,
      status: initialStatus,
      daysUntilExpiry: parseInt(daysUntilExpiry, 10)
    });

    // If book is available and student is under limit, set the availableDate
    if (initialStatus === 'Awaiting Pickup') {
      reservation.availableDate = new Date();
      
      // Calculate pickup deadline
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + parseInt(daysUntilExpiry, 10));
      reservation.pickupDeadline = deadline;
      
      // Reduce available copies by 1
      if (book.availableCopies > 0) {
        book.availableCopies -= 1;
        await book.save();
      }
      
      
    }

    // Save the reservation
    await reservation.save();

    // Return the complete reservation with populated fields
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('studentId', 'name studentId email')
      .populate('bookId', 'title author isbn');

    res.status(201).json({
      success: true,
      message: `Reservation ${initialStatus === 'Awaiting Pickup' ? 'created and ready for pickup' : 'added to waitlist'}`,
      data: populatedReservation
    });
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This student already has an active reservation for this book'
      });
    }
    next(error);
  }
};

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Public
exports.updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['Held', 'Awaiting Pickup', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (Held, Awaiting Pickup, or Cancelled)'
      });
    }

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if the status is actually changing
    if (reservation.status === status) {
      return res.status(400).json({
        success: false,
        message: `Reservation is already in '${status}' status`
      });
    }

    // Handle book availability if changing to/from Awaiting Pickup
    if (status === 'Awaiting Pickup' && reservation.status !== 'Awaiting Pickup') {
      // Changing to Awaiting Pickup - reduce available copies
      const book = await Book.findById(reservation.bookId);
      
      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Associated book not found'
        });
      }
      
      if (book.availableCopies <= 0) {
        return res.status(400).json({
          success: false,
          message: 'No copies available to reserve for pickup'
        });
      }
      
      // Check if student is at borrowing limit
      const student = await Student.findById(reservation.studentId).populate('category');
      if (!student || !student.category) {
        return res.status(400).json({
          success: false,
          message: 'Student or category not found'
        });
      }
      
      const borrowingLimit = student.category.borrowingLimit;
      const activeBorrowings = await Borrowing.countDocuments({
        studentId: reservation.studentId,
        status: { $in: ['Borrowed', 'Overdue'] }
      });
      
      if (activeBorrowings >= borrowingLimit) {
        return res.status(400).json({
          success: false,
          message: 'Student has reached their borrowing limit'
        });
      }
      
      // Reduce available copies
      book.availableCopies -= 1;
      await book.save();
      
      // Set availableDate and pickupDeadline
      reservation.availableDate = new Date();
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + reservation.daysUntilExpiry);
      reservation.pickupDeadline = deadline;
      
      // Create notification
      await Notification.create({
        student: reservation.studentId,
        message: `Your reservation for "${book.title}" is now ready for pickup. Please collect it before ${deadline.toLocaleDateString()}.`,
        category: 'Due Date Reminders',
        read: false
      });
    } 
    else if (reservation.status === 'Awaiting Pickup' && status !== 'Awaiting Pickup') {
      // Changing from Awaiting Pickup - increase available copies
      const book = await Book.findById(reservation.bookId);
      
      if (book) {
        book.availableCopies += 1;
        await book.save();
        
        // If changing to Cancelled, check if there are other held reservations
        if (status === 'Cancelled') {
          await processNextReservation(book._id);
        }
      }
    }

    // Update reservation status
    reservation.status = status;
    await reservation.save();

    // Return updated reservation
    const updatedReservation = await Reservation.findById(req.params.id)
      .populate('studentId', 'name studentId email')
      .populate('bookId', 'title author isbn');

    res.status(200).json({
      success: true,
      message: `Reservation status updated to '${status}'`,
      data: updatedReservation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel reservation
// @route   PUT /api/reservations/:id/cancel
// @access  Public

exports.cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // If the reservation was in Awaiting Pickup status, release the book
    if (reservation.status === 'Awaiting Pickup') {
      const book = await Book.findById(reservation.bookId);
      if (book) {
        book.availableCopies += 1;
        await book.save();
        
        // Create notification
        await Notification.create({
          student: reservation.studentId,
          message: `Your reservation for "${book.title || 'a book'}" has been cancelled.`,
          category: 'Other',
          read: false,
          createdAt: new Date()
        });
        
        // REMOVED: await processNextReservation(book._id);
        // The database trigger will automatically process the next reservation
        // when availableCopies is incremented
      }
    }

    // Update reservation status to Cancelled
    reservation.status = 'Cancelled';
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check out a reserved book
// @route   DELETE /api/reservations/:id/checkout
// @access  Public
exports.checkoutReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('bookId')
      .populate({
        path: 'studentId',
        populate: {
          path: 'category',
          model: 'StudentCategory'
        }
      });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    if (reservation.status !== 'Awaiting Pickup') {
      return res.status(400).json({
        success: false,
        message: `Cannot checkout a reservation with status: ${reservation.status}`
      });
    }
    
    // Check if student is banned
    if (reservation.studentId.banned) {
      return res.status(403).json({
        success: false,
        message: 'This student is currently banned from borrowing books'
      });
    }

    // Check if student has any overdue books
    const overdueBooks = await Borrowing.find({
      studentId: reservation.studentId._id,
      status: 'Overdue'
    });

    if (overdueBooks.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Student has overdue books. Please return them before borrowing new ones.'
      });
    }

    // Get lending rights (first check book-specific, then fall back to student category)
    let loanDuration;
    let loanExtensionAllowed;
    let extensionLimit;
    let extensionDuration;
    
    // Check book-specific lending rights first
    const bookLendingRights = await BookLendingRights.findOne({ bookId: reservation.bookId._id });
    
    if (bookLendingRights) {
      loanDuration = bookLendingRights.loanDuration;
      loanExtensionAllowed = bookLendingRights.loanExtensionAllowed;
      extensionLimit = bookLendingRights.extensionLimit;
      extensionDuration = bookLendingRights.extensionDuration;
    } else if (reservation.studentId.category) {
      // Fall back to student category lending rights
      loanDuration = reservation.studentId.category.loanDuration;
      loanExtensionAllowed = reservation.studentId.category.loanExtensionAllowed;
      extensionLimit = reservation.studentId.category.extensionLimit;
      extensionDuration = reservation.studentId.category.extensionDuration;
    } else {
      // Default values if no rights found
      loanDuration = 14;
      loanExtensionAllowed = true;
      extensionLimit = 1;
      extensionDuration = 7;
    }
    
    // Calculate due date based on loan duration
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanDuration);
    
    // Create borrowing record
    const borrowing = await Borrowing.create({
      bookId: reservation.bookId._id,
      studentId: reservation.studentId._id,
      borrowingDate: new Date(),
      dueDate: dueDate,
      lendingCondition:  req.body.lendingCondition || 'Good',
      status: 'Borrowed'
    });

    // Store reservation details for response
    const reservationDetails = {
      _id: reservation._id,
      bookId: reservation.bookId,
      studentId: reservation.studentId,
      status: reservation.status,
      reservationDate: reservation.reservationDate
    };

    // Delete the reservation
    await Reservation.findByIdAndDelete(reservation._id);
    
    // Create a notification for the student
    await Notification.create({
      student: reservation.studentId._id,
      message: `You have borrowed "${reservation.bookId.title}" due on ${dueDate.toLocaleDateString()}.`,
      category: 'Due Date Reminders',
      read: false
    });

    // Return success with reservation details and new borrowing
    res.status(200).json({
      success: true,
      message: 'Book checked out successfully',
      data: {
        reservation: reservationDetails,
        borrowing: borrowing
      }
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get reservations by student
// @route   GET /api/reservations/student/:studentId
// @access  Public
exports.getReservationsByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    
    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get all active reservations for the student
    const reservations = await Reservation.find({
      studentId,
      status: { $in: ['Held', 'Awaiting Pickup'] }
    }).populate('bookId', 'title author isbn imageURL');
    
    // Process reservations to include current borrower info for 'Held' status
    const enhancedReservations = await Promise.all(
      reservations.map(async (reservation) => {
        const reservationObj = reservation.toObject();
        
        if (reservationObj.status === 'Held') {
          const currentBorrowing = await Borrowing.findOne({
            bookId: reservationObj.bookId._id,
            status: { $in: ['Borrowed', 'Overdue'] }
          })
          .sort({ dueDate: 1 })
          .populate('studentId', 'name studentId');
          
          if (currentBorrowing) {
            reservationObj.currentBorrower = {
              name: currentBorrowing.studentId.name,
              studentId: currentBorrowing.studentId.studentId,
              dueDate: currentBorrowing.dueDate
            };
          }
        }
        
        return reservationObj;
      })
    );
    
    res.status(200).json({
      success: true,
      count: enhancedReservations.length,
      data: enhancedReservations
    });
  } catch (error) {
    next(error);
  }
};
exports.extendReservation = async (req, res) => {
  try {
    const { additionalDays } = req.body;
    
    if (!additionalDays || additionalDays < 1) {
      return res.status(400).json({
        success: false,
        error: 'Additional days must be at least 1',
      });
    }
    
    // Find the reservation by ID
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found',
      });
    }
    
    // Add the additional days to daysUntilExpiry
    reservation.daysUntilExpiry += parseInt(additionalDays);
    
    // If the status is "Awaiting Pickup", also update the pickupDeadline
    if (reservation.status === "Awaiting Pickup" && reservation.pickupDeadline) {
      const newDeadline = new Date(reservation.pickupDeadline);
      newDeadline.setDate(newDeadline.getDate() + parseInt(additionalDays));
      reservation.pickupDeadline = newDeadline;
    }
    
    // Save the updated reservation
    await reservation.save();
    
    // Return the updated reservation
    return res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Server Error',
    });
  }
};
// Helper function to process the next reservation in queue
async function processNextReservation(bookId) {
  try {
    const nextHeldReservation = await Reservation.find({
      bookId: bookId,
      status: 'Held'
    }).sort({ reservationDate: 1 }).limit(1).populate('bookId');

    if (nextHeldReservation.length === 0) return null;

    const reservation = nextHeldReservation[0];

    const student = await Student.findById(reservation.studentId).populate('category');
    if (!student) return null;

    const borrowingLimit = student.category?.borrowingLimit ?? 0;

    const activeBorrowingsCount = await Borrowing.countDocuments({
      studentId: student._id,
      status: { $in: ['Borrowed', 'Overdue'] }
    });

    if (activeBorrowingsCount >= borrowingLimit) {
      await Reservation.updateOne(
        { _id: reservation._id },
        { $set: { status: 'Cancelled' } }
      );

      await Notification.create({
        student: student._id,
        message: `Your reservation for "${reservation.bookId.title || 'a book'}" has been cancelled because you've reached your borrowing limit.`,
        category: 'Other',
        read: false,
        createdAt: new Date()
      });

      return await processNextReservation(bookId);
    }

    if (student.banned) {
      await Reservation.updateOne(
        { _id: reservation._id },
        { $set: { status: 'Cancelled' } }
      );

      await Notification.create({
        student: student._id,
        message: `Your reservation for "${reservation.bookId.title || 'a book'}" has been cancelled because your account is currently banned.`,
        category: 'Other',
        read: false,
        createdAt: new Date()
      });

      return await processNextReservation(bookId);
    }

    const availableDate = new Date();
    const pickupDeadline = new Date();
    pickupDeadline.setDate(pickupDeadline.getDate() + (reservation.daysUntilExpiry ?? 3));

    await Reservation.updateOne(
      { _id: reservation._id },
      {
        $set: {
          status: 'Awaiting Pickup',
          availableDate: availableDate,
          pickupDeadline: pickupDeadline
        }
      }
    );

    await Book.updateOne(
      { _id: bookId },
      { $inc: { availableCopies: -1 } }
    );

    await Notification.create({
      student: student._id,
      message: `Your reservation for "${reservation.bookId.title || 'a book'}" is now ready for pickup. Please collect it before ${pickupDeadline.toLocaleDateString()}.`,
      category: 'Due Date Reminders',
      read: false,
      createdAt: new Date()
    });

    return reservation;
  } catch (error) {
    console.error('Error processing next reservation:', error);
    return null;
  }
}
// @desc    Delete a reservation
// @route   DELETE /api/reservations/:id
// @access  Public
exports.deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Simply delete the reservation without any additional processing
    await Reservation.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Reservation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};