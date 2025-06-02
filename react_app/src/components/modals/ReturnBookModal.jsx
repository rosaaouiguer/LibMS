import React, { useState } from "react";

const ReturnBookModal = ({ isOpen, borrowing, onClose, onReturn }) => {
  const [formData, setFormData] = useState({
    condition: "Good",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onReturn(borrowing, formData.condition);
    onClose();
  };

  if (!isOpen || !borrowing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Return Book</h3>
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
                </div>
              </div>
            </div>

            {/* Return Date (auto-filled with today's date) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Return Date
              </label>
              <input
                type="date"
                value={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
                disabled
              />
            </div>

            {/* Book Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Copy Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
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
              className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Confirm Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnBookModal;
