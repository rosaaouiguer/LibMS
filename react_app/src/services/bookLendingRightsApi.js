import axios from "axios";
const API_URL = "https://lms-backend-zjt1.onrender.com/api";

/**
 * Gets all book lending rights
 * @returns {Promise<Array>} - Array of book lending rights objects
 */
export const getAllBookLendingRights = async () => {
  try {
    const response = await axios.get(`${API_URL}/book-lending-rights`);

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch book lending rights"
      );
    }
  } catch (error) {
    console.error("Error fetching book lending rights:", error);
    throw error;
  }
};

/**
 * Gets lending rights for a specific book
 * @param {String} bookId - The book ID
 * @returns {Promise<Object>} - The book lending rights object
 */
export const getLendingRightsByBookId = async (bookId) => {
  try {
    const response = await axios.get(
      `${API_URL}/book-lending-rights/book/${bookId}`
    );

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Failed to fetch book lending rights"
      );
    }
  } catch (error) {
    // If a 404 is returned, it means no lending rights exist for this book
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error(`Error fetching lending rights for book ${bookId}:`, error);
    throw error;
  }
};

/**
 * Creates book lending rights
 * @param {Object} rightsData - The lending rights data
 * @returns {Promise<Object>} - The created book lending rights
 */
export const createBookLendingRights = async (rightsData) => {
  try {
    const payload = {
      bookId: rightsData.book_id,
      bookTitle: rightsData.book_title,
      loanDuration: rightsData.loanDuration,
      loanExtensionAllowed: rightsData.allowExtensions,
      extensionLimit: rightsData.maxExtensions,
      extensionDuration: rightsData.extensionDuration,
    };

    const response = await axios.post(
      `${API_URL}/book-lending-rights`,
      payload
    );

    if (response.data.success) {
      // Return the full lending rights object that matches the schema
      return {
        _id: response.data.data._id,
        bookId: response.data.data.bookId,
        loanDuration: response.data.data.loanDuration,
        loanExtensionAllowed: response.data.data.loanExtensionAllowed,
        extensionLimit: response.data.data.extensionLimit,
        extensionDuration: response.data.data.extensionDuration,
      };
    } else {
      throw new Error(
        response.data.message || "Failed to create book lending rights"
      );
    }
  } catch (error) {
    console.error("Error creating book lending rights:", error);
    throw error;
  }
};

/**
 * Updates book lending rights
 * @param {String} id - The lending rights ID
 * @param {Object} rightsData - The updated lending rights data
 * @returns {Promise<Object>} - The updated book lending rights
 */
export const updateBookLendingRights = async (id, rightsData) => {
  try {
    const payload = {
      loanDuration: rightsData.loanDuration,
      loanExtensionAllowed: rightsData.loanExtensionAllowed,
      extensionLimit: rightsData.extensionLimit,
      extensionDuration: rightsData.extensionDuration,
    };

    const response = await axios.put(
      `${API_URL}/book-lending-rights/${id}`,
      payload
    );

    if (response.data.success) {
      // Return the full updated lending rights object
      return {
        _id: response.data.data._id,
        bookId: response.data.data.bookId,
        loanDuration: response.data.data.loanDuration,
        loanExtensionAllowed: response.data.data.loanExtensionAllowed,
        extensionLimit: response.data.data.extensionLimit,
        extensionDuration: response.data.data.extensionDuration,
      };
    } else {
      throw new Error(
        response.data.message || "Failed to update book lending rights"
      );
    }
  } catch (error) {
    console.error(`Error updating lending rights with ID ${id}:`, error);
    throw error;
  }
};
/**
 * Deletes book lending rights
 * @param {String} id - The lending rights ID
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export const deleteBookLendingRights = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/book-lending-rights/${id}`);

    return response.data.success === true;
  } catch (error) {
    console.error(`Error deleting lending rights with ID ${id}:`, error);
    throw error;
  }
};

export default {
  getAllBookLendingRights,
  getLendingRightsByBookId,
  createBookLendingRights,
  updateBookLendingRights,
  deleteBookLendingRights,
};
