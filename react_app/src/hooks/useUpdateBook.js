// src/hooks/useUpdateBook.js
import { useState } from "react";

const useUpdateBook = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateBook = async (updatedBook) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://lms-backend-zjt1.onrender.com/api/books/${updatedBook._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedBook),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update book");
      }

      return result.data; // The updated book
    } catch (err) {
      setError(err.message);
      console.error("Error updating book:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateBook, loading, error };
};

export default useUpdateBook;
