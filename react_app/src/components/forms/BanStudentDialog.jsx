import React, { useState, useEffect } from "react";

export const BanStudentDialog = ({ student, onClose, onBan }) => {
  // State for ban date
  const [bannedUntil, setBannedUntil] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Calculate default ban date based on category's defaultBanDuration
  useEffect(() => {
    const calculateDefaultBanDate = async () => {
      setIsLoading(true);
      try {
        // Check if student has category data already populated
        if (student.category && student.category.defaultBanDuration) {
          // If category is already populated with full data
          setDefaultBanDate(student.category.defaultBanDuration);
        } else if (student.category) {
          // If category is just an ID reference, fetch the category details
          const categoryId =
            typeof student.category === "object"
              ? student.category._id
              : student.category;
          const response = await fetch(
            `https://lms-backend-zjt1.onrender.com/api/student-categories/${categoryId}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch category details");
          }

          const categoryData = await response.json();
          if (categoryData.success && categoryData.data) {
            setDefaultBanDate(categoryData.data.defaultBanDuration);
          } else {
            // Default to 7 days if category fetch fails
            setDefaultBanDate(7);
          }
        } else {
          // Default to 7 days if student has no category
          setDefaultBanDate(7);
        }
      } catch (error) {
        console.error("Error fetching category ban duration:", error);
        // Default to 7 days if there's an error
        setDefaultBanDate(7);
      } finally {
        setIsLoading(false);
      }
    };

    calculateDefaultBanDate();
  }, [student]);

  // Helper function to set the default ban date based on duration in days
  const setDefaultBanDate = (durationDays) => {
    const banDate = new Date();
    banDate.setDate(banDate.getDate() + durationDays);
    setBannedUntil(banDate.toISOString().split("T")[0]);
  };

  const handleBan = () => {
    if (!bannedUntil) {
      alert("Please select a ban end date");
      return;
    }

    onBan({
      student: student, // Pass the entire student object to have access to _id
      bannedUntil,
    });
    onClose();
  };

  // Get next week's date as the minimum date for the calendar
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start mb-6">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-xl mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Ban Student Account
              </h3>
              <p className="text-gray-600 text-sm">
                {student.name} will be restricted from borrowing or reserving
                books
              </p>
            </div>
          </div>

          {/* Warning message */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  This action will prevent the student from accessing all
                  platform features until the specified date.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="bannedUntil"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ban Until
              </label>
              {isLoading ? (
                <div className="w-full py-2 px-3 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                  <span className="ml-2 text-sm text-gray-500">
                    Loading default ban duration...
                  </span>
                </div>
              ) : (
                <div>
                  <input
                    type="date"
                    id="bannedUntil"
                    name="bannedUntil"
                    value={bannedUntil}
                    onChange={(e) => setBannedUntil(e.target.value)}
                    min={minDate}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleBan}
            disabled={isLoading}
            className={`py-2 px-4 ${
              isLoading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
            } text-white rounded-md text-sm font-medium`}
          >
            {isLoading ? "Loading..." : "Confirm Ban"}
          </button>
        </div>
      </div>
    </div>
  );
};
