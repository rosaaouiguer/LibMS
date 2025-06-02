import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "../components/common/layout";
import BookGrid from "../components/common/BookGrid";
import BookDetails from "../components/common/BookDetails";
import BookForm from "../components/common/BookForm";
import BookLendingForm from "../components/forms/BookLendingForm";
import { MainButton } from "../components/common/buttons";
import Pagination from "../components/common/Pagination";
import BatchManageCopiesModal from "../components/common/BatchManageCopies";
import useUpdateBook from "../hooks/useUpdateBook";
import { Loader } from "lucide-react"; // Import Loader icon
import {
  getAllBooks,
  updateBookCopies,
  updateBookCopiesByIsbn,
  deleteBook,
} from "../services/bookApi"; // Import the getAllBooks function
// Sample students data (unchanged)
const sampleStudents = [
  { id: "STU-001", name: "Ahmed Mohamed" },
  { id: "STU-002", name: "Leila Abbas" },
  { id: "STU-003", name: "Omar Hassan" },
  { id: "STU-004", name: "Fatima Zahra" },
  { id: "STU-993", name: "Aymen Seray" },
];

function BookManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState(sampleStudents);
  const [lendings, setLendings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(12);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Update these sections in BookManagement.js:

  // 1. Fetch all books at once
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const booksData = await getAllBooks();
        setBooks(booksData);
        setFilteredBooks(booksData);
        setTotalPages(Math.ceil(booksData.length / booksPerPage));
      } catch (err) {
        setError(err.message || "Failed to fetch books");
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [booksPerPage, refreshTrigger]);

  // 2. Handle page changes client-side
  // Update displayed books when filteredBooks or currentPage changes
  useEffect(() => {
    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    setDisplayedBooks(filteredBooks.slice(indexOfFirstBook, indexOfLastBook));
  }, [filteredBooks, currentPage, booksPerPage]);
  // Update total pages when filtered books change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredBooks.length / booksPerPage));
    // Reset to first page if current page is beyond the new total pages
    if (
      currentPage > Math.ceil(filteredBooks.length / booksPerPage) &&
      filteredBooks.length > 0
    ) {
      setCurrentPage(1);
    }
  }, [filteredBooks, booksPerPage]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handleUpdateLendingRights = async (lendingRightsData) => {
    try {
      // If lendingRightsData is null, it means we've deleted the override
      // No need to do anything here as the deletion has already been handled in the dialog
      if (!lendingRightsData) {
        // Refresh the books list to reflect any changes
        setRefreshTrigger((prev) => prev + 1);
        return;
      }

      // Log the updated lending rights for debugging
      console.log("Lending rights updated:", lendingRightsData);

      // Refresh the books list to reflect any changes
      setRefreshTrigger((prev) => prev + 1);

      // Optionally, you could show a success notification here
    } catch (error) {
      console.error("Error updating lending rights:", error);
      // Optionally handle error display here
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching

    if (!query) {
      setFilteredBooks(books);
      return;
    }

    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.isbn.includes(query) ||
        book.barcode?.includes(query) ||
        book.callNumber?.toLowerCase().includes(query.toLowerCase()) ||
        (book.keywords &&
          typeof book.keywords === "string" &&
          book.keywords.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredBooks(filtered);
  };

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const handleBatchCopiesUpdate = async (adjustments) => {
    if (!adjustments || adjustments.length === 0) return;

    try {
      // First update the backend
      for (const adjustment of adjustments) {
        if (adjustment.add > 0) {
          if (adjustment._id) {
            await updateBookCopies(adjustment._id, "increment", adjustment.add);
          } else if (adjustment.isbn) {
            await updateBookCopiesByIsbn(
              adjustment.isbn,
              "increment",
              adjustment.add
            );
          }
        }
        if (adjustment.remove > 0) {
          if (adjustment._id) {
            await updateBookCopies(
              adjustment._id,
              "decrement",
              adjustment.remove
            );
          } else if (adjustment.isbn) {
            await updateBookCopiesByIsbn(
              adjustment.isbn,
              "decrement",
              adjustment.remove
            );
          }
        }
      }

      const updatedBooks = books.map((book) => {
        const adjustment = adjustments.find(
          (a) =>
            (a._id && a._id === book._id) || (a.isbn && a.isbn === book.isbn)
        );

        if (adjustment) {
          const addCount = adjustment.add || 0;
          const removeCount = adjustment.remove || 0;

          return {
            ...book,
            totalCopies: book.totalCopies + addCount - removeCount,
            availableCopies:
              book.availableCopies +
              addCount -
              Math.min(removeCount, book.availableCopies),
          };
        }

        return book;
      });

      setBooks(updatedBooks);
      setFilteredBooks(updatedBooks);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error in batch update:", error);
      // Handle error (show toast, etc.)
    }
  };
  const addBook = (book) => {
    const newBook = {
      ...book,
      id: Math.max(...books.map((b) => b.id), 0) + 1,
      imageUrl: "/assets/book-cover.jpg", // Default image path
    };
    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    setFilteredBooks(updatedBooks);
    setRefreshTrigger((prev) => prev + 1); // Trigger refresh
  };

  const {
    updateBook: updateBookAPI,
    loading: updateBookLoading,
    error: updateBookError,
  } = useUpdateBook();

  const updateBook = async (updatedBook) => {
    const updated = await updateBookAPI(updatedBook);
    if (!updated) return;

    const updatedBooks = books.map((book) =>
      book._id === updated._id ? updated : book
    );
    setBooks(updatedBooks);
    setFilteredBooks(updatedBooks);
    setRefreshTrigger((prev) => prev + 1); // Trigger refresh
  };
  // Update the deleteBook function in BookManagement.jsx to handle 400 errors properly

  const deleteBookById = async (id) => {
    try {
      const success = await deleteBook(id);
      if (success) {
        const updatedBooks = books.filter((book) => book._id !== id);
        setBooks(updatedBooks);
        setFilteredBooks(updatedBooks);
        setRefreshTrigger((prev) => prev + 1);
        return true;
      }
      return false;
    } catch (error) {
      // This will allow the BookGrid component to handle the error
      throw error;
    }
  };
  const markUnavailable = (id) => {
    const updatedBooks = books.map((book) =>
      book.id === id ? { ...book, available: 0 } : book
    );
    setBooks(updatedBooks);
    setFilteredBooks(updatedBooks);
    setRefreshTrigger((prev) => prev + 1); // Trigger refresh
  };

  const handleCopies = async (id, action, count) => {
    try {
      const updatedBooks = books.map((book) => {
        if (book._id === id) {
          if (action === "increment") {
            return {
              ...book,
              totalCopies: book.totalCopies + count,
              availableCopies: book.availableCopies + count,
            };
          } else if (action === "decrement") {
            // Don't allow removing more than available copies
            if (count > book.availableCopies) {
              throw new Error(
                `Cannot remove more than ${book.availableCopies} available copies`
              );
            }

            // Don't allow total copies to go below 1
            if (book.totalCopies - count < 1) {
              throw new Error("Total copies cannot be less than 1");
            }

            return {
              ...book,
              totalCopies: book.totalCopies - count,
              availableCopies: book.availableCopies - count,
            };
          }
        }
        return book;
      });

      setBooks(updatedBooks);
      setFilteredBooks(updatedBooks);
      setRefreshTrigger((prev) => prev + 1); // Trigger refresh

      await updateBookCopies(id, action, count);

      return true;
    } catch (error) {
      console.error("Error updating copies:", error);
      throw error;
    }
  };

  const handleBookLending = (lendingData) => {
    // Add to lendings
    const newLending = {
      ...lendingData,
      id: Date.now().toString(),
      status: "active",
    };
    setLendings([...lendings, newLending]);

    // Update book availability
    const updatedBooks = books.map((book) => {
      if (book.id === lendingData.book_id) {
        return {
          ...book,
          available: Math.max(0, book.available - 1),
        };
      }
      return book;
    });
    setBooks(updatedBooks);
    setFilteredBooks(updatedBooks);
    setRefreshTrigger((prev) => prev + 1); // Trigger refresh
  };

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="flex justify-center items-center py-12">
      <Loader size={32} className="animate-spin text-blue-600" />
      <span className="ml-3 text-gray-600 font-medium">Loading books...</span>
    </div>
  );

  // Error display component
  const ErrorDisplay = () => (
    <div className="flex justify-center items-center py-12">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p className="font-medium">Failed to load books</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => setRefreshTrigger((prev) => prev + 1)}
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout className="p-0">
              <div className="flex h-screen bg-gray-50">
                <div className="flex-1 flex flex-col overflow-hidden">
                  <header className="bg-white shadow-sm ">
                    <div className="max-w-full px-4 py-4 flex justify-between items-center">
                      <h1 className="text-2xl font-semibold text-gray-900">
                        Books
                      </h1>
                      <button
                        onClick={() => setIsBatchModalOpen(true)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-[40px] px-4 rounded-lg font-medium 
      transition-all duration-200 shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed 
      flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                      >
                        Manage Copies
                      </button>
                    </div>
                  </header>
                  <main className="flex-1 overflow-y-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
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
                          placeholder="Search by title, author, ISBN, call number..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={searchQuery}
                          onChange={handleSearch}
                        />
                      </div>

                      <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
                        <button
                          onClick={() => navigate("/books/add")}
                          className="bg-blue-600 hover:bg-blue-700 text-white h-[40px] px-4 rounded-lg font-medium 
                        transition-all duration-200 shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed 
                        flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 
                        min-w-[150px]"
                        >
                          Add New Book
                        </button>
                      </div>
                    </div>

                    <div className="bg-white shadow">
                      <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">
                          All Books
                        </h2>
                        <p className="text-sm text-gray-600">
                          {filteredBooks.length} Results
                        </p>
                      </div>
                      <div className="p-4">
                        {loading ? (
                          <LoadingIndicator />
                        ) : error ? (
                          <ErrorDisplay />
                        ) : (
                          <>
                            <BookGrid
                              books={displayedBooks}
                              onDelete={deleteBookById}
                              onMarkUnavailable={markUnavailable}
                              onHandleCopies={handleCopies}
                              onLend={(bookId) =>
                                navigate(`/books/lend/${bookId}`)
                              }
                            />
                          </>
                        )}
                      </div>
                      {/* Add pagination component outside the scrollable area */}
                      {!loading && !error && totalPages > 0 && (
                        <div className="bg-white p-4 border-t">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                          />
                        </div>
                      )}
                    </div>
                  </main>
                </div>
              </div>
            </MainLayout>
          }
        />

        <Route
          path="/add"
          element={
            <MainLayout>
              <div className="p-6 bg-gray-50 min-h-screen">
                <BookForm
                  onSave={(book) => {
                    addBook(book);
                    navigate("/books");
                  }}
                  onCancel={() => navigate("/books")}
                />
              </div>
            </MainLayout>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <MainLayout>
              <div className="p-6 bg-gray-50 min-h-screen">
                <BookFormWrapper books={books} onSave={updateBook} />
              </div>
            </MainLayout>
          }
        />

        <Route
          path="/:id"
          element={
            <MainLayout>
              <div className="p-6 bg-gray-50 min-h-screen">
                <BookDetailsWrapper
                  books={books}
                  onDelete={deleteBookById}
                  onMarkUnavailable={markUnavailable}
                  onLend={(bookId) => navigate(`/books/lend/${bookId}`)}
                />
              </div>
            </MainLayout>
          }
        />

        <Route
          path="/lend/:id"
          element={
            <MainLayout>
              <BookLendingWrapper
                books={books}
                students={students}
                onLend={handleBookLending}
              />
            </MainLayout>
          }
        />
      </Routes>

      {/* Add the modal here, outside of Routes but still inside the return statement */}
      {isBatchModalOpen && (
        <BatchManageCopiesModal
          isOpen={isBatchModalOpen}
          books={books}
          onClose={() => setIsBatchModalOpen(false)}
          onSave={handleBatchCopiesUpdate}
        />
      )}
    </>
  );
}

// Helper components for routing (unchanged)
function BookButton() {
  const navigate = useNavigate();
  return (
    <MainButton
      text="Add New Book"
      onClick={() => navigate("/books/add")}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm"
    />
  );
}

function BookFormWrapper({ books, onSave }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  // Wait until books are loaded
  if (!books || books.length === 0) {
    return (
      <div className="p-6 text-gray-500 text-center">Loading book data...</div>
    );
  }

  const book = books.find((b) => b._id === id); // Don't parse id; it's a string

  if (id && !book) {
    return (
      <div className="p-6 text-red-500 text-center font-bold">
        Book not found
      </div>
    );
  }

  return (
    <BookForm book={book} onCancel={() => navigate("/books")} onSave={onSave} />
  );
}

function BookDetailsWrapper({ books, onDelete, onMarkUnavailable, onLend }) {
  const navigate = useNavigate();
  const { id } = useParams();

  // Show loading state if books aren't loaded yet
  if (!books || books.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size={32} className="animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600 font-medium">
          Loading book details...
        </span>
      </div>
    );
  }

  const book = books.find((b) => b._id === id); // Don't parse id; it's a string

  if (id && !book) {
    return (
      <div className="p-6 text-red-500 text-center font-bold">
        Book not found
      </div>
    );
  }

  return (
    <BookDetails
      book={book}
      onEdit={() => navigate(`/books/edit/${id}`)}
      onDelete={() => {
        onDelete(id);
        navigate("/books");
      }}
      onMarkUnavailable={() => {
        onMarkUnavailable(parseInt(id));
        navigate("/books");
      }}
      onLend={() => navigate(`/books/lend/${id}`)}
      onBack={() => navigate("/books")}
    />
  );
}

function BookLendingWrapper({ books, students, onLend }) {
  const navigate = useNavigate();
  const { id } = useParams();

  // Show loading state if books aren't loaded yet
  if (!books || books.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size={32} className="animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600 font-medium">
          Loading lending information...
        </span>
      </div>
    );
  }

  const book = books.find((b) => b._id === id); // Don't parse id; it's a string

  if (id && !book) {
    return (
      <div className="p-6 text-red-500 text-center font-bold">
        Book not found
      </div>
    );
  }

  if (book.available <= 0) {
    return (
      <div className="max-w-4xl mx-auto bg-gray-50 p-8 min-h-screen">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Book Unavailable
          </h2>
          <p className="text-gray-700 mb-6">
            Sorry, "{book.title}" is currently not available for lending. All
            copies are checked out.
          </p>
          <button
            onClick={() => navigate("/books")}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Book List
          </button>
        </div>
      </div>
    );
  }

  return (
    <BookLendingForm
      book={book}
      students={students}
      onSave={(lendingData) => {
        onLend(lendingData);
        setTimeout(() => {
          navigate("/books");
        }, 5000);
      }}
      onCancel={() => navigate("/books")}
    />
  );
}

export default BookManagement;
