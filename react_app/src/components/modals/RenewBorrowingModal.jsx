import React, { useState, useEffect } from "react";
import { getLendingRightsByBookId } from "../../services/bookLendingRightsApi";
import { updateBorrowing } from "../../services/borrowingApi";

const RenewBorrowingModal = ({ isOpen, borrowing, onClose, onRenew }) => {
  // State for form and loading
  const [formData, setFormData] = useState({
    newDueDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate default new due date based on book rights or student category
  useEffect(() => {
    const calculateDueDate = async () => {
      if (!borrowing) return;

      try {
        setLoading(true);
        setError(null);

        // Get current due date
        const currentDueDate = new Date(borrowing.dueDate);
        let extensionDays = 7; // Default fallback

        // Check if we already have extension details from the borrowing object
        if (borrowing.extensionDetails && borrowing.extensionDetails.duration) {
          extensionDays = borrowing.extensionDetails.duration;
        } else {
          // Fetch book lending rights directly if not available
          const bookRights = await getLendingRightsByBookId(borrowing.bookId);

          if (bookRights && bookRights.extensionDuration) {
            // Use book-specific extension duration
            extensionDays = bookRights.extensionDuration;
          } else if (
            borrowing.studentCategory &&
            borrowing.studentCategory.extensionDuration
          ) {
            // Fallback to student category extension duration
            extensionDays = borrowing.studentCategory.extensionDuration;
          }
        }

        // Calculate new due date
        const newDueDate = new Date(currentDueDate);
        newDueDate.setDate(newDueDate.getDate() + extensionDays);

        // Update form state
        setFormData({
          newDueDate: newDueDate.toISOString().split("T")[0],
        });
      } catch (err) {
        console.error("Error calculating new due date:", err);
        setError("Failed to calculate extension period. Please try again.");

        // Fallback to +30 days if there's an error
        const fallbackDate = new Date(borrowing.dueDate);
        fallbackDate.setDate(fallbackDate.getDate() + 30);
        setFormData({
          newDueDate: fallbackDate.toISOString().split("T")[0],
        });
      } finally {
        setLoading(false);
      }
    };

    calculateDueDate();
  }, [borrowing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Update borrowing in the database
      await updateBorrowing(borrowing.id, {
        dueDate: formData.newDueDate,
        status: "Borrowed", // Reset to "Borrowed" if it was "Overdue"
      });

      // Call the parent component's onRenew function
      onRenew(borrowing, formData.newDueDate);
      onClose();
    } catch (err) {
      console.error("Error renewing borrowing:", err);
      setError("Failed to renew borrowing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !borrowing) return null;

  const getExtensionSource = () => {
    if (borrowing.bookLendingRights) {
      return `Book lending policy: ${
        borrowing.extensionDetails?.duration || "N/A"
      } days`;
    } else if (borrowing.studentCategory) {
      return `Student category policy: ${
        borrowing.extensionDetails?.duration || "N/A"
      } days`;
    }
    return "Default extension policy";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Renew Borrowing</h3>
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

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Book and borrower info summary */}
            <div className="bg-blue-50 p-4 rounded-md mb-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    {borrowing.bookTitle}
                  </h3>
                  <div className="mt-1 text-sm text-blue-700">
                    Borrowed by{" "}
                    <span className="font-medium">{borrowing.studentName}</span>
                  </div>
                  <div className="mt-1 text-xs text-blue-600">
                    {getExtensionSource()}
                  </div>
                </div>
              </div>
            </div>

            {/* Current due date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Due Date
              </label>
              <input
                type="date"
                value={borrowing.dueDate}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
                disabled
              />
            </div>

            {/* New due date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Due Date
              </label>
              <input
                type="date"
                name="newDueDate"
                value={formData.newDueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min={new Date().toISOString().split("T")[0]} // Can't select dates in the past
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Renewal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenewBorrowingModal;
