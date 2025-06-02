// hooks/useDeleteBook.js
import { useState, useCallback } from "react";

/**
 * Hook for handling book deletion with proper error handling
 * @returns {Object} Object containing deleteBook function and error state
 */
const useDeleteBook = () => {
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteBook = useCallback(async (id) => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `https://lms-backend-zjt1.onrender.com/api/books/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        // Try to parse the error message from the response
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          (response.status === 400
            ? "Cannot delete book with active borrowings"
            : "Failed to delete the book");

        throw new Error(errorMessage);
      }

      return true;
    } catch (error) {
      console.error("Error deleting book:", error);
      setError(error.message || "An unknown error occurred");
      throw error; // Re-throw so component can handle it if needed
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteBook, error, isDeleting, clearError: () => setError(null) };
};

export default useDeleteBook;
