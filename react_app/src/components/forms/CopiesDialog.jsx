import React, { useState, useEffect } from "react";
import { Plus, Minus, X, AlertCircle } from "lucide-react";

const CopiesDialog = ({ book, onClose, onHandleCopies }) => {
  const [action, setAction] = useState("increment");
  const [copiesCount, setCopiesCount] = useState(1);
  const [error, setError] = useState("");

  // Reset error when action changes
  useEffect(() => {
    setError("");
  }, [action]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate input based on action
    if (action === "decrement") {
      // Check if trying to remove more copies than available
      if (copiesCount > book.availableCopies) {
        setError(
          `You can only remove up to ${book.availableCopies} available copies.`
        );
        return;
      }

      // Don't allow removing all copies if total would be less than 1
      if (book.totalCopies - copiesCount < 1) {
        setError("You must keep at least 1 copy of the book.");
        return;
      }
    }

    try {
      await onHandleCopies(book._id, action, copiesCount);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update copies");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 bg-blue-50 border-b">
          <h3 className="text-lg font-medium text-blue-800">Manage Copies</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">{book.title}</span> by{" "}
              {book.author}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Current inventory: {book.totalCopies} total,{" "}
              {book.availableCopies} available
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
              <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Action
            </label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setAction("increment")}
                className={`flex-1 px-3 py-2 flex items-center justify-center border rounded-md ${
                  action === "increment"
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Plus size={16} className="mr-2" />
                Add Copies
              </button>

              <button
                type="button"
                onClick={() => setAction("decrement")}
                className={`flex-1 px-3 py-2 flex items-center justify-center border rounded-md ${
                  action === "decrement"
                    ? "bg-orange-50 border-orange-300 text-orange-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Minus size={16} className="mr-2" />
                Remove Copies
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="copiesCount"
              className="block text-gray-700 text-sm font-medium mb-2"
            >
              Number of Copies
            </label>
            <input
              type="number"
              id="copiesCount"
              value={copiesCount}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setCopiesCount(Math.max(1, value));
              }}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {action === "decrement" && book.availableCopies > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                Maximum removable: {book.availableCopies} copies
              </p>
            )}
            {action === "decrement" && book.availableCopies === 0 && (
              <p className="mt-1 text-sm text-red-500">
                No copies available to remove
              </p>
            )}
          </div>

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
              disabled={action === "decrement" && book.availableCopies === 0}
              className={`px-4 py-2 text-white rounded-md ${
                action === "increment"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : book.availableCopies === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {action === "increment" ? "Add Copies" : "Remove Copies"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CopiesDialog;
