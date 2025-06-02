import React, { useState, useEffect } from "react";
import { getAllBooks } from "../../services/bookApi";
import { getAllStudents } from "../../services/studentApi";
import { getLendingRightsByBookId } from "../../services/bookLendingRightsApi";
import { borrowBook, canStudentBorrow } from "../../services/borrowingApi";

const AddBorrowingModal = ({ isOpen, onClose }) => {
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [borrowingLimitInfo, setBorrowingLimitInfo] = useState(null);

  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    bookId: "",
    bookTitle: "",
    borrowDate: new Date().toISOString().split("T")[0], // Today
    dueDate: "", // Will be calculated based on lending rights or student category
    lendingCondition: "Good", // Add lending condition with default value
  });

  // Fetch books and students when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Fetch necessary data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch books and students in parallel
      const [booksData, studentsData] = await Promise.all([
        getAllBooks(), // Only get books with available copies
        getAllStudents(),
      ]);

      // Sort books and students alphabetically
      const sortedBooks = booksData.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
      const sortedStudents = studentsData.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setBooks(sortedBooks);
      setStudents(sortedStudents);

      // Reset form with default values
      setFormData({
        studentId: "",
        studentName: "",
        bookId: "",
        bookTitle: "",
        borrowDate: new Date().toISOString().split("T")[0],
        dueDate: "", // Will be set when a book and student are selected
        lendingCondition: "Good", // Reset with default value
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
      setLoading(false);
    }
  };

  // Calculate due date based on lending duration (in days)
  const calculateDueDate = (loanDuration) => {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + loanDuration);
    return dueDate.toISOString().split("T")[0];
  };
  const handleChange = async (e) => {
    const { name, value } = e.target;

    // Update the form field that changed
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Special handling for student selection
    if (name === "studentId") {
      const selectedStudent = students.find((s) => s._id === value);
      if (selectedStudent) {
        setFormData((prev) => ({
          ...prev,
          studentName: selectedStudent.name,
        }));

        // Clear any previous errors
        setError(null);
        setBorrowingLimitInfo(null);

        // Check if student is banned
        if (selectedStudent.banned) {
          setError("This student is currently banned and cannot borrow books.");
        }

        // Check if student has reached borrowing limit
        try {
          const borrowingCheck = await canStudentBorrow(value);
          setBorrowingLimitInfo(borrowingCheck.borrowingInfo);

          if (!borrowingCheck.canBorrow) {
            setError(
              `This student has reached their borrowing limit (${borrowingCheck.borrowingInfo.current}/${borrowingCheck.borrowingInfo.limit}).`
            );
          }
        } catch (err) {
          console.error("Error checking student borrowing limit:", err);
        }

        // If book is already selected, recalculate due date
        if (formData.bookId) {
          updateDueDate(formData.bookId, value);
        }
      }
    }

    // Special handling for book selection
    if (name === "bookId") {
      const selectedBook = books.find((b) => b._id === value);
      if (selectedBook) {
        setFormData((prev) => ({
          ...prev,
          bookTitle: selectedBook.title,
        }));

        // If student is already selected, calculate due date
        if (formData.studentId) {
          updateDueDate(value, formData.studentId);
        }
      }
    }
  };
  // Update due date based on book lending rights or student category
  const updateDueDate = async (bookId, studentId) => {
    try {
      // First try to get book lending rights
      const selectedBook = books.find((b) => b._id === bookId);
      const selectedStudent = students.find((s) => s._id === studentId);

      if (!selectedBook || !selectedStudent) return;

      // Default loan duration (14 days)
      let loanDuration = 14;

      try {
        // Try to get book-specific lending rights
        const rights = await getLendingRightsByBookId(bookId);
        if (rights && rights.loanDuration) {
          loanDuration = rights.loanDuration;
          console.log(`Using book rights duration: ${loanDuration} days`);
        }
        // If no book rights, try student category
        else if (
          selectedStudent.category &&
          selectedStudent.category.loanDuration
        ) {
          loanDuration = selectedStudent.category.loanDuration;
          console.log(`Using student category duration: ${loanDuration} days`);
        }
      } catch (err) {
        console.warn(
          "Error fetching lending rights, using default duration:",
          err
        );
      }

      // Calculate and set due date
      const dueDate = calculateDueDate(loanDuration);
      setFormData((prev) => ({
        ...prev,
        dueDate,
      }));
    } catch (err) {
      console.error("Error updating due date:", err);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bookId || !formData.studentId) {
      setError("Please select both a book and a student");
      return;
    }

    // Check if student is banned
    const selectedStudent = students.find((s) => s._id === formData.studentId);
    if (selectedStudent && selectedStudent.banned) {
      setError("This student is currently banned and cannot borrow books.");
      return;
    }

    // Check if book has available copies
    const selectedBook = books.find((b) => b._id === formData.bookId);
    if (selectedBook && selectedBook.availableCopies < 1) {
      setError("This book has no available copies.");
      return;
    }

    // Check if student can borrow more books
    try {
      const borrowingCheck = await canStudentBorrow(formData.studentId);
      if (!borrowingCheck.canBorrow) {
        setError(
          `This student has reached their borrowing limit (${borrowingCheck.borrowingInfo.current}/${borrowingCheck.borrowingInfo.limit}).`
        );
        return;
      }
    } catch (err) {
      console.error("Error checking borrowing limit:", err);
      setError("Failed to verify borrowing eligibility. Please try again.");
      return;
    }

    try {
      setLoading(true);

      // Create borrowing object with all required data
      const borrowingData = {
        studentId: formData.studentId,
        bookId: formData.bookId,
        borrowDate: formData.borrowDate,
        dueDate: formData.dueDate,
        lendingCondition: formData.lendingCondition,
      };

      // Make the API call to create the borrowing
      const newBorrowing = await borrowBook(borrowingData);

      // Close modal on success
      onClose();
    } catch (err) {
      console.error("Error creating borrowing:", err);
      setError(err.message || "Failed to create borrowing. Please try again.");
      setLoading(false);
    }
  };
  // Calculate days until due date for display
  const getDaysUntilDue = () => {
    if (!formData.dueDate) return "";

    const today = new Date();
    const due = new Date(formData.dueDate);
    const diffTime = Math.abs(due - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `(${diffDays} days)`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">New Borrowing</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md border border-red-300">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} {student.id ? `(${student.id})` : ""}
                      {student.banned ? " - BANNED" : ""}
                    </option>
                  ))}
                </select>
              </div>
              {borrowingLimitInfo && (
                <div
                  className={`mt-1 text-xs ${
                    borrowingLimitInfo.remaining > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  Borrowing: {borrowingLimitInfo.current}/
                  {borrowingLimitInfo.limit}
                  {borrowingLimitInfo.remaining > 0
                    ? ` (${borrowingLimitInfo.remaining} remaining)`
                    : " (limit reached)"}
                </div>
              )}
              {/* Book Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Book
                </label>
                <select
                  name="bookId"
                  value={formData.bookId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a book</option>
                  {books.map((book) => (
                    <option
                      key={book._id}
                      value={book._id}
                      disabled={book.availableCopies < 1}
                    >
                      {book.title} (
                      {book.availableCopies > 0
                        ? `${book.availableCopies} available`
                        : "unavailable"}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Borrow Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Borrow Date
                  </label>
                  <input
                    type="date"
                    name="borrowDate"
                    value={formData.borrowDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled // Always today
                    required
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min={formData.borrowDate}
                      required
                    />
                    {formData.dueDate && (
                      <div className="mt-1 text-xs text-gray-500">
                        {getDaysUntilDue()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Book Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Book Condition
                </label>
                <select
                  name="lendingCondition"
                  value={formData.lendingCondition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Perfect">Perfect</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>

            {/* Summary Card */}
            {formData.bookId && formData.studentId && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">
                  Lending Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Book:</span>{" "}
                    {formData.bookTitle}
                  </div>
                  <div>
                    <span className="text-gray-600">Student:</span>{" "}
                    {formData.studentName}
                  </div>
                  <div>
                    <span className="text-gray-600">From:</span>{" "}
                    {formData.borrowDate}
                  </div>
                  <div>
                    <span className="text-gray-600">Due:</span>{" "}
                    {formData.dueDate} {getDaysUntilDue()}
                  </div>
                  <div>
                    <span className="text-gray-600">Condition:</span>{" "}
                    {formData.lendingCondition}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                disabled={
                  !formData.bookId ||
                  !formData.studentId ||
                  !formData.dueDate ||
                  loading ||
                  (borrowingLimitInfo && borrowingLimitInfo.remaining <= 0)
                }
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddBorrowingModal;
