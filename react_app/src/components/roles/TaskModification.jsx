import React, { useState } from 'react';

const TaskModification = () => {
  const roles = ["Admin", "Acquisition", "Processing", "Orientation", "Intern"];
  
  // Sample tasks
  const tasks = [
    "Book Processing", "Borrowing Management", "Returns Processing", 
    "User Registration", "Report Generation", "Budget Management",
    "Professor Communications", "Inventory Updates", "Catalog Maintenance"
  ];
  
  // Create initial permissions state
  const [taskPermissions, setTaskPermissions] = useState(() => {
    const initialState = {};
    
    tasks.forEach(task => {
      initialState[task] = {};
      
      roles.forEach(role => {
        // Admin has all tasks by default
        if (role === "Admin") {
          initialState[task][role] = true;
        } 
        // Acquisition role default tasks
        else if (role === "Acquisition" && 
                ["Budget Management", "Professor Communications", "Inventory Updates", "Report Generation"].includes(task)) {
          initialState[task][role] = true;
        }
        // Processing role default tasks
        else if (role === "Processing" && 
                ["Book Processing", "Catalog Maintenance"].includes(task)) {
          initialState[task][role] = true;
        }
        // Orientation role default tasks
        else if (role === "Orientation" && 
                ["Borrowing Management", "Returns Processing", "User Registration"].includes(task)) {
          initialState[task][role] = true;
        }
        else {
          initialState[task][role] = false;
        }
      });
    });
    
    return initialState;
  });
  
  // Toggle task permission
  const togglePermission = (task, role) => {
    setTaskPermissions(prev => ({
      ...prev,
      [task]: {
        ...prev[task],
        [role]: !prev[task][role]
      }
    }));
  };
  
  // Save task settings
  const saveTaskSettings = () => {
    alert('Task settings saved successfully!');
    // Here you would typically update your backend
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Task Modification</h2>
      <p className="text-gray-500 mb-6">Configure tasks available to each role</p>
      
      <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                {roles.map(role => (
                  <th key={role} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map(task => (
                <tr key={task} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {task}
                  </td>
                  {roles.map(role => (
                    <td key={`${task}-${role}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <input
                        type="checkbox"
                        checked={taskPermissions[task][role] || false}
                        onChange={() => togglePermission(task, role)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={saveTaskSettings}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Task Settings
        </button>
      </div>
    </div>
  );
};

export default TaskModification;