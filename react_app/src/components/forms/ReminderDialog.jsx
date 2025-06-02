import React from "react";

const ReminderDialog = ({ isOpen, borrowing, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Send Reminder
        </h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to send a reminder to{" "}
          <span className="font-semibold">{borrowing?.studentName}</span> about
          returning "{borrowing?.bookTitle}"?
        </p>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Send Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderDialog;
