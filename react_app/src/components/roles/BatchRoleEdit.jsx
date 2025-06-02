import React, { useState } from 'react';

const BatchRoleEdit = () => {
  const sampleUsers = [
    "Alice Johnson (alice@library.edu)",
    "Bob Smith (bob@library.edu)",
    "Charlie Davis (charlie@library.edu)",
    "Dana White (dana@library.edu)",
    "Evan Brown (evan@library.edu)"
  ];
  
  const availableRoles = [
    "Admin", "Acquisition", "Processing (Cataloguing)", "Orientation", "Intern"
  ];
  
  const [users, setUsers] = useState(sampleUsers.map(user => ({
    name: user,
    selected: false
  })));
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState(availableRoles[0]);
  
  // Filter users based on search query
  const filteredUsers = searchQuery 
    ? users.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;
  
  // Toggle user selection
  const toggleUser = (index) => {
    const updatedUsers = [...users];
    updatedUsers[index].selected = !updatedUsers[index].selected;
    setUsers(updatedUsers);
  };
  
  // Select all users
  const selectAll = () => {
    setUsers(users.map(user => ({ ...user, selected: true })));
  };
  
  // Deselect all users
  const deselectAll = () => {
    setUsers(users.map(user => ({ ...user, selected: false })));
  };
  
  // Assign role to selected users
  const assignRole = () => {
    const selectedUsers = users.filter(user => user.selected);
    if (selectedUsers.length === 0) {
      alert("Please select at least one user.");
      return;
    }
    
    alert(`Role "${selectedRole}" assigned to ${selectedUsers.length} user(s)`);
    // Here you would typically update your backend
  };
  
  // Remove role from selected users
  const removeRole = () => {
    const selectedUsers = users.filter(user => user.selected);
    if (selectedUsers.length === 0) {
      alert("Please select at least one user.");
      return;
    }
    
    alert(`Role "${selectedRole}" removed from ${selectedUsers.length} user(s)`);
    // Here you would typically update your backend
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Batch Edit User Roles</h2>
      <p className="text-gray-500 mb-6">Assign or remove roles for multiple users simultaneously</p>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Users selector */}
        <div className="flex-1 border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-700 mb-3">Select Users</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-72">
            <ul className="divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <li key={index} className="hover:bg-gray-50">
                  <div className="flex items-center px-4 py-3">
                    <input
                      type="checkbox"
                      checked={user.selected}
                      onChange={() => toggleUser(index)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-sm text-gray-700">{user.name}</label>
                  </div>
                </li>
              ))}
              {filteredUsers.length === 0 && (
                <li className="px-4 py-3 text-sm text-gray-500 italic">No users found</li>
              )}
            </ul>
          </div>
          
          <div className="p-4 border-t border-gray-200 flex space-x-4">
            <button
              onClick={selectAll}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none"
            >
              Deselect All
            </button>
          </div>
        </div>
        
        {/* Role assignment */}
        <div className="w-full md:w-1/3 border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-700">Assign Roles</h3>
          </div>
          
          <div className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Role:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            
            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Actions:
              </label>
              
              <button
                onClick={assignRole}
                className="w-full mb-3 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Assign Selected Role
              </button>
              
              <button
                onClick={removeRole}
                className="w-full px-4 py-3 border border-red-500 text-red-500 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Remove Selected Role
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchRoleEdit;