import axios from "axios";

/**
 * Library Rules API Service
 *
 * This service provides methods for interacting with the Library Rules API endpoints.
 * It handles all CRUD operations for library rules management.
 */

// Base API URL - modify this based on your environment setup
const API_BASE_URL = "https://lms-backend-zjt1.onrender.com/api/libraryrules";

// Request timeout in milliseconds
const TIMEOUT = 10000;

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Error handler to process API errors
 * @param {Error} error - The error object from axios
 * @returns {Promise} - Rejected promise with formatted error message
 */
const handleError = (error) => {
  let errorMessage = "An unexpected error occurred";

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (error.response.data && error.response.data.error) {
      errorMessage = error.response.data.error;
    } else {
      errorMessage = `Server error: ${error.response.status}`;
    }
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage =
      "No response received from server. Please check your connection.";
  }

  console.error("API Error:", errorMessage, error);
  return Promise.reject(errorMessage);
};

/**
 * Library Rules API Service
 */
const LibraryRulesAPI = {
  /**
   * Get all library rules
   * @returns {Promise<Array>} - Promise resolving to array of rule objects
   */
  getAllRules: async () => {
    try {
      const response = await apiClient.get("/");
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get a specific rule by ID
   * @param {string} id - Rule ID
   * @returns {Promise<Object>} - Promise resolving to rule object
   */
  getRuleById: async (id) => {
    try {
      const response = await apiClient.get(`/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create a new library rule
   * @param {Object} ruleData - Rule data object
   * @param {string} ruleData.title - Rule title
   * @param {string} ruleData.category - Rule category
   * @param {string} ruleData.description - Rule description
   * @returns {Promise<Object>} - Promise resolving to created rule object
   */
  createRule: async (ruleData) => {
    try {
      const response = await apiClient.post("/", ruleData);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update an existing library rule
   * @param {string} id - Rule ID
   * @param {Object} ruleData - Updated rule data
   * @returns {Promise<Object>} - Promise resolving to updated rule object
   */
  updateRule: async (id, ruleData) => {
    try {
      const response = await apiClient.put(`/${id}`, ruleData);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete a library rule
   * @param {string} id - Rule ID
   * @returns {Promise<void>} - Promise resolving when rule is deleted
   */
  deleteRule: async (id) => {
    try {
      await apiClient.delete(`/${id}`);
      return true;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get rules filtered by category
   * @param {string} category - Category to filter by
   * @returns {Promise<Array>} - Promise resolving to array of rule objects
   */
  getRulesByCategory: async (category) => {
    try {
      // This assumes your backend supports query parameters for filtering
      // You might need to implement this endpoint on your backend
      const response = await apiClient.get(`/?category=${category}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Search rules by text query
   * @param {string} query - Search query text
   * @returns {Promise<Array>} - Promise resolving to array of matching rule objects
   */
  searchRules: async (query) => {
    try {
      // This assumes your backend supports query parameters for searching
      // You might need to implement this endpoint on your backend
      const response = await apiClient.get(
        `/?search=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};

export default LibraryRulesAPI;
