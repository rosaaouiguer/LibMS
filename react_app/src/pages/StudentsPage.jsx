import React, { useState, useEffect } from "react";
import { SearchBar } from "../components/common/searchbar";
import { MainButton } from "../components/common/buttons";
import { BanStudentDialog } from "../components/forms/BanStudentDialog";
import { StudentsFormModal } from "../components/modals/StudentsFormModal";
import { NotificationDialog } from "../components/forms/NotificationDialog";
import { StudentDetailView } from "./StudentDetailView";
import { FilterDialog } from "../components/forms/FilterDialog";
import { StudentCard } from "../components/common/StudentCard";
import {
  getAllStudents,
  banStudent,
  unbanStudent,
  updateStudent,
  createStudent,
} from "../services/studentApi";

// Pagination Component
// Updated Pagination Component
const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const maxPageButtons = 5;

  // Calculate range of pages to display
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = startPage + maxPageButtons - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  const goToPage = (page) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = currentPage * itemsPerPage;

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
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(indexOfLastItem, totalItems)}
            </span>{" "}
            of <span className="font-medium">{totalItems}</span> results
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

            {pages.map((number) => (
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
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l4.5 4.25a.75.75 0 01-1.06-.02z"
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
const StudentsPage = () => {
  const [view, setView] = useState("grid");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Number of students per page

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    category: "",
    status: "",
    sortBy: "name",
  });

  // Students data
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  // Load students from API on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getAllStudents();
      setAllStudents(data);
      setFilteredStudents(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load students");
      setLoading(false);
      console.error("Error loading students:", err);
    }
  };

  // Get unique categories for filter options
  const categories = [
    ...new Set(allStudents.map((student) => student.category)),
  ];

  // Apply filters and search to students
  useEffect(() => {
    let result = [...allStudents];

    // Apply category filter
    if (activeFilters.category) {
      result = result.filter(
        (student) => student.category === activeFilters.category
      );
    }

    // Apply status filter
    if (activeFilters.status) {
      if (activeFilters.status === "banned") {
        result = result.filter((student) => student.banned);
      } else if (activeFilters.status === "active") {
        result = result.filter((student) => !student.banned);
      }
    }

    // Apply sorting
    if (activeFilters.sortBy) {
      result.sort((a, b) => {
        switch (activeFilters.sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "name_desc":
            return b.name.localeCompare(a.name);
          case "id":
            return a.id.localeCompare(b.id);
          case "id_desc":
            return b.id.localeCompare(a.id);
          default:
            return 0;
        }
      });
    }

    // If there's a search query, filter by the search query as well
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.id.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
      );
    }

    setFilteredStudents(result);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchQuery, activeFilters, allStudents]);

  // Calculate current page students
  const indexOfLastStudent = currentPage * itemsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - itemsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // No API call, just filter the existing data
    if (query.length === 0) {
      // Reset to all students if search cleared
      setFilteredStudents(allStudents);
    } else {
      // Filter students locally
      const results = allStudents.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.id.toLowerCase().includes(query)
      );
      setFilteredStudents(results);
    }

    // Reset to first page when searching
    setCurrentPage(1);
  };

  const handleFilterOpen = () => {
    setShowFilterDialog(true);
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setView("detail");
  };

  const handleBackToGrid = () => {
    setView("grid");
    setSelectedStudent(null);
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowFormModal(true);
  };

  const handleSendNotification = (student) => {
    console.log("Student data before opening dialog:", student); // Debug log
    setSelectedStudent(student);
    setShowNotificationDialog(true);
  };

  const handleNotificationSent = async (notificationData) => {
    try {
      if (!notificationData || notificationData.error) {
        throw new Error(
          notificationData?.error || "Notification failed to send"
        );
      }

      console.log("Notification sent:", notificationData);
      // Show success toast or notification to user
      alert("Notification sent successfully!");
    } catch (error) {
      console.error("Error processing notification:", error);
      alert(error.message);
    } finally {
      setShowNotificationDialog(false);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent({
      ...student,
      _id: student._id, // Ensure _id is included
    });
    setShowFormModal(true);
  };

  const handleSaveStudent = async (studentData) => {
    try {
      // If editing, update the student
      if (
        studentData._id &&
        allStudents.some((s) => s._id === studentData._id)
      ) {
        const updated = await updateStudent(
          studentData._id,
          studentData,
          studentData.image
        );

        setAllStudents((prev) =>
          prev.map((s) => (s._id === updated._id ? updated : s))
        );

        // If we're viewing this student's details, update the selected student
        if (selectedStudent && selectedStudent._id === updated._id) {
          setSelectedStudent(updated);
        }
      }
      // Otherwise add a new student
      else {
        const created = await createStudent(studentData, studentData.image);
        setAllStudents((prev) => [...prev, created]);
      }

      setShowFormModal(false);
    } catch (err) {
      console.error("Error saving student:", err);

      // Show specific error message to user
      const errorMessage =
        err.message || "Failed to save student. Please try again.";

      // Check for specific validation errors
      if (
        errorMessage.includes("duplicate key") ||
        errorMessage.includes("already used")
      ) {
        // Check if it's an email or student ID conflict
        if (errorMessage.includes("email")) {
          alert("This email address is already registered to another student.");
        } else if (errorMessage.includes("studentId")) {
          alert("This Student ID is already assigned to another student.");
        } else {
          alert(errorMessage);
        }
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleBanStudent = (student) => {
    setSelectedStudent(student);

    setShowBanDialog(true);
  };

  const handleBanConfirmed = async (banData) => {
    try {
      const banned = await banStudent(banData.student, banData.bannedUntil);

      // Update the student's ban status in state
      setAllStudents((prev) =>
        prev.map((s) => (s.id === banned.id ? banned : s))
      );

      // Update selected student if currently viewing
      if (selectedStudent && selectedStudent.id === banned.id) {
        setSelectedStudent(banned);
      }

      setShowBanDialog(false);
    } catch (err) {
      console.error("Error banning student:", err);
      alert("Failed to ban student. Please try again.");
    }
  };

  const handleUnbanStudent = async (student) => {
    try {
      const unbanned = await unbanStudent(student);

      // Update the student's ban status in state
      setAllStudents((prev) =>
        prev.map((s) => (s.id === unbanned.id ? unbanned : s))
      );

      // Update selected student if currently viewing
      if (selectedStudent && selectedStudent.id === unbanned.id) {
        setSelectedStudent(unbanned);
      }
    } catch (err) {
      console.error("Error unbanning student:", err);
      alert("Failed to unban student. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">{error}</p>
              <button
                onClick={fetchStudents}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Try Again
              </button>
            </div>
          ) : view === "grid" ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="relative w-full">
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
                    placeholder="Search by ID, name or email..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                <button
                  onClick={handleAddStudent}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-[40px] px-4 rounded-lg font-medium 
                  transition-all duration-200 shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed 
                  flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 
                  min-w-[180px]"
                >
                  Add New Student
                </button>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    All Students
                  </h2>
                  <p className="text-sm text-gray-600">
                    {filteredStudents.length} Results
                  </p>
                </div>

                {/* Active Filters Display */}
                {(activeFilters.category || activeFilters.status) && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    <span className="text-sm text-gray-500">
                      Active Filters:
                    </span>
                    {activeFilters.category && (
                      <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Category: {activeFilters.category}
                        <button
                          onClick={() =>
                            setActiveFilters((prev) => ({
                              ...prev,
                              category: "",
                            }))
                          }
                          className="ml-1 focus:outline-none"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </span>
                    )}
                    {activeFilters.status && (
                      <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Status:{" "}
                        {activeFilters.status === "banned"
                          ? "Banned"
                          : "Active"}
                        <button
                          onClick={() =>
                            setActiveFilters((prev) => ({
                              ...prev,
                              status: "",
                            }))
                          }
                          className="ml-1 focus:outline-none"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </span>
                    )}
                    <button
                      onClick={() =>
                        setActiveFilters({
                          category: "",
                          status: "",
                          sortBy: "name",
                        })
                      }
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Clear All
                    </button>
                  </div>
                )}

                {currentStudents.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {currentStudents.map((student) => (
                        <StudentCard
                          key={student.id}
                          student={student}
                          onClick={handleViewDetails}
                          onEdit={handleEditStudent}
                          onNotify={handleSendNotification}
                          onBanStudent={handleBanStudent}
                          onUnbanStudent={handleUnbanStudent}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    <Pagination
                      totalItems={filteredStudents.length}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                    />
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No students found
                    </h3>
                    <p className="text-gray-500">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <StudentDetailView
              student={selectedStudent}
              onBack={handleBackToGrid}
              onSendNotification={handleSendNotification}
              onEditStudent={handleEditStudent}
              onBanStudent={handleBanStudent}
              onUnbanStudent={handleUnbanStudent}
            />
          )}
        </main>
      </div>

      {showNotificationDialog && (
        <NotificationDialog
          student={selectedStudent}
          onClose={() => setShowNotificationDialog(false)}
          onSend={handleNotificationSent}
        />
      )}

      {/* Filter Dialog */}
      <FilterDialog
        isOpen={showFilterDialog}
        onClose={() => setShowFilterDialog(false)}
        onApply={handleApplyFilters}
        categories={categories}
      />

      {showFormModal && (
        <StudentsFormModal
          student={editingStudent} // Pass the student being edited or null for a new student
          onClose={() => setShowFormModal(false)}
          onSave={handleSaveStudent}
        />
      )}

      {showBanDialog && (
        <BanStudentDialog
          student={selectedStudent}
          onClose={() => setShowBanDialog(false)}
          onBan={handleBanConfirmed}
        />
      )}
    </div>
  );
};

export default StudentsPage;
