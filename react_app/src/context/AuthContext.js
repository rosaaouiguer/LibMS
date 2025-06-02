// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

// Create the context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      // Set auth header for all future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        // Fetch current user data (optional but recommended)
        const response = await axios.get(
          "https://lms-backend-zjt1.onrender.com/api/auth/me"
        );
        setUser(response.data.data);
      } catch (err) {
        // If the token is invalid or expired, clear it
        console.error("Auth token validation failed:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["Authorization"];
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    setError(null);

    try {
      const response = await axios.post(
        "https://lms-backend-zjt1.onrender.com/api/auth/login",
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;

      // Save token to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Set auth header for all future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint if available (optional)
      const token = localStorage.getItem("token");
      if (token) {
        await axios.get(
          "https://lms-backend-zjt1.onrender.com/api/auth/logout",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clean up local storage and state
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);

      // Notify other components
      window.dispatchEvent(new Event("user-logout"));
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!user || !!localStorage.getItem("token");

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
