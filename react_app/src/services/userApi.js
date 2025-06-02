import axios from "axios";

/**
 * User API Service
 *
 * Handles all user-related API calls (CRUD operations for staff members)
 */

const API_BASE_URL = "https://lms-backend-zjt1.onrender.com/api/user";
const TIMEOUT = 10000;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleError = (error) => {
  let errorMessage = "An unexpected error occurred";

  if (error.response) {
    errorMessage =
      error.response.data?.message ||
      error.response.data?.error ||
      `Server error: ${error.response.status}`;
  } else if (error.request) {
    errorMessage = "No response received from server";
  }

  console.error("User API Error:", errorMessage);
  return Promise.reject(errorMessage);
};

const UserAPI = {
  /**
   * Get all users (staff members)
   * @returns {Promise<Array>} Array of user objects
   */
  getAllUsers: async () => {
    try {
      const response = await apiClient.get("/");
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create a new user (staff member)
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user object
   */
  createUser: async (userData) => {
    try {
      const response = await apiClient.post("/", userData);
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update a user
   * @param {string} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user object
   */
  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(`/${id}`, userData);
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if successful
   */
  deleteUser: async (id) => {
    try {
      await apiClient.delete(`/${id}`);
      return true;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Change user role
   * @param {string} id - User ID
   * @param {string} roleId - New role ID
   * @returns {Promise<Object>} Updated user object
   */
  changeUserRole: async (id, roleId) => {
    try {
      const response = await apiClient.put(`/${id}/role`, { roleId });
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Reset user password (admin function)
   * @param {string} id - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} True if successful
   */
  resetPassword: async (id, newPassword) => {
    try {
      await apiClient.put(`/${id}`, { password: newPassword });
      return true;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get all available roles
   * @returns {Promise<Array>} Array of role objects
   */
  getRoles: async () => {
    try {
      console.log(localStorage.getItem("token"));
      const response = await axios.get(
        "https://lms-backend-zjt1.onrender.com/api/roles",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },
};

export default UserAPI;
