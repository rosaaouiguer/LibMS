// Modal components
import AddReservationModal from "../components/modals/AddReservationModal";
import ContextMenu from "../components/common/ContextMenu";
import ConfirmDialog from "../components/common/ConfirmDialog";
import ExtendReservationModal from "../components/modals/ExtendReservationModal"; // New import
import PickupReservationModal from "../components/modals/PickupReservationModal";
import React, { useState, useEffect } from "react";
import {
  getAllReservations,
  checkoutReservation,
  cancelReservation,
  deleteReservation,
} from "../services/reservationApi";

export const ReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for modals
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false); // New state for extend modal
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [sortField, setSortField] = useState("status");
  const [sortDirection, setSortDirection] = useState("asc");
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    reservation: null,
  });
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await getAllReservations();

        // Transform the data to match the expected format in the component
        const transformedData = data.map((reservation) => {
          // Extract student name and book title from populated fields
          const studentName = reservation.studentId?.name || "Unknown";
          const bookTitle = reservation.bookId?.title || "Unknown";
          const isbn = reservation.bookId?.isbn || "Unknown";

          // Determine current borrower
          let currentBorrower = "None";
          if (reservation.status === "Held" && reservation.currentBorrower) {
            currentBorrower = reservation.currentBorrower.name || "Unknown";
          }

          // Format status and determine time left for pickup
          let status = reservation.status;
          let timeLeft = "";

          // If status is 'Held', change it to 'Still Held' for UI clarity
          if (status === "Held") {
            status = "Still Held";
          }
          // If status is 'Ready for Pickup', change it to 'Awaiting Pickup' and calculate time left
          else if (status === "Ready for Pickup" || status === "Available") {
            status = "Awaiting Pickup";

            // Calculate time left until pickup deadline
            if (reservation.pickupDeadline) {
              const deadline = new Date(reservation.pickupDeadline);
              const now = new Date();
              const diffMs = deadline - now;
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              const diffHours = Math.floor(
                (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
              );

              if (diffDays > 0) {
                timeLeft = `${diffDays} ${diffDays === 1 ? "day" : "days"}`;
              } else if (diffHours > 0) {
                timeLeft = `${diffHours} ${diffHours === 1 ? "hour" : "hours"}`;
              } else {
                timeLeft = "less than 1 hour";
              }
            } else {
              // If no pickup deadline is specified, default to 1 day
              timeLeft = "1 day";
            }
          }

          return {
            id: reservation._id,
            studentId: reservation.studentId?._id,
            studentName,
            bookId: reservation.bookId?._id,
            bookTitle,
            isbn,
            currentBorrower,
            status,
            timeLeft,
            deadlineDate: reservation.pickupDeadline || "",
            createdAt: reservation.createdAt,
          };
        });

        setReservations(transformedData);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch reservations");
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);
  // Functions for searching
  const [searchTerm, setSearchTerm] = useState("");
  const filteredReservations = React.useMemo(() => {
    // First filter by search term
    const filtered = reservations.filter((reservation) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        reservation.studentName.toLowerCase().includes(searchLower) ||
        reservation.bookTitle.toLowerCase().includes(searchLower) ||
        reservation.currentBorrower.toLowerCase().includes(searchLower) ||
        reservation.status.toLowerCase().includes(searchLower)
      );
    });

    // Then sort by the selected field
    return [...filtered].sort((a, b) => {
      // Special sorting for status that considers both status and time left
      if (sortField === "status") {
        // First sort by status
        if (a.status !== b.status) {
          // If sorting ascending: "Awaiting Pickup" comes before "Still Held"
          // If sorting descending: "Still Held" comes before "Awaiting Pickup"
          const comparison = a.status.localeCompare(b.status);
          return sortDirection === "asc" ? comparison : -comparison;
        }

        // If same status and both are "Awaiting Pickup", sort by time left
        if (a.status === "Awaiting Pickup" && b.status === "Awaiting Pickup") {
          // Convert time left to comparable numbers
          const getTimeLeftValue = (timeLeft) => {
            if (!timeLeft) return Infinity; // No time left is treated as infinite time

            const minutes = timeLeft.includes("mins")
              ? parseInt(timeLeft.split(" ")[0])
              : 0;

            const hours =
              timeLeft.includes("hours") || timeLeft.includes("hour")
                ? parseInt(timeLeft.split(" ")[0]) * 60
                : 0;

            const days =
              timeLeft.includes("days") || timeLeft.includes("day")
                ? parseInt(timeLeft.split(" ")[0]) * 24 * 60
                : 0;

            return minutes + hours + days;
          };

          const aValue = getTimeLeftValue(a.timeLeft);
          const bValue = getTimeLeftValue(b.timeLeft);

          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
      }

      // Default sorting for other fields
      if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [reservations, searchTerm, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReservations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Handle action functions
  const handleSort = (field) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If clicking a new field, set it as sort field with default asc direction
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const handleCancelReservation = (reservation) => {
    setSelectedReservation(reservation);
    setConfirmAction("cancel");
    setIsConfirmDialogOpen(true);
    closeContextMenu();
  };
  const handleContextMenu = (e, reservation) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      reservation: reservation,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleDeleteReservation = (reservation) => {
    setSelectedReservation(reservation);
    setConfirmAction("delete");
    setIsConfirmDialogOpen(true);
    closeContextMenu();
  };

  const handlePickupReservation = (reservation) => {
    setSelectedReservation(reservation);
    setIsPickupModalOpen(true);
    closeContextMenu();
  };
  const handleConfirmPickup = async (lendingCondition) => {
    try {
      // Call API with lending condition
      await checkoutReservation(selectedReservation.id, { lendingCondition });

      // Remove from reservations
      const updatedReservations = reservations.filter(
        (item) => item.id !== selectedReservation.id
      );
      setReservations(updatedReservations);

      // Show alert
      setAlertMessage({
        type: "success",
        text: "Book successfully marked as picked up and moved to borrowings.",
      });

      // Close modal
      setIsPickupModalOpen(false);
    } catch (error) {
      console.error("Error performing pickup:", error);

      setAlertMessage({
        type: "error",
        text:
          error.message || "An error occurred while processing your request.",
      });
    }

    // Hide alert after 3 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleExtendReservation = (reservation) => {
    setSelectedReservation(reservation);
    setIsExtendModalOpen(true);
    closeContextMenu();
  };
  // Handler for extending the reservation deadline
  // Handler for extending the reservation deadline
  const handleExtendConfirm = async (days) => {
    if (selectedReservation) {
      try {
        setLoading(true);

        // Calculate new deadline date for UI update
        const currentDeadline = selectedReservation.deadlineDate
          ? new Date(selectedReservation.deadlineDate)
          : new Date();

        currentDeadline.setDate(currentDeadline.getDate() + parseInt(days));
        const newDeadlineDate = currentDeadline.toISOString().split("T")[0];

        // Update the reservation in the local state
        const updatedReservations = reservations.map((item) => {
          if (item.id === selectedReservation.id) {
            // Update deadline and timeLeft
            let updatedTimeLeft = "";
            if (item.status === "Awaiting Pickup") {
              const daysDiff = Math.ceil(
                (currentDeadline - new Date()) / (1000 * 60 * 60 * 24)
              );
              updatedTimeLeft = daysDiff > 1 ? `${daysDiff} days` : "1 day";
            }

            return {
              ...item,
              deadlineDate: newDeadlineDate,
              timeLeft: updatedTimeLeft,
              // Also update the daysUntilExpiry in our UI state if we had it exposed
            };
          }
          return item;
        });

        setReservations(updatedReservations);

        // Show success alert
        setAlertMessage({
          type: "success",
          text: `Reservation deadline extended by ${days} days.`,
        });
      } catch (error) {
        // Show error alert
        setAlertMessage({
          type: "error",
          text: `Failed to extend reservation: ${
            error.message || "Unknown error"
          }`,
        });
      } finally {
        setLoading(false);
      }
    }

    // Close the modal
    setIsExtendModalOpen(false);

    // Hide alert after 3 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };
  const handleConfirmAction = async () => {
    try {
      if (confirmAction === "delete") {
        // Call API to delete the reservation
        await deleteReservation(selectedReservation.id);

        // Remove the reservation from the list
        const updatedReservations = reservations.filter(
          (item) => item.id !== selectedReservation.id
        );
        setReservations(updatedReservations);

        // Show alert
        setAlertMessage({
          type: "success",
          text: "Reservation has been successfully deleted.",
        });
      } else if (confirmAction === "pickup") {
        // Call API to checkout the reservation
        await checkoutReservation(selectedReservation.id);

        // Remove from reservations
        const updatedReservations = reservations.filter(
          (item) => item.id !== selectedReservation.id
        );
        setReservations(updatedReservations);

        // Show alert
        setAlertMessage({
          type: "success",
          text: "Book successfully marked as picked up and moved to borrowings.",
        });
      } else if (confirmAction === "cancel") {
        // Call API to cancel the reservation
        await cancelReservation(selectedReservation.id);

        // Update the reservation status to "Cancelled"
        const updatedReservations = reservations.map((item) => {
          if (item.id === selectedReservation.id) {
            return { ...item, status: "Cancelled" };
          }
          return item;
        });
        setReservations(updatedReservations);

        // Show alert
        setAlertMessage({
          type: "success",
          text: "Reservation has been successfully cancelled.",
        });
      }

      // Close the dialog
      setIsConfirmDialogOpen(false);
    } catch (error) {
      // Handle errors
      console.error("Error performing reservation action:", error);

      setAlertMessage({
        type: "error",
        text:
          error.message || "An error occurred while processing your request.",
      });
    }

    // Hide alert after 3 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  // Generate context menu items
  const getContextMenuItems = () => {
    if (!contextMenu.reservation) return [];

    const items = [];

    // Only show "Mark as Picked Up" for "Awaiting Pickup" status
    if (contextMenu.reservation.status === "Awaiting Pickup") {
      items.push({
        label: "Mark as Picked Up",
        onClick: () => handlePickupReservation(contextMenu.reservation),
      });
    }

    // Only show "Extend Reservation" for non-Cancelled reservations
    if (contextMenu.reservation.status !== "Cancelled") {
      items.push({
        label: "Extend Reservation",
        onClick: () => handleExtendReservation(contextMenu.reservation),
      });
    }

    // Add "Cancel Reservation" for non-Cancelled reservations
    if (contextMenu.reservation.status !== "Cancelled") {
      items.push({
        label: "Cancel Reservation",
        onClick: () => handleCancelReservation(contextMenu.reservation),
      });
    }

    // Only show "Delete Reservation" for Cancelled reservations
    if (contextMenu.reservation.status === "Cancelled") {
      items.push({
        label: "Delete Reservation",
        onClick: () => handleDeleteReservation(contextMenu.reservation),
      });
    }

    return items;
  };
  const handleAddReservation = (newReservation) => {
    // Safely access nested properties
    const studentId = newReservation.studentId?._id || newReservation.studentId;
    const studentName = newReservation.studentId?.name || "Unknown";
    const bookId = newReservation.bookId?._id || newReservation.bookId;
    const bookTitle = newReservation.bookId?.title || "Unknown";
    const isbn = newReservation.bookId?.isbn || "Unknown";

    // Properly handle current borrower information
    let currentBorrower = "None";
    if (newReservation.status === "Held" && newReservation.currentBorrower) {
      if (typeof newReservation.currentBorrower === "object") {
        currentBorrower = newReservation.currentBorrower.name || "Unknown";
        // Could also add code to show the due date: ` (Due: ${new Date(newReservation.currentBorrower.dueDate).toLocaleDateString()})`
      } else if (typeof newReservation.currentBorrower === "string") {
        currentBorrower = newReservation.currentBorrower;
      }
    }

    // Transform the API response data to match component's expected format
    const formattedReservation = {
      id: newReservation._id,
      studentId: studentId,
      studentName: studentName,
      bookId: bookId,
      bookTitle: bookTitle,
      isbn: isbn,
      currentBorrower: currentBorrower,
      // Use the actual status from the API - the status values in the API are 'Held', 'Awaiting Pickup', or 'Cancelled'
      status: newReservation.status,
      createdAt: newReservation.createdAt || new Date().toISOString(),
      deadlineDate: newReservation.pickupDeadline || "",
    };

    // Calculate time left for pickup
    if (
      formattedReservation.status === "Awaiting Pickup" &&
      formattedReservation.deadlineDate
    ) {
      const deadline = new Date(formattedReservation.deadlineDate);
      const now = new Date();

      // Handle invalid date
      if (isNaN(deadline.getTime())) {
        formattedReservation.timeLeft = "Unknown";
      } else {
        const diffMs = deadline - now;

        // Handle expired deadlines
        if (diffMs <= 0) {
          formattedReservation.timeLeft = "Expired";
        } else {
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor(
            (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );

          if (diffDays > 0) {
            formattedReservation.timeLeft = `${diffDays} ${
              diffDays === 1 ? "day" : "days"
            }`;
          } else if (diffHours > 0) {
            formattedReservation.timeLeft = `${diffHours} ${
              diffHours === 1 ? "hour" : "hours"
            }`;
          } else {
            formattedReservation.timeLeft = "less than 1 hour";
          }
        }
      }
    } else if (formattedReservation.status === "Awaiting Pickup") {
      // If awaiting pickup but no deadline, use the default days value
      const daysValue = newReservation.daysUntilExpiry || 1;
      formattedReservation.timeLeft = `${daysValue} ${
        daysValue === 1 ? "day" : "days"
      }`;
    } else {
      formattedReservation.timeLeft = "";
    }

    // Add new reservation to the list
    setReservations([...reservations, formattedReservation]);

    // Show success message
    setAlertMessage({
      type: "success",
      text:
        formattedReservation.status === "Awaiting Pickup"
          ? "Reservation created and ready for pickup."
          : "Reservation added to waitlist.",
    });

    // Hide alert after 3 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);

    // Close modal
    setIsAddModalOpen(false);
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
  // Table columns definition - UPDATED
  const columns = [
    { key: "studentName", title: "Student Name" },
    { key: "bookTitle", title: "Book Title" },
    {
      key: "currentBorrower",
      title: "Current Borrower",
      render: (row) => (
        <div>
          {row.currentBorrower === "None" ? (
            <span className="text-gray-500">None</span>
          ) : (
            <span className="font-medium">{row.currentBorrower}</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (row) => {
        const getStatusStyle = (status) => {
          switch (status) {
            case "Awaiting Pickup":
              return "bg-green-100 text-green-600";
            case "Still Held":
              return "bg-yellow-100 text-yellow-600";
            default:
              return "bg-gray-100 text-gray-600";
          }
        };

        return (
          <div className="flex justify-start">
            <span
              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(
                row.status
              )}`}
            >
              {row.status}
              {row.status === "Awaiting Pickup" && row.timeLeft && (
                <span className="ml-1">({row.timeLeft} left)</span>
              )}
            </span>
          </div>
        );
      },
    },
  ];

  // Render actions for each row
  const renderActions = (reservation) => {
    return (
      <div className="flex justify-end space-x-2">
        {reservation.status === "Awaiting Pickup" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePickupReservation(reservation);
            }}
            className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded text-sm font-medium transition-colors duration-200"
          >
            Mark as Picked Up
          </button>
        )}

        {reservation.status !== "Cancelled" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExtendReservation(reservation);
            }}
            className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-sm font-medium transition-colors duration-200"
          >
            Extend
          </button>
        )}

        {reservation.status !== "Cancelled" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCancelReservation(reservation);
            }}
            className="px-3 py-1 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded text-sm font-medium transition-colors duration-200"
          >
            Cancel
          </button>
        )}

        {reservation.status === "Cancelled" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteReservation(reservation);
            }}
            className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-sm font-medium transition-colors duration-200"
          >
            Delete
          </button>
        )}
      </div>
    );
  };

  const handleRowContextMenu = (e, row) => {
    handleContextMenu(e, row);
  };

  // Generate pagination component
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
                {Math.min(indexOfLastItem, filteredReservations.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium">{filteredReservations.length}</span>{" "}
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
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header with title and action button */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Reservation Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage book reservations - view status as "Awaiting Pickup" or
                "Still Held" by another borrower. Extend reservations or mark
                them as picked up when available.
              </p>
            </div>
          </div>
          {/* Success/error alert */}
          {alertMessage && (
            <div
              className={`mb-4 p-4 rounded-md border ${
                alertMessage.type === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {alertMessage.type === "success" ? (
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
                  ) : (
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3
                    className={`text-sm font-medium ${
                      alertMessage.type === "success"
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {alertMessage.title ||
                      (alertMessage.type === "success" ? "Success!" : "Error!")}
                  </h3>
                  <div
                    className={`mt-2 text-sm ${
                      alertMessage.type === "success"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    <p>{alertMessage.text}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 mb-6">
            {/* Search bar */}
            <div className="flex-grow">
              <div className="relative">
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
                  placeholder="Search by Student, Book, Borrower, Status..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Add button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-w-[190px]"
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
              New Reservation
            </button>
          </div>
          {/* Main content - Reservations table */}
          <div onContextMenu={(e) => e.preventDefault()}>
            <TableWithContextMenu
              columns={columns}
              data={currentItems}
              actions={renderActions}
              onRowContextMenu={handleRowContextMenu}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            {renderPagination()}
          </div>
        </div>
      </div>

      {/* Add Reservation Modal */}
      <AddReservationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddReservation}
      />

      {/* Context menu */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={closeContextMenu}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmAction}
        title={
          confirmAction === "delete"
            ? "Delete Reservation"
            : confirmAction === "pickup"
            ? "Mark as Picked Up"
            : "Cancel Reservation"
        }
        message={
          confirmAction === "delete"
            ? "Are you sure you want to delete this reservation? This action cannot be undone."
            : confirmAction === "pickup"
            ? "Are you sure you want to mark this book as picked up? This will move the reservation to the borrowing table."
            : "Are you sure you want to cancel this reservation? The reservation will be marked as Cancelled."
        }
        confirmButton={
          confirmAction === "delete"
            ? { text: "Delete", style: "bg-red-600 hover:bg-red-700" }
            : confirmAction === "pickup"
            ? { text: "Confirm", style: "bg-green-600 hover:bg-green-700" }
            : {
                text: "Cancel Reservation",
                style: "bg-yellow-600 hover:bg-yellow-700",
              }
        }
      />
      <PickupReservationModal
        isOpen={isPickupModalOpen}
        onClose={() => setIsPickupModalOpen(false)}
        onConfirm={handleConfirmPickup}
        reservation={selectedReservation}
      />
      {/* Extend Reservation Modal */}
      <ExtendReservationModal
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        onConfirm={handleExtendConfirm}
        reservation={selectedReservation}
      />
    </div>
  );
};
const SortableColumn = ({
  column,
  currentSortField,
  currentSortDirection,
  onSort,
}) => {
  const isSorted = currentSortField === column.key;

  return (
    <th
      key={column.key}
      scope="col"
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
      onClick={() => onSort(column.key)}
    >
      <div className="flex items-center space-x-1">
        <span>{column.title}</span>
        {isSorted && (
          <span>
            {currentSortDirection === "asc" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
        )}
      </div>
    </th>
  );
};
const TableWithContextMenu = ({
  columns,
  data,
  actions,
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
            {columns.map((column) =>
              column.key === "status" ? (
                <SortableColumn
                  key={column.key}
                  column={column}
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={onSort}
                />
              ) : (
                <th
                  key={column.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.title}
                </th>
              )
            )}
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {enhancedData.length > 0 ? (
            enhancedData.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 "
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
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-6 py-4 text-center text-gray-500"
              >
                No reservations found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default ReservationPage;
