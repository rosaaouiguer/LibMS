const Borrowing = require('../models/Borrowing');
const Book = require('../models/Book');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const BookLendingRights = require('../models/BookLendingRights');
const Reservation = require('../models/Reservation');

// @desc    Borrow a book
// @route   POST /api/borrowings
// @access  Private
exports.borrowBook = async (req, res, next) => {
  try {
    const { bookId, studentId, lendingCondition, dueDate } = req.body;

    // Check if book exists and has available copies
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No available copies of this book'
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
    
    if (student.banned) {
      return res.status(403).json({
        success: false,
        message: 'This student is currently banned from borrowing books'
      });
    }

    // Check if student has any overdue books
    const overdueBooks = await Borrowing.find({
      studentId,
      status: 'Overdue'
    });

    if (overdueBooks.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Student has overdue books. Please return them before borrowing new ones.'
      });
    }

    // Determine loan duration based on book-specific rights or student category
    let calculatedDueDate;
    if (!dueDate) {
      // Check book-specific lending rights first
      const bookLendingRights = await BookLendingRights.findOne({ bookId });
      
      let loanDuration = 14; // Default
      if (bookLendingRights) {
        loanDuration = bookLendingRights.loanDuration;
      } else if (student.category) {
        // Get student category lending rights
        const StudentCategory = require('../models/StudentCategory');
        const category = await StudentCategory.findById(student.category);
        if (category) {
          loanDuration = category.loanDuration;
        }
      }
      
      calculatedDueDate = new Date();
      calculatedDueDate.setDate(calculatedDueDate.getDate() + loanDuration);
    } else {
      calculatedDueDate = new Date(dueDate);
    }

    // Create borrowing record
    const borrowing = await Borrowing.create({
      bookId,
      studentId,
      borrowingDate: new Date(),
      dueDate: calculatedDueDate,
      lendingCondition,
      status: 'Borrowed'
    });

    // Update book available copies
    book.availableCopies -= 1;
    await book.save();

    // Create a notification
    try {
      await Notification.create({
        student: studentId,
        message: `You have borrowed "${book.title}" that is due on ${calculatedDueDate.toLocaleDateString()}`,
        type: 'Due Date Reminders',
        read: false
      });
    } catch (notificationError) {
      console.log('Notification creation failed:', notificationError.message);
    }

    res.status(201).json({
      success: true,
      data: borrowing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Return a book
// @route   PUT /api/borrowings/:id/return
// @access  Private
exports.returnBook = async (req, res, next) => {
  try {
    const { returnCondition } = req.body;
    const borrowingId = req.params.id;

    // Find the borrowing record
    const borrowing = await Borrowing.findById(borrowingId);
    if (!borrowing) {
      return res.status(404).json({
        success: false,
        message: 'Borrowing record not found'
      });
    }

    // Check if already returned
    if (borrowing.status === 'Returned') {
      return res.status(400).json({
        success: false,
        message: 'This book has already been returned'
      });
    }

    // Update borrowing record
    borrowing.returnDate = new Date();
    borrowing.status = 'Returned';
    borrowing.returnCondition = returnCondition;
    await borrowing.save();

    // Update book available copies
    const book = await Book.findById(borrowing.bookId);
    if (book) {
      book.availableCopies += 1;
      await book.save();
      
    }


    res.status(200).json({
      success: true,
      data: borrowing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all borrowings
// @route   GET /api/borrowings
// @access  Private/Admin
exports.getAllBorrowings = async (req, res, next) => {
  try {
    const borrowings = await Borrowing.find()
      .populate({
        path: 'studentId',
        select: 'name studentId email',
        populate: {
          path: 'category',
          model: 'StudentCategory'
        }
      })
      .populate({
        path: 'bookId', 
        select: 'title author isbn imageURL'
      });

    // For each borrowing, try to get book-specific lending rights
    const enrichedBorrowings = await Promise.all(borrowings.map(async (borrowing) => {
      const bookLendingRights = await BookLendingRights.findOne({ bookId: borrowing.bookId._id });
      
      // Convert to plain object to add our custom field
      const borrowingObj = borrowing.toObject();
      borrowingObj.bookLendingRights = bookLendingRights;
      
      return borrowingObj;
    }));

    res.status(200).json({
      success: true,
      count: enrichedBorrowings.length,
      data: enrichedBorrowings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's borrowings
// @route   GET /api/borrowings/student/:studentId
// @access  Private
exports.getStudentBorrowings = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    const borrowings = await Borrowing.find({ studentId })
      .populate('bookId', 'title author isbn imageURL');

    res.status(200).json({
      success: true,
      count: borrowings.length,
      data: borrowings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get book's borrowing history
// @route   GET /api/borrowings/book/:bookId
// @access  Private/Admin
exports.getBookBorrowings = async (req, res, next) => {
  try {
    const bookId = req.params.bookId;

    const borrowings = await Borrowing.find({ bookId })
      .populate('studentId', 'name studentId email');

    res.status(200).json({
      success: true,
      count: borrowings.length,
      data: borrowings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update borrowing status check (could be run by a cron job)
// @route   GET /api/borrowings/update-status
// @access  Private/Admin
exports.updateBorrowingStatus = async (req, res, next) => {
  try {
    const borrowings = await Borrowing.find({ 
      status: 'Borrowed',
      dueDate: { $lt: new Date() }
    }).populate('bookId studentId');

    let updatedCount = 0;
    let bannedCount = 0;
    
    for (const borrowing of borrowings) {
      borrowing.status = 'Overdue';
      await borrowing.save();
      updatedCount++;
      
      // Ban the student for 15 days
      const student = borrowing.studentId;
      if (student && !student.banned) {
        const banEndDate = new Date();
        banEndDate.setDate(banEndDate.getDate() + 15);
        
        student.banned = true;
        student.bannedUntil = banEndDate;
        await student.save();
        bannedCount++;
        
        // Cancel all reservations for this student
        await cancelStudentReservations(student._id);
      }
      
      // Create overdue notification
      try {
        const bookTitle = borrowing.bookId ? borrowing.bookId.title : 'a book';
        
        await Notification.create({
          student: borrowing.studentId._id,
          message: `Your book "${bookTitle}" is now overdue. Please return it as soon as possible. Your borrowing privileges have been suspended for 15 days.`,
          type: 'Overdue Alerts',
          read: false
        });
      } catch (notificationError) {
        console.log('Notification creation failed:', notificationError.message);
      }
    }

    res.status(200).json({
      success: true,
      updatedCount,
      bannedCount,
      message: `${updatedCount} borrowings marked as overdue and ${bannedCount} students banned`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a borrowing record (for renewals)
// @route   PUT /api/borrowings/:id
// @access  Private
exports.updateBorrowing = async (req, res, next) => {
  try {
    const borrowingId = req.params.id;
    const { dueDate, status } = req.body;

    // Find the borrowing record
    const borrowing = await Borrowing.findById(borrowingId);
    if (!borrowing) {
      return res.status(404).json({
        success: false,
        message: 'Borrowing record not found'
      });
    }

    // Update borrowing record
    if (dueDate) borrowing.dueDate = new Date(dueDate);
    if (status) borrowing.status = status;
    
    await borrowing.save();

    // Create a notification if the model exists
    try {
      const book = await Book.findById(borrowing.bookId);
      const bookTitle = book ? book.title : 'your book';
      
      await Notification.create({
        student: borrowing.studentId,
        message: `Your borrowing of "${bookTitle}" has been updated. New due date: ${new Date(dueDate).toLocaleDateString()}`,
        type: 'Due Date Reminders',
        read: false
      });
    } catch (notificationError) {
      console.log('Notification creation failed:', notificationError.message);
    }

    res.status(200).json({
      success: true,
      data: borrowing
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a borrowing record
// @route   DELETE /api/borrowings/:id
// @access  Private/Admin
exports.deleteBorrowing = async (req, res, next) => {
  try {
    const borrowingId = req.params.id;

    // Find the borrowing record
    const borrowing = await Borrowing.findById(borrowingId);
    if (!borrowing) {
      return res.status(404).json({
        success: false,
        message: 'Borrowing record not found'
      });
    }

    // If the borrowing status is 'Borrowed' or 'Overdue', we need to increment the book's available copies
    if (borrowing.status === 'Borrowed' || borrowing.status === 'Overdue') {
      const book = await Book.findById(borrowing.bookId);
      if (book) {
        book.availableCopies += 1;
        await book.save();
        
      }
    }

    // Delete the borrowing record
    await Borrowing.findByIdAndDelete(borrowingId);


    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
