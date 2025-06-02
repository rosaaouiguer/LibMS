import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Optional: dispatch event so App.jsx knows to update state
    window.dispatchEvent(new Event('user-logout'));

    // Navigate to login page
    navigate('/login');
  };

  if (!token || !user) {
    return (
      <div className="p-4 text-center text-red-600">
        You are not authenticated. Please <a href="/login" className="underline text-blue-600">log in</a>.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>ID:</strong> {user.id}</p>

      <button
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default UserProfile;
