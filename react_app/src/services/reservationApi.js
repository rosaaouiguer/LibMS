import axios from "axios";
const API_URL = "https://lms-backend-zjt1.onrender.com/api";

// Get all reservations
export const getAllReservations = async () => {
  try {
    const response = await axios.get(`${API_URL}/reservations`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get a specific reservation by ID
export const getReservationById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/reservations/${id}`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create a new reservation
export const createReservation = async (reservationData) => {
  try {
    const response = await axios.post(
      `${API_URL}/reservations`,
      reservationData
    );
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update reservation status
export const updateReservationStatus = async (id, status) => {
  try {
    const response = await axios.put(`${API_URL}/reservations/${id}/status`, {
      status,
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Cancel a reservation
export const cancelReservation = async (id) => {
  try {
    const response = await axios.put(
      `${API_URL}/reservations/${id}/cancel`,
      {}
    );
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get reservations for a specific book
export const getReservationsByBook = async (bookId) => {
  try {
    const response = await axios.get(`${API_URL}/reservations/book/${bookId}`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Process a book return and update related reservations
export const processBookReturn = async (bookId) => {
  try {
    const response = await axios.put(
      `${API_URL}/reservations/process-return/${bookId}`,
      {}
    );
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get expired reservations
export const getExpiredReservations = async () => {
  try {
    const response = await axios.get(`${API_URL}/reservations/expired`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Process expired reservations
export const processExpiredReservations = async () => {
  try {
    const response = await axios.put(
      `${API_URL}/reservations/process-expired`,
      {}
    );
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Check out a reserved book
export const checkoutReservation = async (reservationId, body = {}) => {
  try {
    const response = await axios.delete(
      `${API_URL}/reservations/${reservationId}/checkout`,
      {
        data: body,
      }
    );
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get reservations by student
export const getReservationsByStudent = async (studentId) => {
  try {
    const response = await axios.get(
      `${API_URL}/reservations/student/${studentId}`
    );
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get pickup-ready reservations
export const getPickupReadyReservations = async () => {
  try {
    const response = await axios.get(`${API_URL}/reservations/pickup-ready`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const extendReservation = async (id, additionalDays) => {
  try {
    const response = await axios.put(`${API_URL}/reservations/${id}/extend`, {
      additionalDays,
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
// Delete a reservation
export const deleteReservation = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/reservations/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
