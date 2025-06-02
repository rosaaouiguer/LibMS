// services/borrowingApi.js
import axios from "axios";

const API_URL = "https://lms-backend-zjt1.onrender.com/api/borrowings";

/**
 * Borrow a book
 * @param {Object} borrowingData - Contains bookId, studentId, lendingCondition, dueDate
 * @returns {Promise<Object>} - The created borrowing record
 */
export const borrowBook = async (borrowingData) => {
  try {
    const response = await axios.post(API_URL, borrowingData);

    // Check if the API call was successful
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to lend book");
    }
  } catch (error) {
    console.error("Error lending book:", error);
    // Re-throw the error with the server's error message if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

/**
 * Return a borrowed book
 * @param {String} borrowingId - The borrowing record ID
 * @param {Object} returnData - Contains returnCondition
 * @returns {Promise<Object>} - The updated borrowing record
 */
export const returnBook = async (borrowingId, returnData) => {
  try {
    const response = await axios.put(
      `${API_URL}/${borrowingId}/return`,
      returnData
    );

    // Check if the API call was successful
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to return book");
    }
  } catch (error) {
    console.error("Error returning book:", error);
    // Re-throw the error with the server's error message if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

/**
 * Update a borrowing record (for renewing loans)
 * @param {String} borrowingId - The borrowing record ID
 * @param {Object} updateData - Data to update (dueDate, status, etc.)
 * @returns {Promise<Object>} - The updated borrowing record
 */
export const updateBorrowing = async (borrowingId, updateData) => {
  try {
    const response = await axios.put(`${API_URL}/${borrowingId}`, updateData);

    // Check if the API call was successful
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to update borrowing");
    }
  } catch (error) {
    console.error("Error updating borrowing:", error);
    // Re-throw the error with the server's error message if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

/**
 * Get all borrowing records
 * @returns {Promise<Array>} - Array of borrowing records
 */
export const getAllBorrowings = async () => {
  try {
    const response = await axios.get(API_URL);

    // Check if the API call was successful
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch borrowings");
    }
  } catch (error) {
    console.error("Error fetching borrowings:", error);
    throw error;
  }
};

/**
 * Get borrowing records for a specific student
 * @param {String} studentId - The student ID
 * @returns {Promise<Array>} - Array of borrowing records
 */
export const getStudentBorrowings = async (studentId) => {
  try {
    const response = await axios.get(`${API_URL}/student/${studentId}`);

    // Check if the API call was successful
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch student borrowings"
      );
    }
  } catch (error) {
    console.error(`Error fetching borrowings for student ${studentId}:`, error);
    throw error;
  }
};

/**
 * Get borrowing history for a specific book
 * @param {String} bookId - The book ID
 * @returns {Promise<Array>} - Array of borrowing records
 */
export const getBookBorrowings = async (bookId) => {
  try {
    const response = await axios.get(`${API_URL}/book/${bookId}`);

    // Check if the API call was successful
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch book borrowings"
      );
    }
  } catch (error) {
    console.error(`Error fetching borrowings for book ${bookId}:`, error);
    throw error;
  }
};
// Add to services/borrowingApi.js file
/**
 * Delete a borrowing record
 * @param {String} borrowingId - The borrowing record ID
 * @returns {Promise<Object>} - The delete operation result
 */
export const deleteBorrowing = async (borrowingId) => {
  try {
    const response = await axios.delete(`${API_URL}/${borrowingId}`);

    // Check if the API call was successful
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to delete borrowing record"
      );
    }
  } catch (error) {
    console.error("Error deleting borrowing:", error);
    // Re-throw the error with the server's error message if available
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

// Add to services/borrowingApi.js file

/**
 * Check if a student can borrow more books
 * @param {String} studentId - The student ID
 * @returns {Promise<Object>} - Object containing canBorrow flag and borrowingInfo
 */
export const canStudentBorrow = async (studentId) => {
  try {
    // Get student's current borrowings
    const borrowings = await getStudentBorrowings(studentId);

    // Filter to only include active borrowings (Borrowed or Overdue)
    const activeBorrowings = borrowings.filter(
      (borrowing) =>
        borrowing.status === "Borrowed" || borrowing.status === "Overdue"
    );

    // Get student details to check category borrowing limit
    const studentResponse = await axios.get(
      `https://lms-backend-zjt1.onrender.com/api/student/${studentId}`
    );
    const student = studentResponse.data.data;

    // Check if student has a category and borrowing limit
    const borrowingLimit = student.category?.borrowingLimit || 2; // Default to 2 if not specified

    const canBorrow = activeBorrowings.length < borrowingLimit;

    return {
      canBorrow,
      borrowingInfo: {
        current: activeBorrowings.length,
        limit: borrowingLimit,
        remaining: borrowingLimit - activeBorrowings.length,
      },
    };
  } catch (error) {
    console.error("Error checking if student can borrow:", error);
    throw error;
  }
};

// Make sure to export the new function in the default export
export default {
  borrowBook,
  returnBook,
  updateBorrowing,
  getAllBorrowings,
  getStudentBorrowings,
  getBookBorrowings,
  deleteBorrowing,
  canStudentBorrow, // Add this line
};
