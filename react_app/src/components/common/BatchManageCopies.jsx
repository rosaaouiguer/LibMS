// BatchManageCopies.jsx
import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  X,
  Search,
} from "lucide-react";

// Selection Modal Component
const BatchManageCopiesModal = ({ isOpen, onClose, books, onSave }) => {
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(5);
  const [showManageScreen, setShowManageScreen] = useState(false);
  const [copiesAdjustment, setCopiesAdjustment] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  // Initialize copies adjustment when selected books change
  React.useEffect(() => {
    const newCopiesAdjustment = {};
    selectedBooks.forEach((isbn) => {
      newCopiesAdjustment[isbn] = { add: 0, remove: 0 };
    });
    setCopiesAdjustment(newCopiesAdjustment);
  }, [selectedBooks, showManageScreen]);
  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Replace the filteredBooks calculation with this
  const filteredBooks = React.useMemo(() => {
    if (!searchQuery) return books;

    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.isbn &&
          book.isbn.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [books, searchQuery]);

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Fix the selection logic - now using ISBN
  const toggleBookSelection = (isbn) => {
    setSelectedBooks((prevSelected) => {
      if (prevSelected.includes(isbn)) {
        return prevSelected.filter((id) => id !== isbn);
      } else {
        return [...prevSelected, isbn];
      }
    });
  };

  const toggleSelectAllBooks = () => {
    const currentBookIsbns = currentBooks.map((book) => book.isbn);

    setSelectedBooks((prevSelected) => {
      // Check if ALL current page books are selected
      if (currentBookIsbns.every((isbn) => prevSelected.includes(isbn))) {
        // Remove all current page books
        return prevSelected.filter((isbn) => !currentBookIsbns.includes(isbn));
      } else {
        // Add all current page books that aren't already selected
        const newSelected = [...prevSelected];
        currentBookIsbns.forEach((isbn) => {
          if (!newSelected.includes(isbn)) {
            newSelected.push(isbn);
          }
        });
        return newSelected;
      }
    });
  };
  // Handle copy adjustment
  const adjustCopies = (isbn, type, value) => {
    const book = books.find((b) => b.isbn === isbn);

    if (type === "remove") {
      if (book) {
        // Ensure we can't remove more than available copies
        const available = book.available || book.availableCopies || 0;
        const total = book.total || book.totalCopies || 0;

        // Don't allow removing more than available copies
        if (value > available) {
          value = available;
        }

        // Don't allow removing all copies if total would be less than 1
        if (total - value < 1) {
          value = total - 1;
        }
      }
    }

    setCopiesAdjustment((prev) => ({
      ...prev,
      [isbn]: {
        ...prev[isbn],
        [type]: Math.max(0, value),
      },
    }));
  };
  const handleSave = () => {
    const adjustments = Object.entries(copiesAdjustment).map(
      ([isbn, adjustment]) => ({
        isbn: isbn,
        add: adjustment.add,
        remove: adjustment.remove,
      })
    );

    onSave(adjustments);
    onClose();
  };
  // Render selection screen
  if (!showManageScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Select Books for Copy Management
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
          <div className="px-6 pt-6 pb-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by title, author, or ISBN..."
                className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-gray-500">
                Found {filteredBooks.length} book(s) matching "{searchQuery}"
              </div>
            )}
          </div>

          <div className="overflow-y-auto flex-grow p-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="pl-4 py-3">
                        <div className="flex items-center">
                          <button
                            className="flex text-gray-500 hover:text-gray-700"
                            onClick={toggleSelectAllBooks}
                          >
                            {currentBooks.length > 0 &&
                            currentBooks.every((book) =>
                              selectedBooks.includes(book.isbn)
                            ) ? (
                              <CheckSquare
                                size={18}
                                className="text-blue-600"
                              />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ISBN
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Title
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Author
                      </th>

                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Available / Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentBooks.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          <p className="text-lg font-medium">No books found</p>
                        </td>
                      </tr>
                    ) : (
                      currentBooks.map((book) => (
                        <tr
                          key={book.isbn}
                          className={`${
                            selectedBooks.includes(book.isbn)
                              ? "bg-blue-50"
                              : "hover:bg-gray-50"
                          } cursor-pointer`}
                          onClick={() => toggleBookSelection(book.isbn)}
                        >
                          <td className="pl-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {selectedBooks.includes(book.isbn) ? (
                                <CheckSquare
                                  size={18}
                                  className="text-blue-600"
                                />
                              ) : (
                                <Square size={18} className="text-gray-400" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {book.isbn}
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">
                              {book.title}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {book.author}
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`font-medium ${
                                (book.available || book.availableCopies) === 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {book.available || book.availableCopies || 0}
                            </span>{" "}
                            /{" "}
                            <span className="font-medium">
                              {book.total || book.totalCopies || 0}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Selection Summary */}
              <div className="px-6 py-4 bg-gray-50 text-sm text-gray-500 border-t flex justify-between items-center">
                <div>
                  <span className="font-medium">{selectedBooks.length}</span> of{" "}
                  <span className="font-medium">{filteredBooks.length}</span>{" "}
                  books selected{" "}
                  {searchQuery && (
                    <span className="text-gray-400">(filtered)</span>
                  )}
                </div>

                {/* Pagination */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className="p-1 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-1 rounded-md text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowManageScreen(true)}
              disabled={selectedBooks.length === 0}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Manage Copies ({selectedBooks.length})
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render manage copies screen
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Manage Book Copies
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 pt-6 pb-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search selected books..."
              className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-grow p-6">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-blue-700 text-sm">
              Adjust the number of copies for each selected book. Adding copies
              will increase both total and available copies. Removing copies
              will reduce total copies and available copies (if available).
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Book Title
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Current Available / Total
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Add Copies
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Remove Copies
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    New Available / Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Filter selected books based on search query */}
                {selectedBooks
                  .filter((isbn) => {
                    const book = books.find((b) => b.isbn === isbn);
                    if (!book) return false;
                    return (
                      book.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      book.author
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      (book.isbn &&
                        book.isbn
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())) ||
                      !searchQuery // Return all if no search query
                    );
                  })
                  .map((isbn) => {
                    const book = books.find((b) => b.isbn === isbn);
                    if (!book) return null;

                    const adjustment = copiesAdjustment[isbn] || {
                      add: 0,
                      remove: 0,
                    };
                    const addCount = adjustment.add || 0;
                    const removeCount = adjustment.remove || 0;

                    const available =
                      book.available || book.availableCopies || 0;
                    const total = book.total || book.totalCopies || 0;

                    // Calculate new totals
                    const newTotal = total + addCount - removeCount;
                    const newAvailable =
                      available + addCount - Math.min(removeCount, available);

                    return (
                      <tr key={book.isbn}>
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">
                            {book.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {book.author}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`font-medium ${
                              available === 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {available}
                          </span>{" "}
                          / <span className="font-medium">{total}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                adjustCopies(
                                  isbn,
                                  "add",
                                  Math.max(0, adjustment.add - 1)
                                )
                              }
                              className="p-1 rounded-md text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-1"
                            >
                              <Minus size={16} />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={adjustment.add}
                              onChange={(e) =>
                                adjustCopies(
                                  isbn,
                                  "add",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                            />
                            <button
                              onClick={() =>
                                adjustCopies(isbn, "add", adjustment.add + 1)
                              }
                              className="p-1 rounded-md text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-1"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                adjustCopies(
                                  isbn,
                                  "remove",
                                  Math.max(0, adjustment.remove - 1)
                                )
                              }
                              className="p-1 rounded-md text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-1"
                            >
                              <Minus size={16} />
                            </button>
                            <input
                              type="number"
                              min="0"
                              max={total}
                              value={adjustment.remove}
                              onChange={(e) =>
                                adjustCopies(
                                  isbn,
                                  "remove",
                                  Math.min(total, parseInt(e.target.value) || 0)
                                )
                              }
                              className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                            />
                            <button
                              onClick={() =>
                                adjustCopies(
                                  isbn,
                                  "remove",
                                  Math.min(total, adjustment.remove + 1)
                                )
                              }
                              className="p-1 rounded-md text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-1"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`font-medium ${
                              newAvailable === 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {newAvailable}
                          </span>{" "}
                          / <span className="font-medium">{newTotal}</span>
                        </td>
                      </tr>
                    );
                  })}
                {/* Show message when no results found */}
                {searchQuery &&
                  selectedBooks.filter((isbn) => {
                    const book = books.find((b) => b.isbn === isbn);
                    if (!book) return false;
                    return (
                      book.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      book.author
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      (book.isbn &&
                        book.isbn
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()))
                    );
                  }).length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        <p className="text-lg font-medium">
                          No matching books found
                        </p>
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-between gap-3">
          <button
            onClick={() => setShowManageScreen(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Back to Selection
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchManageCopiesModal;
