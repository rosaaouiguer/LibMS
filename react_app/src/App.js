// src/App.js - Updated version
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/StudentsPage';
import BorrowingPage from './pages/BorrowingPage';
import Authentication from './pages/Authentication';
import { Sidebar } from './components/common/sidebar';
import BookManagement from './pages/BookManagement';
import SettingsPage from './pages/SettingsPage';
import HelpCenterPage from './pages/HelpCenterPage';
import ExportData from './components/settings/ExportData';
import ReservationPage from './pages/ReservationPage';
import PrivateRoute from './components/PrivateRoute';
import UserProfile from './pages/UserProfile';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {isAuthenticated && <Sidebar />}

      <main className={`${isAuthenticated ? 'flex-1' : 'w-full'} overflow-auto`}>
        <Routes>
          {/* Public route */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" /> : <Authentication />
            }
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/students"
            element={
              <PrivateRoute>
                <StudentsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/books/*"
            element={
              <PrivateRoute>
                <BookManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/borrowing"
            element={
              <PrivateRoute>
                <BorrowingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings/*"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/reservations/*"
            element={
              <PrivateRoute>
                <ReservationPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/help"
            element={
              <PrivateRoute>
                <HelpCenterPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/export"
            element={
              <PrivateRoute>
                <ExportData />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />

          {/* Catch-all */}
          <Route
            path="*"
            element={
              isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;