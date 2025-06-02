import React from "react";

const DeleteBorrowingModal = ({ isOpen, borrowing, onClose, onDelete }) => {
  if (!isOpen || !borrowing) return null;

  const handleDelete = () => {
    onDelete(borrowing);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-red-600">
          Confirm Deletion
        </h2>

        <p className="mb-6">
          Are you sure you want to delete the borrowing record for
          <span className="font-semibold"> "{borrowing.bookTitle}"</span>
          {borrowing.studentName && (
            <span>
              {" "}
              by <span className="font-semibold">{borrowing.studentName}</span>
            </span>
          )}
          ?
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBorrowingModal;
