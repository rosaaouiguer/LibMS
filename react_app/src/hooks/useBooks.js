// src/hooks/useBooks.js
import { useState, useEffect } from "react";
import axios from "axios";

export const useBooks = (page = 1, limit = 12, searchQuery = "") => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit,
          ...(searchQuery && { search: searchQuery }),
        };

        const response = await axios.get(
          "https://lms-backend-zjt1.onrender.com/api/books",
          { params }
        );
        setBooks(response.data.data);
        setFilteredBooks(response.data.data);
        setTotalPages(Math.ceil(response.data.total / limit));
        setTotalBooks(response.data.total);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch books");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [page, limit, searchQuery]);

  return {
    books,
    filteredBooks,
    loading,
    error,
    totalPages,
    totalBooks,
    setBooks,
    setFilteredBooks,
  };
};
