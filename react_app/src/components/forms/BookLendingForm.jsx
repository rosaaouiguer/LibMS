import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStudents } from "../../services/studentApi";
import { getLendingRightsByBookId } from "../../services/bookLendingRightsApi";
import {
  borrowBook,
  getStudentBorrowings,
  canStudentBorrow,
} from "../../services/borrowingApi";
const BookLendingForm = ({ book, onSave, onCancel }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [bookLendingRights, setBookLendingRights] = useState(null);
  const [borrowingLimitError, setBorrowingLimitError] = useState(null);
  // Default book data if none provided
  const defaultBook = {
    _id: "", // Changed from id to _id to match MongoDB id format
    title: "Unknown Book",
    author: "Unknown Author",
    imageUrl: "/assets/book-cover.jpg",
    availableCopies: 0,
    totalCopies: 0,
  };

  // Use provided book or default
  const bookData = book || defaultBook;

  // Form state
  const [formData, setFormData] = useState({
    studentId: "",
    lendingDate: new Date().toISOString().split("T")[0], // Today
    dueDate: "", // Will be set after we determine the loan duration
    condition: "Good",
  });

  // Calculate due date based on lending rights or student category
  const calculateDueDate = (loanDuration) => {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + loanDuration);
    return dueDate.toISOString().split("T")[0];
  };

  // Fetch students data and book lending rights
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch students
        const studentsData = await getAllStudents();
        const sortedStudents = studentsData.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setStudents(sortedStudents);

        // Fetch book lending rights if book ID is available
        if (bookData && bookData._id) {
          try {
            const rights = await getLendingRightsByBookId(bookData._id);
            setBookLendingRights(rights);

            // Set due date based on book lending rights
            if (rights) {
              setFormData((prev) => ({
                ...prev,
                dueDate: calculateDueDate(rights.loanDuration),
              }));
            }
          } catch (err) {
            console.error("Error fetching book lending rights:", err);
            // Continue even if book lending rights fetch fails
          }
        }

        // Set default student if available
        if (sortedStudents.length > 0) {
          const defaultStudent = sortedStudents[0];
          setSelectedStudent(defaultStudent);
          setFormData((prev) => ({
            ...prev,
            studentId: defaultStudent._id,
          }));

          // If no book lending rights, use student category for due date
          if (!bookLendingRights && defaultStudent.category) {
            const loanDuration = defaultStudent.category.loanDuration || 14; // Default to 14 days if not specified
            setFormData((prev) => ({
              ...prev,
              dueDate: calculateDueDate(loanDuration),
            }));
          } else if (!bookLendingRights) {
            // No book rights or student category, default to 14 days
            setFormData((prev) => ({
              ...prev,
              dueDate: calculateDueDate(14),
            }));
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, [bookData._id]);
  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If we're changing the student, update selectedStudent and recalculate due date
    if (name === "studentId") {
      const student = students.find((s) => s._id === value);
      setSelectedStudent(student);
      setError(null); // Clear previous errors
      setBorrowingLimitError(null); // Clear borrowing limit error

      // Check if student is banned
      if (student && student.banned) {
        setError("This student is currently banned and cannot borrow books.");
      }

      // Check if student has reached borrowing limit
      if (student) {
        try {
          const borrowingCheck = await canStudentBorrow(value);
          if (!borrowingCheck.canBorrow) {
            setBorrowingLimitError(
              `This student has reached their borrowing limit (${borrowingCheck.borrowingInfo.current}/${borrowingCheck.borrowingInfo.limit}).`
            );
          }
        } catch (err) {
          console.error("Error checking student borrowing limit:", err);
        }
      }

      // Update due date based on book lending rights or student category
      if (bookLendingRights) {
        // Book lending rights take precedence
        setFormData((prev) => ({
          ...prev,
          dueDate: calculateDueDate(bookLendingRights.loanDuration),
        }));
      } else if (student && student.category) {
        // Use student category lending duration if no book rights
        const loanDuration = student.category.loanDuration || 14;
        setFormData((prev) => ({
          ...prev,
          dueDate: calculateDueDate(loanDuration),
        }));
      } else {
        // Default to 14 days if neither is available
        setFormData((prev) => ({
          ...prev,
          dueDate: calculateDueDate(14),
        }));
      }
    }
  };

  // Calculate days until due date for display
  const getDaysUntilDue = () => {
    const today = new Date();
    const due = new Date(formData.dueDate);
    const diffTime = Math.abs(due - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Reset form to default values after successful submission
  const resetForm = () => {
    // Determine default due date based on lending rights or first student's category
    let defaultDueDate;

    if (bookLendingRights) {
      defaultDueDate = calculateDueDate(bookLendingRights.loanDuration);
    } else if (students.length > 0 && students[0].category) {
      const loanDuration = students[0].category.loanDuration || 14;
      defaultDueDate = calculateDueDate(loanDuration);
    } else {
      defaultDueDate = calculateDueDate(14);
    }

    setFormData({
      studentId: students.length > 0 ? students[0]._id : "",
      lendingDate: new Date().toISOString().split("T")[0], // Today
      dueDate: defaultDueDate,
      condition: "Good",
    });

    // Reset selected student
    if (students.length > 0) {
      setSelectedStudent(students[0]);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    setSuccess(null); // Clear any previous success message
    setBorrowingLimitError(null); // Clear borrowing limit error

    // Check if student is banned before attempting to lend
    if (selectedStudent && selectedStudent.banned) {
      setError("This student is currently banned and cannot borrow books.");
      return;
    }

    try {
      // Find student from ID
      const student = students.find((s) => s._id === formData.studentId);

      if (!student) {
        setError("Selected student not found. Please try again.");
        return;
      }

      // Check if student can borrow more books
      const borrowingCheck = await canStudentBorrow(formData.studentId);
      if (!borrowingCheck.canBorrow) {
        setBorrowingLimitError(
          `This student has reached their borrowing limit (${borrowingCheck.borrowingInfo.current}/${borrowingCheck.borrowingInfo.limit}).`
        );
        return;
      }

      // Create lending data object
      const borrowingData = {
        bookId: bookData._id,
        studentId: formData.studentId,
        lendingCondition: formData.condition,
        dueDate: formData.dueDate,
      };

      console.log("Submitting borrowing data:", borrowingData);

      // Call the API to save the borrowing
      const result = await borrowBook(borrowingData);

      console.log("Borrowing result:", result);

      // Set success message
      setSuccess(`Book successfully lent to ${student.name}!`);

      // Call the save function with the data if provided
      if (onSave) {
        onSave(result);
      }

      // Reset form for next lending instead of navigating away
      resetForm();

      // Remove success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error("Error submitting borrowing form:", err);
      setError(err.message || "Failed to lend book. Please try again.");
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/books");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border text-blue-600" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <div className="px-4 sm:px-6 md:px-8 py-6">
        {/* Header with title and back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-blue-600">Lend Book</h1>
          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>

        {/* Error message if any */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        {borrowingLimitError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
            <p>{borrowingLimitError}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p>{success}</p>
          </div>
        )}
        {/* Main form card */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-6">
          {/* Book info section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start mb-8 pb-6 border-b border-gray-200">
            {/* Book image */}
            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
              <div className="w-32 h-44 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-center overflow-hidden shadow-md">
                <img
                  src={bookData.imageURL || "/assets/book-cover.jpg"}
                  alt={bookData.title}
                  className="max-w-full max-h-full object-cover"
                />
              </div>
            </div>

            {/* Book details */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {bookData.title}
              </h2>
              <p className="text-gray-600 italic mb-3">by {bookData.author}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Available: {bookData.availableCopies} / {bookData.totalCopies}
                </span>
                {bookLendingRights && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Custom Lending Rules
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                ISBN: {bookData.isbn || "N/A"}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student selection */}
              <div className="col-span-1">
                <label
                  htmlFor="studentId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Student:
                </label>
                <select
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.id})
                      {student.banned ? " - BANNED" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lending date */}
              <div className="col-span-1">
                <label
                  htmlFor="lendingDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Lending Date:
                </label>
                <input
                  type="date"
                  id="lendingDate"
                  name="lendingDate"
                  value={formData.lendingDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled // Can't change lending date - always today
                />
              </div>

              {/* Due date */}
              <div className="col-span-1">
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Due Date:
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    min={formData.lendingDate} // Can't be before lending date
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {getDaysUntilDue()} days from today
                    {bookLendingRights
                      ? " (based on book's custom rules)"
                      : selectedStudent?.category
                      ? ` (based on ${
                          selectedStudent.category.name || "student"
                        } category)`
                      : " (default)"}
                  </div>
                </div>
              </div>

              {/* Book condition */}
              <div className="col-span-1">
                <label
                  htmlFor="condition"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Copy Condition:
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Perfect">Perfect</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>

            {/* Lending summary */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">
                Lending Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Book:</span> {bookData.title}
                </div>
                <div>
                  <span className="text-gray-600">Student:</span>{" "}
                  {students.find((s) => s._id === formData.studentId)?.name ||
                    "Not selected"}
                  {formData.studentId &&
                    ` (${
                      students.find((s) => s._id === formData.studentId)?.id ||
                      ""
                    })`}
                </div>
                <div>
                  <span className="text-gray-600">From:</span>{" "}
                  {formData.lendingDate}
                </div>
                <div>
                  <span className="text-gray-600">Due:</span> {formData.dueDate}{" "}
                  ({getDaysUntilDue()} days)
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                disabled={
                  (selectedStudent && selectedStudent.banned) ||
                  borrowingLimitError
                }
              >
                Lend Book
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookLendingForm;
