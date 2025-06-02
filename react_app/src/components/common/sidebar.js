// src/components/common/sidebar.js - Updated version
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Menu items configuration
  const menuItems = [
    { name: "Dashboard", icon: "📊", path: "/" },
    { name: "Books", icon: "📚", path: "/books" },
    { name: "Students", icon: "👥", path: "/students" },
    { name: "Borrowing", icon: "📖", path: "/borrowing" },
    { name: "Reservations", icon: "🗓️", path: "/reservations" },
  ];

  const handleLogout = async () => {
    // Use the logout function from AuthContext
    await logout();
    
    // Navigate to login page with replace to prevent going back
    navigate('/login', { replace: true });
  };

  // Bottom menu items with logout action
  const bottomMenuItems = [
    { name: "Settings", icon: "⚙️", path: "/settings" },
    { name: "Help Center", icon: "❓", path: "/help" },
    { 
      name: "Log Out", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-red-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      ),
      action: handleLogout
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm
      ${isCollapsed ? 'w-20' : 'w-64'} ${className}`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-blue-600">LibMS</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-blue-600 transition-colors"
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => {
            // Improved active path detection
            const isActive = location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${isCollapsed ? 'justify-center' : ''}
                  ${isActive
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'}`}
                >
                  <span className={`text-xl ${!isCollapsed && isActive ? 'mr-2' : !isCollapsed ? 'mr-3' : ''}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto border-t border-gray-200 pt-4 pb-6 px-3">
        <ul className="space-y-2">
          {bottomMenuItems.map((item) => {
            if (item.path) {
              // Navigation items
              const isActive = location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(item.path));

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isCollapsed ? 'justify-center' : ''}
                    ${isActive
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'}`}
                  >
                    <span className={`text-xl ${!isCollapsed && isActive ? 'mr-2' : !isCollapsed ? 'mr-3' : ''}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            } else {
              // Action items (logout)
              return (
                <li key="logout">
                  <button
                    onClick={item.action}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                      ${isCollapsed ? 'justify-center' : ''}
                      text-gray-700 hover:bg-gray-50 hover:text-red-600`}
                  >
                    <span className={`${!isCollapsed ? 'mr-3' : ''}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.name}</span>}
                  </button>
                </li>
              );
            }
          })}
        </ul>
      </div>
    </aside>
  );
};