// services/notificationApi.js
import axios from "axios";

const API_URL = "https://lms-backend-zjt1.onrender.com/api/notifications";

// Get all notifications for a student
export const getStudentNotifications = async (studentId) => {
  try {
    const response = await axios.get(API_URL, {
      params: { studentId },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

// Get unread notifications count for a student
export const getUnreadNotificationsCount = async (studentId) => {
  try {
    const response = await axios.get(`${API_URL}/unread/count`, {
      params: { studentId },
    });
    return response.data.count;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

// Get a single notification
export const getNotification = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching notification ${id}:`, error);
    throw error;
  }
};

// Create a notification
export const createNotification = async (notificationData) => {
  try {
    const response = await axios.post(API_URL, notificationData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/read`);
    return response.data.data;
  } catch (error) {
    console.error(`Error marking notification ${id} as read:`, error);
    throw error;
  }
};

// Mark all notifications as read for a student
export const markAllAsRead = async (studentId) => {
  try {
    const response = await axios.put(`${API_URL}/read-all`, { studentId });
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting notification ${id}:`, error);
    throw error;
  }
};
