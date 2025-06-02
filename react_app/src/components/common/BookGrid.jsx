import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ContextMenu from "../common/ContextMenu";
import { BookIcon, Users, Clock, AlertCircle } from "lucide-react";
import CopiesDialog from "../forms/CopiesDialog";
import ReservationDialog from "../forms/ReservationDialog";
import LendingRightsDialog from "../forms/LendingRightsDialog";
import { motion } from "framer-motion"; // Make sure to import motion if not already in the project

const BookGrid = ({
  books = [],
  onDelete,
  onHandleCopies,
  onLend,
  onReserve,
}) => {
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    bookId: null,
  });

  // Add state for dialogs
  const [copiesDialog, setCopiesDialog] = useState({
    visible: false,
    bookId: null,
  });

  const [reservationDialog, setReservationDialog] = useState({
    visible: false,
    bookId: null,
  });

  // Add state for lending rights dialog
  const [lendingRightsDialog, setLendingRightsDialog] = useState({
    visible: false,
    bookId: null,
  });

  // Add state for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    visible: false,
    bookId: null,
    error: null,
  });

  useEffect(() => {
    closeContextMenu();
  }, [books]);

  const handleContextMenu = (e, bookId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      bookId,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({
      ...contextMenu,
      visible: false,
    });
  };

  // Add functions to close dialogs
  const closeCopiesDialog = () => {
    setCopiesDialog({
      visible: false,
      bookId: null,
    });
  };

  const closeReservationDialog = () => {
    setReservationDialog({
      visible: false,
      bookId: null,
    });
  };

  // Add function to close lending rights dialog
  const closeLendingRightsDialog = () => {
    setLendingRightsDialog({
      visible: false,
      bookId: null,
    });
  };

  // Add function to close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({
      visible: false,
      bookId: null,
      error: null,
    });
  };

  const handleViewDetails = (bookId) => {
    navigate(`/books/${bookId}`);
    closeContextMenu();
  };

  const handleEdit = (bookId) => {
    navigate(`/books/edit/${bookId}`);
    closeContextMenu();
  };

  const handleDelete = (bookId) => {
    // Open the delete confirmation dialog instead of showing a browser confirm
    setDeleteDialog({
      visible: true,
      bookId,
      error: null,
    });
    closeContextMenu();
  };

  // Handle actual deletion with error handling
  const confirmDelete = async () => {
    try {
      await onDelete(deleteDialog.bookId);
      closeDeleteDialog();
    } catch (error) {
      // Check if it's a 400 error (active borrowings)
      if (error.response && error.response.status === 400) {
        setDeleteDialog({
          ...deleteDialog,
          error: "Cannot delete book with active borrowings",
        });
      } else {
        setDeleteDialog({
          ...deleteDialog,
          error: "Failed to delete book: " + (error.message || "Unknown error"),
        });
      }
    }
  };

  const handleLendBook = (bookId) => {
    const book = books.find((b) => b._id === bookId);
    if (book.availableCopies <= 0) {
      alert("This book is currently unavailable for lending.");
      return;
    }
    onLend(bookId);
    closeContextMenu();
  };

  // Add functions to open dialogs
  const handleManageCopies = (bookId) => {
    setCopiesDialog({
      visible: true,
      bookId,
    });
    closeContextMenu();
  };

  const handleReserveBook = (bookId) => {
    setReservationDialog({
      visible: true,
      bookId,
    });
    closeContextMenu();
  };

  // Add function to open lending rights dialog
  const handleEditLendingRights = (bookId) => {
    setLendingRightsDialog({
      visible: true,
      bookId,
    });
    closeContextMenu();
  };

  const getContextMenuItems = (bookId) => {
    const book = books.find((b) => b._id === bookId);
    if (!book) return [];

    return [
      {
        label: "View Details",
        icon: "eye",
        onClick: () => handleViewDetails(bookId),
      },
      {
        label: "Edit Book",
        icon: "edit",
        onClick: () => handleEdit(bookId),
      },
      {
        label: "Lend Book",
        icon: "share",
        onClick: () => handleLendBook(bookId),
        disabled: book.availableCopies <= 0,
      },
      {
        label: "Manage Copies",
        icon: "layers",
        onClick: () => handleManageCopies(bookId),
      },
      {
        label: "Reserve Book",
        icon: "bookmark",
        onClick: () => handleReserveBook(bookId),
        disabled: book.availableCopies > 0,
      },
      {
        label: "Edit Lending Rights",
        icon: "calendar",
        onClick: () => handleEditLendingRights(bookId),
      },
      {
        label: "Delete",
        icon: "trash-2",
        danger: true,
        onClick: () => handleDelete(bookId),
      },
    ];
  };

  // Get book title for the delete confirmation dialog
  const getBookTitle = (bookId) => {
    const book = books.find((b) => b._id === bookId);
    return book ? book.title : "this book";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {books.map((book) => (
        <div
          key={book._id}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
          onContextMenu={(e) => handleContextMenu(e, book._id)}
          onDoubleClick={() => handleViewDetails(book._id)}
        >
          <div className="h-40 bg-blue-50 flex items-center justify-center overflow-hidden">
            {book.imageUrl ? (
              <img
                src={book.imageUrl}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <BookIcon size={64} className="text-blue-300" />
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">
              {book.title}
            </h3>
            <p className="text-gray-600 text-sm mb-2">{book.author}</p>

            <div className="flex items-center justify-between mt-3">
              {!book.availableCopies ? (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  No Copies
                </span>
              ) : (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                  {book.availableCopies} Available
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {books.length === 0 && (
        <div className="col-span-full py-20 text-center text-gray-500">
          No books available
        </div>
      )}

      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems(contextMenu.bookId)}
          onClose={closeContextMenu}
        />
      )}

      {copiesDialog.visible && (
        <CopiesDialog
          book={books.find((b) => b._id === copiesDialog.bookId)}
          onClose={closeCopiesDialog}
          onHandleCopies={onHandleCopies}
        />
      )}

      {reservationDialog.visible && (
        <ReservationDialog
          book={books.find((b) => b._id === reservationDialog.bookId)}
          onClose={closeReservationDialog}
          onReserve={onReserve}
        />
      )}

      {/* Add the new lending rights dialog */}
      {lendingRightsDialog.visible && (
        <LendingRightsDialog
          book={books.find((b) => b._id === lendingRightsDialog.bookId)}
          onClose={closeLendingRightsDialog}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteDialog.visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="flex items-center mb-5 text-red-500">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Delete Book
              </h3>
            </div>

            {deleteDialog.error ? (
              <div className="mb-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        {deleteDialog.error}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={closeDeleteDialog}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6 pl-12">
                  Are you sure you want to delete "
                  {getBookTitle(deleteDialog.bookId)}"? This action cannot be
                  undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeDeleteDialog}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1.5"
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

export default BookGrid;
