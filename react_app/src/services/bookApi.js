import axios from "axios";
const API_URL = "https://lms-backend-zjt1.onrender.com/api";

/**
 * Gets all books from the API
 * @param {Object} params - Optional query parameters
 * @returns {Promise<Array>} - Array of book objects
 */
export const getAllBooks = async (params = {}) => {
  try {
    // Convert params object to URL query string
    const queryParams = new URLSearchParams();

    // Add any params to the query string
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });

    // Build URL with query params if any exist
    const url = `${API_URL}/books${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await axios.get(url);

    // Check if the API call was successful
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch books");
    }
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

/**
 * Gets a book by ID
 * @param {String} id - The book ID
 * @returns {Promise<Object>} - A book object
 */
export const getBookById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/books/${id}`);

    // Check if the API call was successful
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch book");
    }
  } catch (error) {
    console.error(`Error fetching book with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Gets a book by ISBN
 * @param {String} isbn - The book ISBN
 * @returns {Promise<Object>} - A book object
 */
export const getBookByIsbn = async (isbn) => {
  try {
    // We'll use the query parameter approach to search by ISBN
    const response = await axios.get(`${API_URL}/books`, {
      params: { isbn },
    });

    // Check if the API call was successful
    if (response.data.success) {
      // Since ISBN should be unique, we'll return the first match
      const books = response.data.data;
      if (books && books.length > 0) {
        return books[0];
      } else {
        throw new Error(`No book found with ISBN ${isbn}`);
      }
    } else {
      throw new Error(response.data.message || "Failed to fetch book by ISBN");
    }
  } catch (error) {
    console.error(`Error fetching book with ISBN ${isbn}:`, error);
    throw error;
  }
};

/**
 * Creates a new book
 * @param {Object} bookData - The book data
 * @returns {Promise<Object>} - The created book
 */
export const createBook = async (bookData) => {
  try {
    const response = await axios.post(`${API_URL}/books`, bookData);

    // Check if the API call was successful
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to create book");
    }
  } catch (error) {
    console.error("Error creating book:", error);
    throw error;
  }
};

/**
 * Updates a book
 * @param {String} id - The book ID
 * @param {Object} bookData - The updated book data
 * @returns {Promise<Object>} - The updated book
 */
export const updateBook = async (id, bookData) => {
  try {
    const response = await axios.put(`${API_URL}/books/${id}`, bookData);

    // Check if the API call was successful
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to update book");
    }
  } catch (error) {
    console.error(`Error updating book with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes a book
 * @param {String} id - The book ID
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export const deleteBook = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/books/${id}`);

    // Check if the API call was successful
    return response.data.success === true;
  } catch (error) {
    console.error(`Error deleting book with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Updates book copies (add or remove)
 * @param {String} id - The book ID
 * @param {String} action - 'increment' or 'decrement'
 * @param {Number} count - Number of copies to add or remove
 * @returns {Promise<Object>} - The updated book
 */
export const updateBookCopies = async (id, action, count) => {
  try {
    // Get current book details
    const book = await getBookById(id);

    // Calculate new values based on the action
    let totalCopies = book.totalCopies;
    let availableCopies = book.availableCopies;

    if (action === "increment") {
      totalCopies += count;
      availableCopies += count;
    } else if (action === "decrement") {
      // Validate we're not removing more than available
      if (count > availableCopies) {
        throw new Error(
          `Cannot remove more than ${availableCopies} available copies`
        );
      }

      totalCopies -= count;
      availableCopies -= count;

      // Ensure we don't go below 1 total copy
      if (totalCopies < 1) {
        throw new Error("Total copies cannot be less than 1");
      }
    }

    // Update the book with new copy counts
    return await updateBook(id, {
      totalCopies,
      availableCopies,
    });
  } catch (error) {
    console.error(`Error updating copies for book ${id}:`, error);
    throw error;
  }
};

/**
 * Updates book copies by ISBN (add or remove)
 * @param {String} isbn - The book ISBN
 * @param {String} action - 'increment' or 'decrement'
 * @param {Number} count - Number of copies to add or remove
 * @returns {Promise<Object>} - The updated book
 */
export const updateBookCopiesByIsbn = async (isbn, action, count) => {
  try {
    // Get book by ISBN first
    const book = await getBookByIsbn(isbn);
    if (!book || !book._id) {
      throw new Error(`Book with ISBN ${isbn} not found`);
    }

    // Use the existing updateBookCopies function with the found ID
    return await updateBookCopies(book._id, action, count);
  } catch (error) {
    console.error(`Error updating copies for book with ISBN ${isbn}:`, error);
    throw error;
  }
};

export default {
  getAllBooks,
  getBookById,
  getBookByIsbn,
  createBook,
  updateBook,
  deleteBook,
  updateBookCopies,
  updateBookCopiesByIsbn,
};
