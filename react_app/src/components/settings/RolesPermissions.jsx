import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RoleManagement from '../roles/RoleManagement';
import BatchRoleEdit from '../roles/BatchRoleEdit';
import TaskModification from '../roles/TaskModification';

const RolesPermissions = () => {
  const [activeTab, setActiveTab] = useState('roles');
  
  const tabs = [
    { id: 'roles', name: 'Role Management' },
    { id: 'batch', name: 'Batch Edit User Roles' },
    { id: 'tasks', name: 'Task Modification' }
  ];
  
  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'roles' && <RoleManagement />}
        {activeTab === 'batch' && <BatchRoleEdit />}
        {activeTab === 'tasks' && <TaskModification />}
      </div>
    </div>
  );
};

export default RolesPermissions;