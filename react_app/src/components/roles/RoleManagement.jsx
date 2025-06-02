import React, { useState } from 'react';

const RoleManagement = () => {
  const defaultRoles = [
    "Admin", 
    "Acquisition", 
    "Processing (Cataloguing)", 
    "Orientation", 
    "Intern"
  ];
  
  const [roles, setRoles] = useState(defaultRoles);
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [roleName, setRoleName] = useState("Admin");
  
  // Define permissions categories and specific permissions
  const permissionCategories = {
    "Books Management": [
      "View Books", "Add Books", "Edit Books", "Delete Books", 
      "Manage Categories", "Approve Book Requests"
    ],
    "User Management": [
      "View Users", "Add Users", "Edit Users", "Delete Users", 
      "Reset User Passwords"
    ],
    "Loans & Returns": [
      "Issue Books", "Return Books", "Renew Loans", 
      "Manage Reservations", "Manage Fines"
    ],
    "Reports & Analytics": [
      "View Reports", "Generate Reports", "Export Data"
    ],
    "System Settings": [
      "Manage Roles", "Edit System Settings", "View Logs", 
      "Backup/Restore"
    ]
  };
  
  // Set up checked state for permissions
  const [permissions, setPermissions] = useState(() => {
    const initialPermissions = {};
    Object.keys(permissionCategories).forEach(category => {
      permissionCategories[category].forEach(perm => {
        // Admin has all permissions by default
        initialPermissions[`${category}:${perm}`] = selectedRole === "Admin";
      });
    });
    return initialPermissions;
  });
  
  // Handle permission change
  const handlePermissionChange = (category, permission) => {
    const key = `${category}:${permission}`;
    setPermissions({
      ...permissions,
      [key]: !permissions[key]
    });
  };
  
  // Add new role
  const handleAddRole = () => {
    const newRole = window.prompt("Enter new role name:");
    if (newRole && !roles.includes(newRole)) {
      setRoles([...roles, newRole]);
      setSelectedRole(newRole);
      setRoleName(newRole);
    }
  };
  
  // Delete role
  const handleDeleteRole = () => {
    if (selectedRole === "Admin") {
      alert("Admin role cannot be deleted.");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the ${selectedRole} role?`)) {
      const newRoles = roles.filter(role => role !== selectedRole);
      setRoles(newRoles);
      setSelectedRole(newRoles[0]);
      setRoleName(newRoles[0]);
    }
  };
  
  // Save changes
  const handleSaveChanges = () => {
    if (!roleName.trim()) {
      alert("Role name cannot be empty.");
      return;
    }
    
    // Update role name if changed
    if (roleName !== selectedRole) {
      const index = roles.indexOf(selectedRole);
      const newRoles = [...roles];
      newRoles[index] = roleName;
      setRoles(newRoles);
      setSelectedRole(roleName);
    }
    
    // Here you would typically save permissions to your backend
    alert(`Changes saved for role: ${roleName}`);
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Role Management</h2>
      <p className="text-gray-500 mb-6">Define and customize roles with specific permissions</p>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Role selector */}
        <div className="w-full md:w-64 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-700">Available Roles</h3>
          </div>
          <ul className="py-2">
            {roles.map(role => (
              <li key={role}>
                <button
                  onClick={() => {
                    setSelectedRole(role);
                    setRoleName(role);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    selectedRole === role ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : ''
                  }`}
                >
                  {role}
                </button>
              </li>
            ))}
          </ul>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleAddRole}
              className="w-full flex items-center justify-center px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add New Role
            </button>
          </div>
        </div>
        
        {/* Role editor */}
        <div className="flex-1 border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <label htmlFor="roleName" className="block font-medium text-gray-700 mr-3">
                Role Name:
              </label>
              <input
                type="text"
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-medium text-gray-700 mb-4">Permissions</h3>
            
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {Object.keys(permissionCategories).map(category => (
                <div key={category} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permissionCategories[category].map(permission => (
                      <div key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${category}-${permission}`}
                          checked={permissions[`${category}:${permission}`] || false}
                          onChange={() => handlePermissionChange(category, permission)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`${category}-${permission}`} className="ml-2 text-sm text-gray-700">
                          {permission}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 flex justify-end space-x-4">
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
            <button
              onClick={handleDeleteRole}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;