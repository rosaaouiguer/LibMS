import React, { useState } from "react";
import { MainButton, TextButton, IconTextButton } from "../common/buttons";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import useDeleteBook from "../../hooks/useDeleteBook"; // Import the hook

const BookDetails = ({ book, onEdit, onDelete, onBack }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { deleteBook, error: deleteError, clearError } = useDeleteBook(); // Use the hook

  const handleDelete = async () => {
    try {
      await deleteBook(book._id);
      setShowConfirmDelete(false);
      onBack(); // Navigate back after successful deletion
    } catch (error) {
      // The error is already set in the hook, no need to handle it here
      // We just need to keep the modal open to show the error
    }
  };

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-white py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-gray-600 text-center max-w-md px-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 mx-auto mb-6 text-blue-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 13.5V15m-6 4h12a2 2 0 002-2v-10a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">
            Book not found
          </h2>
          <p className="mb-6 text-gray-500">
            The book you're looking for doesn't exist or has been removed.
          </p>
          <MainButton text="Go Back" onClick={onBack} />
        </motion.div>
      </div>
    );
  }

  const getAvailabilityClass = () => {
    if (book.availableCopies === 0) return "text-red-500";
    if (book.availableCopies < book.totalCopies / 2) return "text-orange-500";
    return "text-green-600";
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-white min-h-full overflow-auto pb-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Top bar */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8 pt-8"
        >
          <button
            onClick={onBack}
            className="group flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium py-2 px-4 hover:bg-blue-50 rounded-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Books
          </button>
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Book Details
          </h1>
          <div className="w-[100px]"></div> {/* Spacer to center the title */}
        </motion.div>

        {/* Book details card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
        >
          {/* Book header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex flex-col md:flex-row">
              {/* Book cover */}
              <div className="md:w-1/4 flex justify-center mb-8 md:mb-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-48 h-64 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 shadow-md border border-gray-100"
                >
                  {book.imageURL ? (
                    <img
                      src={book.imageURL}
                      alt={`${book.title} cover`}
                      className="max-w-full max-h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center p-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 mx-auto mb-3 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="font-medium">No cover image</p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Book info */}
              <div className="md:w-3/4 md:pl-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 leading-tight">
                  {book.title}
                </h2>
                <p className="text-blue-600 text-lg mb-5 font-medium">
                  by {book.author}
                </p>

                <div className="flex flex-wrap gap-3 mb-5">
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full bg-opacity-20 ${getAvailabilityClass()} ${
                      book.availableCopies === 0
                        ? "bg-red-100"
                        : book.availableCopies < book.totalCopies / 2
                        ? "bg-orange-100"
                        : "bg-green-100"
                    }`}
                  >
                    {book.availableCopies} of {book.totalCopies} copies
                    available
                  </span>
                </div>

                {book.keywords && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2 font-medium">
                      Keywords:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {book.keywords.split(",").map((keyword, index) => (
                        <span
                          key={index}
                          className="bg-gray-50 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onEdit}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-sm transition-colors font-medium"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Book
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowConfirmDelete(true)}
                    className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-lg shadow-sm transition-colors font-medium"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Book
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Book metadata */}
          <div className="p-8 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {book.isbn && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    ISBN
                  </h3>
                  <p className="text-gray-800 font-medium text-lg">
                    {book.isbn}
                  </p>
                </div>
              )}

              {book.barcode && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    Barcode
                  </h3>
                  <p className="text-gray-800 font-medium text-lg">
                    {book.barcode}
                  </p>
                </div>
              )}

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Copies
                </h3>
                <div className="flex items-center space-x-4">
                  <p className="text-gray-800 font-medium text-lg">
                    {book.availableCopies} available / {book.totalCopies} total
                  </p>
                </div>
              </div>

              {book.callNumber && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Call Number
                  </h3>
                  <p className="text-gray-800 font-medium text-lg">
                    {book.callNumber}
                  </p>
                </div>
              )}

              {book.ebookLink && (
                <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    E-book Link
                  </h3>
                  <a
                    href={book.ebookLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center group font-medium"
                  >
                    <span className="truncate">{book.ebookLink}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Book summary */}
          <div className="p-8">
            {book.summary && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Summary
                </h3>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {book.summary}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete confirmation modal */}
      {showConfirmDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowConfirmDelete(false);
            clearError(); // Clear any error when closing the modal
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
          >
            <div className="flex items-center mb-5 text-red-500">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                {deleteError ? "Error" : "Delete Book"}
              </h3>
            </div>

            {deleteError ? (
              <>
                <p className="text-red-600 mb-4">{deleteError}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowConfirmDelete(false);
                      clearError();
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{book.title}"? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BookDetails;
