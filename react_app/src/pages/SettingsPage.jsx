import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import RolesPermissions from '../components/settings/RolesPermissions';
import StaffMembers from '../components/settings/StaffMembers';
import StudentCategories from '../components/settings/StudentCategories';
import LibraryRules from '../components/settings/LibraryRules';
import ActivityLogs from '../components/settings/ActivityLogs';
import ImportData from '../components/settings/ImportData';
import { Import } from 'lucide-react';


const SettingsPage = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Settings navigation items with icons
  const settingsNavItems = [
    { name: 'Roles & Permissions', path: '/settings/roles' },
    { name: 'Staff Members', path: '/settings/staff' },
    { name: 'Student Categories', path: '/settings/student-categories' },
    { name: 'Library Rules', path: '/settings/library-rules' },
    { name: 'Activity Logs', path: '/settings/logs' },
    { name: 'Import Data', path: '/settings/import' },
  ];

  // Find current active section
  const activeSection = settingsNavItems.find(item => 
    pathname === item.path || pathname.startsWith(item.path)
  ) || settingsNavItems[0];

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white rounded-t-lg shadow-lg">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="mt-2 text-blue-100">Configure system roles, permissions, and manage staff members, student categories, and library rules</p>
      </div>
      
      {/* Horizontal Navigation Tabs */}
      <div className="flex justify-between bg-gray-50 shadow-md">
        {settingsNavItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path);
          
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex flex-1 flex-col items-center justify-center px-8 py-4 transition-all duration-200 relative
                ${isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-500'}`}
            >
              <span className="font-medium text-sm">{item.name}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600"></div>
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Content Area with Animated Transitions */}
      <div className="flex-1 bg-white rounded-b-lg shadow-md p-8 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/settings/roles" replace />} />
          <Route path="/roles/*" element={<RolesPermissions />} />
          <Route path="/staff" element={<StaffMembers />} />
          <Route path="/student-categories" element={<StudentCategories />} />
          <Route path="/library-rules" element={<LibraryRules />} />
          <Route path="/logs" element={<ActivityLogs />} />
          <Route path="/import" element={<ImportData />} />
        </Routes>
      </div>
    </div>
  );
};

export default SettingsPage;