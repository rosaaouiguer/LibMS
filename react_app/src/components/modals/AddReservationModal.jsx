import React, { useState, useEffect } from "react";
import { getAllBooks } from "../../services/bookApi"; // Adjust path as needed
import { getAllStudents } from "../../services/studentApi"; // Adjust path as needed
import { getLendingRightsByBookId } from "../../services/bookLendingRightsApi"; // Adjust path as needed
import { createReservation } from "../../services/reservationApi"; // Added missing import
import { AlertTriangle, BookOpen, Clock } from "lucide-react"; // Import icons

const AddReservationModal = ({ isOpen, onClose, onSave }) => {
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [bookLendingRights, setBookLendingRights] = useState(null);

  const [formData, setFormData] = useState({
    studentId: "",
    bookId: "",
    bookTitle: "", // We'll keep this for display purposes
    studentNameOrId: "", // We'll keep this for display purposes
    daysUntilExpiry: 1, // Changed from daysAfterAvailable to match API expectations
  });

  // Fetch students and books on initial load
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch both students and books in parallel
        const [studentsData, booksData] = await Promise.all([
          getAllStudents(),
          getAllBooks(),
        ]);

        // Sort students alphabetically by name
        const sortedStudents = studentsData.sort((a, b) => {
          // Ensure both a.name and b.name exist before comparing
          if (!a.name && !b.name) return 0;
          if (!a.name) return 1;
          if (!b.name) return -1;
          return a.name.localeCompare(b.name);
        });
        setStudents(sortedStudents);

        // Filter books with 0 available copies and sort alphabetically by title
        const reservableBooks = booksData.filter(
          (book) =>
            book.availableCopies !== undefined && book.availableCopies === 0
        );

        const sortedBooks = reservableBooks.sort((a, b) => {
          // Ensure both a.title and b.title exist before comparing
          if (!a.title && !b.title) return 0;
          if (!a.title) return 1;
          if (!b.title) return -1;
          return a.title.localeCompare(b.title);
        });
        setBooks(sortedBooks);

        // Set default values if available
        if (sortedStudents.length > 0) {
          const defaultStudent = sortedStudents[0];
          setSelectedStudent(defaultStudent);
          setFormData((prev) => ({
            ...prev,
            studentId: defaultStudent._id,
            studentNameOrId: defaultStudent.name
              ? `${defaultStudent.name} (${
                  defaultStudent.id || defaultStudent._id
                })`
              : String(defaultStudent.id || defaultStudent._id),
          }));

          // Set days based on student category if available
          if (
            defaultStudent.category &&
            typeof defaultStudent.category === "object" &&
            defaultStudent.category.extensionLimit !== undefined
          ) {
            setFormData((prev) => ({
              ...prev,
              daysUntilExpiry: defaultStudent.category.extensionLimit,
            }));
          }
        }

        if (sortedBooks.length > 0) {
          const defaultBook = sortedBooks[0];
          setSelectedBook(defaultBook);
          setFormData((prev) => ({
            ...prev,
            bookId: defaultBook._id,
            bookTitle: defaultBook.title || "",
          }));

          // Fetch book lending rights for the default book
          if (defaultBook._id) {
            try {
              const rights = await getLendingRightsByBookId(defaultBook._id);
              setBookLendingRights(rights);

              // Update days based on book rights if available
              if (rights && rights.extensionLimit !== undefined) {
                setFormData((prev) => ({
                  ...prev,
                  daysUntilExpiry: rights.extensionLimit,
                }));
              }
            } catch (err) {
              console.error("Error fetching book lending rights:", err);
              // Continue even if rights fetch fails
            }
          }
        } else {
          // No books are available for reservation
          setError(
            "There are no books available for reservation. Only books with 0 available copies can be reserved."
          );
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  // Helper function to get extension limit from student category
  const getExtensionLimit = (student) => {
    if (
      student?.category &&
      typeof student.category === "object" &&
      student.category.extensionLimit !== undefined
    ) {
      return student.category.extensionLimit;
    }
    return 1; // Default value
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "daysUntilExpiry" ? parseInt(value, 10) : value,
    });
  };

  const handleStudentChange = async (e) => {
    const { value } = e.target;

    // Find the selected student
    const student = students.find((s) => s._id === value);
    setSelectedStudent(student);

    if (student) {
      // Update form data
      setFormData((prev) => ({
        ...prev,
        studentId: student._id,
        studentNameOrId: student.name
          ? `${student.name} (${student.id || student._id})`
          : String(student.id || student._id),
      }));

      // Clear any errors that might be related to student selection
      if (error && error.includes("banned")) {
        setError(null);
      }

      // Check if student is banned
      if (student.banned) {
        setError(
          "This student is currently banned and cannot make reservations."
        );
      }

      // If book lending rights exist, they take precedence over student category
      if (bookLendingRights && bookLendingRights.extensionLimit !== undefined) {
        setFormData((prev) => ({
          ...prev,
          daysUntilExpiry: bookLendingRights.extensionLimit,
        }));
      }
      // Otherwise use student category
      else if (student.category) {
        setFormData((prev) => ({
          ...prev,
          daysUntilExpiry: getExtensionLimit(student),
        }));
      }
    }
  };

  const handleBookChange = async (e) => {
    const { value } = e.target;

    // Find the selected book
    const book = books.find((b) => b._id === value);
    setSelectedBook(book);

    if (book) {
      // Update form data
      setFormData((prev) => ({
        ...prev,
        bookId: book._id,
        bookTitle: book.title || "",
      }));

      // Verify book has 0 available copies
      if (book.availableCopies !== 0) {
        setError("Only books with 0 available copies can be reserved.");
        return;
      } else {
        // Clear any errors related to book selection
        if (
          error &&
          (error.includes("available copies") ||
            error.includes("available for reservation"))
        ) {
          setError(null);
        }
      }

      // Fetch book lending rights
      try {
        const rights = await getLendingRightsByBookId(book._id);
        setBookLendingRights(rights);

        // Update days based on book rights if available
        if (rights && rights.extensionLimit !== undefined) {
          setFormData((prev) => ({
            ...prev,
            daysUntilExpiry: rights.extensionLimit,
          }));
        }
        // If no rights but we have a student with category, use that
        else if (selectedStudent?.category) {
          setFormData((prev) => ({
            ...prev,
            daysUntilExpiry: getExtensionLimit(selectedStudent),
          }));
        }
      } catch (err) {
        console.error("Error fetching book lending rights:", err);
        // Continue even if rights fetch fails, use student category if available
        if (selectedStudent?.category) {
          setFormData((prev) => ({
            ...prev,
            daysUntilExpiry: getExtensionLimit(selectedStudent),
          }));
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    // Check if student is banned before submitting
    if (selectedStudent && selectedStudent.banned) {
      setError(
        "This student is currently banned and cannot make reservations."
      );
      setSubmitting(false);
      return;
    }

    // Check if a book is selected
    if (!formData.bookId || !formData.bookTitle) {
      setError("Please select a book to reserve.");
      setSubmitting(false);
      return;
    }

    // Check if a student is selected
    if (!formData.studentId || !formData.studentNameOrId) {
      setError("Please select a student for the reservation.");
      setSubmitting(false);
      return;
    }

    try {
      // Create reservation data object with the correct fields expected by the API
      const reservationData = {
        bookId: formData.bookId,
        studentId: formData.studentId,
        daysUntilExpiry: formData.daysUntilExpiry,
      };

      // Call API to create reservation
      const result = await createReservation(reservationData);

      setSuccess("Reservation created successfully!");

      // Call the parent component's onSave handler
      if (typeof onSave === "function") {
        onSave(result);
      }

      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error creating reservation:", err);

      // Handle specific error cases
      if (err.response) {
        if (err.response.status === 403) {
          setError("This student is banned and cannot make reservations.");
        } else if (err.response.data) {
          setError(err.response.data.message || "Failed to create reservation");
        } else {
          setError("Failed to create reservation. Please try again.");
        }
      } else {
        setError("Failed to create reservation. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Get the source of days until expiry value
  const getDaysUntilExpirySource = () => {
    if (bookLendingRights) {
      return "book's custom rules";
    } else if (selectedStudent?.category) {
      return `${selectedStudent.category.name || "student"} category`;
    } else {
      return "default";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">New Reservation</h3>
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
          <div className="px-6 py-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Loading data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
                <AlertTriangle
                  size={18}
                  className="mr-2 mt-0.5 flex-shrink-0"
                />
                <div>{error}</div>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleStudentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.id || student._id})
                      {student.banned ? " - BANNED" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Book (Only unavailable books can be reserved)
                </label>
                <select
                  name="bookId"
                  value={formData.bookId}
                  onChange={handleBookChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a book</option>
                  {books.length > 0 ? (
                    books.map((book) => (
                      <option key={book._id} value={book._id}>
                        {book.title || "Untitled"}{" "}
                        {book.isbn ? `(ISBN: ${book.isbn})` : ""}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No books available for reservation
                    </option>
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Only books with 0 available copies can be reserved
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Days For Pickup After Available
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    name="daysUntilExpiry"
                    value={formData.daysUntilExpiry}
                    onChange={handleChange}
                    min="1"
                    max="30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <Clock size={16} className="ml-2 text-gray-400" />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.daysUntilExpiry} days ({getDaysUntilExpirySource()})
                </p>
              </div>

              {/* Warning if student is banned */}
              {selectedStudent && selectedStudent.banned && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
                  <AlertTriangle
                    size={18}
                    className="mr-2 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="font-medium">This student is banned</p>
                    <p className="text-sm">
                      {selectedStudent.bannedUntil
                        ? `Ban expires: ${new Date(
                            selectedStudent.bannedUntil
                          ).toLocaleDateString()}`
                        : "Cannot make reservations until unbanned"}
                    </p>
                  </div>
                </div>
              )}

              {/* Reservation summary */}
              {selectedBook && selectedStudent && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Reservation Summary
                  </h4>
                  <div className="grid grid-cols-1 gap-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Student:</span>
                      <span className="font-medium">
                        {selectedStudent.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Book:</span>
                      <span className="font-medium">{selectedBook.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expires After:</span>
                      <span className="font-medium">
                        {formData.daysUntilExpiry} day(s) once available
                      </span>
                    </div>
                    {bookLendingRights && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Note:</span>
                        <span className="text-blue-700">
                          Using book's custom rules
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={
                  loading ||
                  submitting ||
                  (selectedStudent && selectedStudent.banned)
                }
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddReservationModal;
