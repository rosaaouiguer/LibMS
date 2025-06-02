import React from "react";

const ViewBorrowingModal = ({
  isOpen,
  borrowing,
  onClose,
  onRenew,
  onReturn,
  openReturnModal,
}) => {
  if (!isOpen || !borrowing) return null;

  // Calculate days overdue or remaining
  const calculateDaysDifference = () => {
    const today = new Date();
    const dueDate = new Date(borrowing.dueDate);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysDifference = calculateDaysDifference();
  const isOverdue = daysDifference < 0;

  // Format dates for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get today's date for return date
  const today = new Date().toISOString().split("T")[0];
  const formattedToday = formatDate(today);

  // Handle the return button click
  const handleReturnClick = () => {
    // Close the viewing modal first
    onClose();
    // Then open the return book modal with the current borrowing
    openReturnModal(borrowing);
  };

  // Check if renewal is allowed based on student category
  const canRenew = borrowing.canExtend !== false;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-fadeIn">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex items-center">
            <svg
              className="h-6 w-6 text-blue-500 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">
              Borrowing Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
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

        <div className="px-6 py-4">
          <div className="mb-6">
            {/* Status indicator */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Status</span>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  borrowing.status === "Active"
                    ? "bg-yellow-100 text-yellow-600"
                    : borrowing.status === "Overdue"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {borrowing.status}
              </span>
            </div>

            {/* Due date alert - only show for non-returned items */}
            {borrowing.status !== "Returned" && (
              <div
                className={`p-3 rounded-md mb-4 ${
                  isOverdue
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    {isOverdue ? (
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">
                      {isOverdue
                        ? `Overdue by ${Math.abs(daysDifference)} day${
                            Math.abs(daysDifference) !== 1 ? "s" : ""
                          }`
                        : `${daysDifference} day${
                            daysDifference !== 1 ? "s" : ""
                          } remaining`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Return confirmation note - only for returned items */}
            {borrowing.status === "Returned" && (
              <div className="p-3 rounded-md mb-4 bg-green-50 text-green-700 border border-green-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">
                      This book has been returned successfully
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Book information */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-sm transition-shadow">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <svg
                className="h-4 w-4 text-gray-500 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              Book Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-medium">{borrowing.bookTitle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ISBN</p>
                <p className="font-medium">{borrowing.isbn}</p>
              </div>
            </div>
          </div>

          {/* Student information */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-sm transition-shadow">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <svg
                className="h-4 w-4 text-gray-500 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              Student Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Student Name</p>
                <p className="font-medium">{borrowing.studentName}</p>
              </div>
              {borrowing.studentCategory && (
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">
                    {borrowing.studentCategory.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dates information */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <svg
                className="h-4 w-4 text-gray-500 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              Borrowing Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Borrow Date</p>
                <p className="font-medium">
                  {formatDate(borrowing.borrowDate)}
                </p>
                {borrowing.lendingCondition && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">Lending Condition</p>
                    <p className="font-medium">{borrowing.lendingCondition}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {borrowing.status === "Returned" ? "Return Date" : "Due Date"}
                </p>
                <p className="font-medium">
                  {borrowing.status === "Returned"
                    ? formattedToday
                    : formatDate(borrowing.dueDate)}
                </p>

                {/* Return Condition - only shown for returned books */}
                {borrowing.status === "Returned" &&
                  borrowing.returnCondition && (
                    <div>
                      <p className="text-sm text-gray-500">Return Condition</p>
                      <p className="font-medium">{borrowing.returnCondition}</p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          {borrowing.status !== "Returned" && (
            <>
              <button
                onClick={() => onRenew(borrowing)}
                disabled={!canRenew}
                title={
                  canRenew
                    ? "Renew borrowing"
                    : "Extensions not allowed for this student category"
                }
                className={`mr-3 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  canRenew
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100 focus:ring-blue-500"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Renew
                </div>
              </button>
              <button
                onClick={handleReturnClick}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-sm"
              >
                <div className="flex items-center">
                  <svg
                    className="h-4 w-4 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Return Book
                </div>
              </button>
            </>
          )}
          {borrowing.status === "Returned" && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              <div className="flex items-center">
                <svg
                  className="h-4 w-4 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Close
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewBorrowingModal;
