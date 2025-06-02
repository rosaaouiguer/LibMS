import React, { useState, useEffect } from "react";
import { X, BookOpen, Clock, AlertTriangle } from "lucide-react";
import { getAllStudents } from "../../services/studentApi"; // Adjust path as needed
import { createReservation } from "../../services/reservationApi"; // You'll need to create this service
import { getLendingRightsByBookId } from "../../services/bookLendingRightsApi"; // Import the lending rights API

const ReservationDialog = ({ book, onClose, onReserve }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    studentId: "",
    daysUntilExpiry: 1, // Default value, will be updated based on book lending rights or student category
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [bookLendingRights, setBookLendingRights] = useState(null);

  // Fetch students and book lending rights, then set initial form data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch students
        const studentsData = await getAllStudents();
        // Sort students alphabetically by name
        const sortedStudents = studentsData.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setStudents(sortedStudents);

        // Fetch book lending rights if book ID is available
        if (book && book._id) {
          try {
            const rights = await getLendingRightsByBookId(book._id);
            setBookLendingRights(rights);

            // If we have book lending rights, use the extension limit as default
            if (rights && rights.extensionLimit !== undefined) {
              setFormData((prev) => ({
                ...prev,
                daysUntilExpiry: rights.extensionLimit,
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

          // Set the student ID
          setFormData((prev) => ({
            ...prev,
            studentId: defaultStudent._id,
          }));

          // If no book lending rights, use student category for days until expiry
          if (!bookLendingRights && defaultStudent.category) {
            setFormData((prev) => ({
              ...prev,
              daysUntilExpiry: getExtensionLimit(defaultStudent),
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
  }, [book?._id]);

  // Helper function to get extension limit from student category
  const getExtensionLimit = (student) => {
    // Check if category is an object with extensionLimit property
    if (
      student?.category &&
      typeof student.category === "object" &&
      student.category.extensionLimit !== undefined
    ) {
      return student.category.extensionLimit;
    }
    // Fallback to default value
    return 1;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStudentChange = (e) => {
    const { name, value } = e.target;

    // Update form data with new student ID
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Find the selected student
    const student = students.find((s) => s._id === value);
    setSelectedStudent(student);

    if (student) {
      // Clear any previous error messages when changing students
      setError(null);

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
      // Otherwise use student category for days until expiry
      else if (student.category) {
        setFormData((prev) => ({
          ...prev,
          daysUntilExpiry: getExtensionLimit(student),
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Check if student is banned before attempting to reserve
    if (selectedStudent && selectedStudent.banned) {
      setError(
        "This student is currently banned and cannot make reservations."
      );
      return;
    }

    try {
      // Find student from ID
      const student = students.find((s) => s._id === formData.studentId);

      if (!student) {
        setError("Selected student not found. Please try again.");
        return;
      }

      // Create reservation data object
      const reservationData = {
        bookId: book._id,
        studentId: formData.studentId,
        daysUntilExpiry: parseInt(formData.daysUntilExpiry, 10),
      };

      // Call API to create reservation
      const result = await createReservation(reservationData);

      setSuccess("Reservation created successfully!");

      // Call the onReserve callback if provided
      if (typeof onReserve === "function") {
        onReserve(result);
      }

      // Close dialog after a short delay
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 bg-yellow-50 border-b">
          <h3 className="text-lg font-medium text-yellow-800 flex items-center">
            <BookOpen size={18} className="mr-2" />
            Reserve Book
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
              <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
              {success}
            </div>
          )}

          {/* Student selection */}
          <div className="mb-4">
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
              onChange={handleStudentChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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

          {/* Days until expiry */}
          <div className="mb-4">
            <label
              htmlFor="daysUntilExpiry"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Days Until Expiry:
            </label>
            <div className="flex items-center">
              <input
                type="number"
                id="daysUntilExpiry"
                name="daysUntilExpiry"
                min="1"
                max="14"
                value={formData.daysUntilExpiry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
              <Clock size={16} className="ml-2 text-gray-400" />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {formData.daysUntilExpiry} days ({getDaysUntilExpirySource()})
            </p>
          </div>

          {/* Warning for banned student */}
          {selectedStudent && selectedStudent.banned && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
              <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
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
          <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md mb-6">
            <h4 className="text-sm font-medium text-yellow-800 mb-1">
              Reservation Summary
            </h4>
            <div className="grid grid-cols-1 gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Student:</span>
                <span className="font-medium">
                  {students.find((s) => s._id === formData.studentId)?.name ||
                    "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Book:</span>
                <span className="font-medium">{book.title}</span>
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
                  <span className="text-yellow-700">
                    Using book's custom rules
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-yellow-600 hover:bg-yellow-700 rounded-md"
              disabled={loading || (selectedStudent && selectedStudent.banned)}
            >
              {loading ? "Reserving..." : "Reserve Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationDialog;
