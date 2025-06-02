import React, { useState, useEffect } from "react";
// Modal components
import AddBorrowingModal from "../components/modals/AddBorrowingModal";
import ViewBorrowingModal from "../components/modals/ViewBorrowingModal";
import RenewBorrowingModal from "../components/modals/RenewBorrowingModal";
import ContextMenu from "../components/common/ContextMenu";
import ReminderDialog from "../components/forms/ReminderDialog";
import ReturnBookModal from "../components/modals/ReturnBookModal";
import DeleteBorrowingModal from "../components/modals/DeleteBorrowingModal";
import {
  getAllBorrowings,
  deleteBorrowing,
  returnBook,
  borrowBook,
} from "../services/borrowingApi";
import { createNotification } from "../services/notificationApi";
export const BorrowingPage = () => {
  // State for modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [sortField, setSortField] = useState("borrowingDate"); // Default sort by borrow date
  const [sortDirection, setSortDirection] = useState("desc"); // Default newest first

  // Data fetching state
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    borrowing: null,
  });
  // In BorrowingPage.jsx, in the useEffect data mapping section
  useEffect(() => {
    const fetchBorrowings = async () => {
      try {
        setLoading(true);
        const data = await getAllBorrowings();
        const formattedData = data.map((item) => {
          // Check if book has specific lending rights
          const hasBookLendingRights = item.bookLendingRights !== null;

          // Determine if extension is allowed
          // Priority: Book lending rights > Student category rights
          const canExtendFromBookRights = hasBookLendingRights
            ? item.bookLendingRights.loanExtensionAllowed
            : false;

          const canExtendFromStudentRights =
            item.studentId.category?.loanExtensionAllowed === true;

          // Use book rights if available, otherwise fall back to student category rights
          const canExtend = hasBookLendingRights
            ? canExtendFromBookRights
            : canExtendFromStudentRights;

          return {
            id: item._id,
            studentId: item.studentId._id,
            studentName: item.studentId.name,
            bookTitle: item.bookId.title,
            isbn: item.bookId.isbn,
            borrowDate: new Date(item.borrowingDate)
              .toISOString()
              .split("T")[0],
            dueDate: new Date(item.dueDate).toISOString().split("T")[0],
            status: mapStatus(item.status),
            returnCondition: item.returnCondition,
            returnDate: item.returnDate
              ? new Date(item.returnDate).toISOString().split("T")[0]
              : null,
            lendingCondition: item.lendingCondition,
            studentCategory: item.studentId.category,
            bookLendingRights: item.bookLendingRights,
            canExtend: canExtend,
            // Include extension details for reference when renewing
            extensionDetails: hasBookLendingRights
              ? {
                  limit: item.bookLendingRights.extensionLimit,
                  duration: item.bookLendingRights.extensionDuration,
                }
              : item.studentId.category?.extensionLimit &&
                item.studentId.category?.extensionDuration
              ? {
                  limit: item.studentId.category.extensionLimit,
                  duration: item.studentId.category.extensionDuration,
                }
              : null,
          };
        });

        setBorrowings(formattedData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch borrowings:", err);
        setError("Failed to load borrowing data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowings();
  }, []);

  // Map API status values to display status
  const mapStatus = (apiStatus) => {
    switch (apiStatus) {
      case "Borrowed":
        return "Active";
      case "Overdue":
        return "Overdue";
      case "Returned":
        return "Returned";
      default:
        return apiStatus;
    }
  };

  // Functions for searching
  const [searchTerm, setSearchTerm] = useState("");
  const filteredBorrowings = borrowings
    .filter((borrowing) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        borrowing.studentName?.toLowerCase().includes(searchLower) ||
        borrowing.bookTitle?.toLowerCase().includes(searchLower) ||
        borrowing.borrowDate?.includes(searchTerm) ||
        borrowing.dueDate?.includes(searchTerm) ||
        borrowing.status?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      // Handle sorting based on current sort field and direction
      if (sortField === "status") {
        // Custom sort order for status: Overdue first, then Active, then Returned
        const statusOrder = { Overdue: 1, Active: 2, Returned: 3 };
        const aStatus = a.status || "";
        const bStatus = b.status || "";
        const comparison =
          (statusOrder[aStatus] || 4) - (statusOrder[bStatus] || 4);
        return sortDirection === "asc" ? comparison : -comparison;
      }
      // For dates use string comparison (works for YYYY-MM-DD format)
      else if (sortField === "borrowDate" || sortField === "dueDate") {
        const aValue = a[sortField] || "";
        const bValue = b[sortField] || "";
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      }
      // Default string comparison for any other fields
      else {
        const aValue = a[sortField] || "";
        const bValue = b[sortField] || "";
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      }
    });
  // Pagination logic
  const totalPages = Math.ceil(filteredBorrowings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBorrowings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  // Handle action functions
  const handleViewBorrowing = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setIsViewModalOpen(true);
  };
  const handleSort = (field) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If clicking a new field, set it as sort field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const handleDeleteBorrowing = async (borrowing) => {
    try {
      // In a real implementation, make API call here
      await deleteBorrowing(borrowing.id);

      // Update local state
      const updatedBorrowings = borrowings.filter(
        (item) => item.id !== borrowing.id
      );
      setBorrowings(updatedBorrowings);

      // Close the delete modal
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Failed to delete borrowing:", err);
      // Handle error (could show error message to user)
    }
  };
  const handleOpenDeleteModal = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setIsDeleteModalOpen(true);
    setContextMenu({ ...contextMenu, visible: false });
  };
  const handleReturnBook = async (borrowing, condition) => {
    try {
      // Call the API to mark the book as returned
      const result = await returnBook(borrowing.id, {
        returnCondition: condition,
      });

      // Update local state with the API response
      const updatedBorrowings = borrowings.map((item) => {
        if (item.id === borrowing.id) {
          return {
            ...item,
            status: "Returned",
            returnCondition: condition,
            returnDate: new Date().toISOString().split("T")[0],
          };
        }
        return item;
      });

      setBorrowings(updatedBorrowings);

      // Update the selected borrowing state for the modal
      setSelectedBorrowing({
        ...borrowing,
        status: "Returned",
        returnCondition: condition,
        returnDate: new Date().toISOString().split("T")[0],
      });

      // Close the return modal
      setIsReturnModalOpen(false);
    } catch (err) {
      console.error("Failed to return book:", err);
      // Show error to user
      setError(`Failed to return book: ${err.message}`);

      // Hide error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };
  const handleOpenReturnModal = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setIsReturnModalOpen(true);
    setIsViewModalOpen(false); // Close view modal if open
  };

  const handleContextMenu = (e, borrowing) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      borrowing: borrowing,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleOpenReminderDialog = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setIsReminderDialogOpen(true);
    setContextMenu({ ...contextMenu, visible: false });
  };
  const handleSendReminder = async () => {
    try {
      // Check if the book is overdue by comparing due date with current date
      const isDueDate = new Date(selectedBorrowing.dueDate) >= new Date();

      // Create notification for the student with appropriate message
      await createNotification({
        student: selectedBorrowing.studentId,
        message: isDueDate
          ? `Please return "${selectedBorrowing.bookTitle}" by ${selectedBorrowing.dueDate}.`
          : `Your book "${selectedBorrowing.bookTitle}" was due on ${selectedBorrowing.dueDate} and is now overdue. Please return it as soon as possible.`,
        category: isDueDate ? "Due Date Reminders" : "Overdue Alerts",
      });

      // Close the dialog
      setIsReminderDialogOpen(false);

      // Show success message
      setReminderSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setReminderSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to send reminder:", err);
      setError(`Failed to send reminder: ${err.message}`);
      setTimeout(() => setError(null), 5000);
    }
  };
  const getContextMenuItems = () => {
    if (!contextMenu.borrowing) return [];

    const items = [
      {
        label: "View Details",
        onClick: () => handleViewBorrowing(contextMenu.borrowing),
      },
    ];

    if (contextMenu.borrowing.status !== "Returned") {
      // Determine the tooltip text based on where the lending rights come from
      let tooltipText;
      if (contextMenu.borrowing.bookLendingRights) {
        // Book-specific rights
        tooltipText = contextMenu.borrowing.canExtend
          ? `Book allows extension (${contextMenu.borrowing.bookLendingRights.extensionLimit} extensions available)`
          : "This book doesn't allow extensions";
      } else {
        // Student category rights
        tooltipText = contextMenu.borrowing.canExtend
          ? "Student category allows extensions"
          : "Extensions not allowed for this student category";
      }

      items.push(
        {
          label: "Renew Borrowing",
          onClick: () =>
            contextMenu.borrowing.canExtend &&
            handleOpenRenewModal(contextMenu.borrowing),
          disabled: !contextMenu.borrowing.canExtend,
          tooltip: tooltipText,
        },
        {
          label: "Return Book",
          onClick: () => handleOpenReturnModal(contextMenu.borrowing),
        },
        {
          label: "Send Reminder",
          onClick: () => handleOpenReminderDialog(contextMenu.borrowing),
        }
      );
    }

    // Add the delete option (available for all borrowing statuses)
    items.push({
      label: "Delete Borrowing",
      onClick: () => handleOpenDeleteModal(contextMenu.borrowing),
      className: "text-red-600",
    });

    return items;
  };
  const handleOpenRenewModal = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setIsRenewModalOpen(true);
    setIsViewModalOpen(false); // Close view modal if open
  };

  const handleRenewBook = (borrowing, newDueDate) => {
    // In a real implementation, make API call here

    // For now, just update local state
    const updatedBorrowings = borrowings.map((item) => {
      if (item.id === borrowing.id) {
        const updatedItem = {
          ...item,
          dueDate: newDueDate,
          status: "Active",
        };
        return updatedItem;
      }
      return item;
    });

    setBorrowings(updatedBorrowings);

    // If the view modal is open, update the selected borrowing
    const updatedBorrowing = {
      ...borrowing,
      dueDate: newDueDate,
      status: "Active",
    };

    setSelectedBorrowing(updatedBorrowing);
    setIsRenewModalOpen(false);
  };
  const handleAddBorrowing = async (newBorrowing) => {
    try {
      // If the newBorrowing already has an _id from the API, use it
      // Otherwise, make the API call here
      const borrowingWithId = newBorrowing._id
        ? newBorrowing
        : await borrowBook({
            studentId: newBorrowing.studentId,
            bookId: newBorrowing.bookId,
            borrowDate: newBorrowing.borrowDate,
            dueDate: newBorrowing.dueDate,
          });

      // Update local state with proper MongoDB _id
      setBorrowings([
        ...borrowings,
        {
          ...borrowingWithId,
          // Ensure we use the MongoDB _id as the id property
          id: borrowingWithId._id,
          status: "Active",
        },
      ]);

      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding borrowing:", error);
      // Add error handling UI as needed
    }
  };
  // Pagination navigation
  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const columns = [
    {
      key: "studentName",
      title: "Student Name",
      sortable: true,
    },
    {
      key: "bookTitle",
      title: "Book Title",
      sortable: true,
    },
    {
      key: "borrowDate",
      title: "Borrow Date",
      sortable: true,
      render: (row) => <div className="text-center">{row.borrowDate}</div>,
    },
    {
      key: "dueDate",
      title: "Due Date",
      sortable: true,
      render: (row) => <div className="text-center">{row.dueDate}</div>,
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      render: (row) => {
        const getStatusStyle = (status) => {
          switch (status) {
            case "Active":
              return "bg-yellow-100 text-yellow-600";
            case "Overdue":
              return "bg-red-100 text-red-600";
            case "Returned":
              return "bg-green-100 text-green-600";
            default:
              return "bg-gray-100 text-gray-600";
          }
        };

        return (
          <div className="flex justify-center">
            <span
              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(
                row.status
              )}`}
            >
              {row.status}
            </span>
          </div>
        );
      },
    },
  ];
  const renderActions = (borrowing) => {
    if (borrowing.status === "Returned") {
      return (
        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewBorrowing(borrowing);
            }}
            className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-sm font-medium transition-colors duration-200"
          >
            View
          </button>
        </div>
      );
    }

    // Determine tooltip text for the renew button
    let renewTooltip = "Renew borrowing";
    if (!borrowing.canExtend) {
      if (borrowing.bookLendingRights) {
        renewTooltip = "This book doesn't allow extensions";
      } else {
        renewTooltip = "Extensions not allowed for this student category";
      }
    } else if (borrowing.bookLendingRights) {
      renewTooltip = `Book allows extension (up to ${
        borrowing.extensionDetails?.limit || 0
      } times)`;
    }

    return (
      <div className="flex justify-end space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewBorrowing(borrowing);
          }}
          className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-sm font-medium transition-colors duration-200"
        >
          View
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (borrowing.canExtend) {
              handleOpenRenewModal(borrowing);
            }
          }}
          disabled={!borrowing.canExtend}
          className={`px-3 py-1 ${
            borrowing.canExtend
              ? "bg-gray-50 text-gray-600 hover:bg-gray-100"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          } rounded text-sm font-medium transition-colors duration-200`}
          title={renewTooltip}
        >
          Renew
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenReturnModal(borrowing);
          }}
          className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded text-sm font-medium transition-colors duration-200"
        >
          Return
        </button>
      </div>
    );
  };
  const handleRowContextMenu = (e, row) => {
    handleContextMenu(e, row);
  };
  // In the BorrowingPage component, replace the renderPagination function with this:
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    // For simpler pagination when there are many pages
    const pageNumbers = [];
    const showPageNumbers = 5; // How many numbered pages to show

    let startPage = Math.max(1, currentPage - Math.floor(showPageNumbers / 2));
    let endPage = Math.min(totalPages, startPage + showPageNumbers - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < showPageNumbers) {
      startPage = Math.max(1, endPage - showPageNumbers + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredBorrowings.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium">{filteredBorrowings.length}</span>{" "}
              results
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {startPage > 1 && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                      currentPage === 1
                        ? "bg-blue-50 text-blue-600"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    1
                  </button>
                  {startPage > 2 && (
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white">
                      ...
                    </span>
                  )}
                </>
              )}

              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => goToPage(number)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                    currentPage === number
                      ? "bg-blue-50 text-blue-600"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {number}
                </button>
              ))}

              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && (
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white">
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => goToPage(totalPages)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                      currentPage === totalPages
                        ? "bg-blue-50 text-blue-600"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  // Error message component
  const ErrorMessage = ({ message }) => (
    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md my-4">
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
          <h3 className="text-sm font-medium">Error</h3>
          <div className="mt-2 text-sm">{message}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header with title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Borrowing Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage book loans and borrowing records
            </p>
          </div>

          {/* Success alert for reminder */}
          {reminderSuccess && (
            <div className="mb-4 p-4 bg-green-50 rounded-md border border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
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
                  <h3 className="text-sm font-medium text-green-800">
                    Reminder sent successfully!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>The reminder has been sent to the student.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search bar and button in flex container */}
          <div className="flex items-center mb-6 gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by Student, Book, Date..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              New Borrowing
            </button>
          </div>

          {/* Main content - Borrowings table */}
          <div onContextMenu={(e) => e.preventDefault()}>
            {error && <ErrorMessage message={error} />}

            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <TableWithContextMenu
                  columns={columns}
                  data={currentItems}
                  actions={renderActions}
                  onRowClick={handleViewBorrowing}
                  onRowContextMenu={handleRowContextMenu}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Borrowing Modal */}
      <AddBorrowingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddBorrowing}
      />
      {/* Reminder Dialog */}
      <ReminderDialog
        isOpen={isReminderDialogOpen}
        borrowing={selectedBorrowing}
        onClose={() => setIsReminderDialogOpen(false)}
        onConfirm={handleSendReminder}
      />
      <DeleteBorrowingModal
        isOpen={isDeleteModalOpen}
        borrowing={selectedBorrowing}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteBorrowing}
      />
      {/* View Borrowing Modal */}
      <ViewBorrowingModal
        isOpen={isViewModalOpen}
        borrowing={selectedBorrowing}
        onClose={() => setIsViewModalOpen(false)}
        onRenew={handleOpenRenewModal}
        onReturn={handleReturnBook}
        openReturnModal={handleOpenReturnModal}
      />
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={closeContextMenu}
        />
      )}
      {/* Renew Borrowing Modal */}
      <RenewBorrowingModal
        isOpen={isRenewModalOpen}
        borrowing={selectedBorrowing}
        onClose={() => setIsRenewModalOpen(false)}
        onRenew={handleRenewBook}
      />
      <ReturnBookModal
        isOpen={isReturnModalOpen}
        borrowing={selectedBorrowing}
        onClose={() => setIsReturnModalOpen(false)}
        onReturn={handleReturnBook}
      />
    </div>
  );
};
const TableWithContextMenu = ({
  columns,
  data,
  actions,
  onRowClick,
  onRowContextMenu,
  sortField,
  sortDirection,
  onSort,
}) => {
  // Apply our onContextMenu to each row
  const enhancedData = data.map((item) => ({
    ...item,
    __contextMenu: (e) => {
      e.preventDefault();
      e.stopPropagation();
      onRowContextMenu(e, item);
    },
  }));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                }`}
                onClick={() => column.sortable && onSort && onSort(column.key)}
              >
                <div className="flex items-center">
                  {column.title}
                  {column.sortable && sortField === column.key && (
                    <span className="ml-2">
                      {sortDirection === "asc" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {enhancedData.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick && onRowClick(item)}
              onContextMenu={item.__contextMenu}
            >
              {columns.map((column) => (
                <td
                  key={`${item.id}-${column.key}`}
                  className="px-6 py-4 whitespace-nowrap"
                >
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {actions && actions(item)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BorrowingPage;
