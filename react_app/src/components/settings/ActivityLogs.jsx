import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CheckSquare, Square, Download, Trash2, Search, Filter, Calendar, AlertTriangle, User, Tag } from 'lucide-react';

const ActivityLogs = () => {
  // Simulated log data - in a real app, this would come from an API
  const initialLogs = [
    {
      id: 1,
      timestamp: new Date('2025-04-30T14:32:15'),
      userId: 2,
      userName: 'Sophie Leclerc',
      userRole: 'Bibliothécaire',
      action: 'BOOK_ADDED',
      details: 'Added "The Great Gatsby" to the library collection',
      ipAddress: '192.168.1.45',
      severity: 'info'
    },
    {
      id: 2,
      timestamp: new Date('2025-04-30T12:15:22'),
      userId: 1,
      userName: 'Martin Dupont',
      userRole: 'Administrateur',
      action: 'USER_ADDED',
      details: 'Added new staff member "Claire Martin"',
      ipAddress: '192.168.1.12',
      severity: 'info'
    },
    {
      id: 3,
      timestamp: new Date('2025-04-30T10:48:35'),
      userId: 3,
      userName: 'Jean Moreau',
      userRole: 'Modérateur',
      action: 'PASSWORD_RESET',
      details: 'Reset password for user ID #18',
      ipAddress: '192.168.1.89',
      severity: 'warning'
    },
    {
      id: 4,
      timestamp: new Date('2025-04-29T16:23:42'),
      userId: 5,
      userName: 'Thomas Petit',
      userRole: 'Bibliothécaire',
      action: 'BOOK_ISSUED',
      details: 'Issued "1984" to student "Alex Dubois"',
      ipAddress: '192.168.1.76',
      severity: 'info'
    },
    {
      id: 5,
      timestamp: new Date('2025-04-29T14:12:18'),
      userId: 4,
      userName: 'Marie Dubois',
      userRole: 'Assistant',
      action: 'FINE_COLLECTED',
      details: 'Collected overdue fine of €3.50 from "Lucas Bernard"',
      ipAddress: '192.168.1.32',
      severity: 'info'
    },
    {
      id: 6,
      timestamp: new Date('2025-04-29T11:05:51'),
      userId: 1,
      userName: 'Martin Dupont',
      userRole: 'Administrateur',
      action: 'SETTINGS_CHANGED',
      details: 'Updated system settings: loan period changed to 21 days',
      ipAddress: '192.168.1.12',
      severity: 'warning'
    },
    {
      id: 7,
      timestamp: new Date('2025-04-28T15:45:23'),
      userId: 2,
      userName: 'Sophie Leclerc',
      userRole: 'Bibliothécaire',
      action: 'CATEGORY_ADDED',
      details: 'Added new book category "Science Fiction"',
      ipAddress: '192.168.1.45',
      severity: 'info'
    },
    {
      id: 8,
      timestamp: new Date('2025-04-28T13:21:37'),
      userId: 3,
      userName: 'Jean Moreau',
      userRole: 'Modérateur',
      action: 'USER_SUSPENDED',
      details: 'Suspended student account "Emma Laurent" for 7 days',
      ipAddress: '192.168.1.89',
      severity: 'error'
    },
    {
      id: 9,
      timestamp: new Date('2025-04-28T10:18:49'),
      userId: 5,
      userName: 'Thomas Petit',
      userRole: 'Bibliothécaire',
      action: 'BOOK_RETURNED',
      details: 'Processed return of "To Kill a Mockingbird" from "Sarah Lefebvre"',
      ipAddress: '192.168.1.76',
      severity: 'info'
    },
    {
      id: 10,
      timestamp: new Date('2025-04-27T16:54:12'),
      userId: 1,
      userName: 'Martin Dupont',
      userRole: 'Administrateur',
      action: 'BACKUP_CREATED',
      details: 'System backup created successfully',
      ipAddress: '192.168.1.12',
      severity: 'info'
    },
    {
      id: 11,
      timestamp: new Date('2025-04-27T14:32:05'),
      userId: 4,
      userName: 'Marie Dubois',
      userRole: 'Assistant',
      action: 'BOOK_RESERVATION',
      details: 'Reserved "Pride and Prejudice" for student "Marc Fournier"',
      ipAddress: '192.168.1.32',
      severity: 'info'
    },
    {
      id: 12,
      timestamp: new Date('2025-04-27T11:18:36'),
      userId: 2,
      userName: 'Sophie Leclerc',
      userRole: 'Bibliothécaire',
      action: 'LOGIN_FAILED',
      details: 'Failed login attempt for user "sophie.leclerc"',
      ipAddress: '192.168.1.99',
      severity: 'error'
    }
  ];

  // State for logs data
  const [logs, setLogs] = useState(initialLogs);
  const [filteredLogs, setFilteredLogs] = useState(initialLogs);
  
  // Selection state
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Extract unique users for filter dropdown
  const uniqueUsers = [...new Set(logs.map(log => log.userName))];
  
  // Extract unique actions for filter dropdown
  const uniqueActions = [...new Set(logs.map(log => log.action))];

  // Apply filters
  useEffect(() => {
    let filtered = [...logs];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.userName.toLowerCase().includes(query) || 
        log.details.toLowerCase().includes(query) || 
        log.action.toLowerCase().includes(query)
      );
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'today') {
        filtered = filtered.filter(log => {
          const logDate = new Date(log.timestamp);
          logDate.setHours(0, 0, 0, 0);
          return logDate.getTime() === today.getTime();
        });
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        filtered = filtered.filter(log => {
          const logDate = new Date(log.timestamp);
          logDate.setHours(0, 0, 0, 0);
          return logDate.getTime() === yesterday.getTime();
        });
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(log => log.timestamp >= weekAgo);
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(log => log.timestamp >= monthAgo);
      }
    }
    
    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }
    
    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.userName === userFilter);
    }
    
    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }
    
    setFilteredLogs(filtered);
    
    // Reset selections when filters change
    setSelectedLogs([]);
    setSelectAll(false);
  }, [logs, searchQuery, dateFilter, severityFilter, userFilter, actionFilter]);

  // Handle "select all" checkbox
  useEffect(() => {
    if (selectAll) {
      setSelectedLogs(filteredLogs.map(log => log.id));
    } else {
      setSelectedLogs([]);
    }
  }, [selectAll, filteredLogs]);

  // Toggle selection of a single log
  const toggleLogSelection = (logId) => {
    if (selectedLogs.includes(logId)) {
      setSelectedLogs(selectedLogs.filter(id => id !== logId));
    } else {
      setSelectedLogs([...selectedLogs, logId]);
    }
  };

  // Helper function to get severity badge
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'info':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Info
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Warning
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Error
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Critical
          </span>
        );
      default:
        return null;
    }
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), 'MMM d, yyyy HH:mm:ss');
  };

  // Helper function to get role badge
  const getRoleBadge = (role) => {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        {role}
      </span>
    );
  };

  // Export selected logs to CSV
  const exportToCSV = () => {
    if (selectedLogs.length === 0) {
      alert('Please select at least one log to export');
      return;
    }
    
    const logsToExport = filteredLogs.filter(log => selectedLogs.includes(log.id));
    const headers = ["ID", "Timestamp", "User", "Role", "Action", "Details", "Severity"];
    
    const csvContent = [
      headers.join(','),
      ...logsToExport.map(log => [
        log.id,
        formatTimestamp(log.timestamp),
        log.userName,
        log.userRole,
        log.action,
        `"${log.details.replace(/"/g, '""')}"`, // Escape quotes in CSV
        log.severity
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `activity_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete selected logs
  const deleteSelectedLogs = () => {
    if (selectedLogs.length === 0) {
      alert('Please select at least one log to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedLogs.length} selected logs? This action cannot be undone.`)) {
      const updatedLogs = logs.filter(log => !selectedLogs.includes(log.id));
      setLogs(updatedLogs);
      setSelectedLogs([]);
      setSelectAll(false);
    }
  };

  // Toggle all filter sections
  const toggleFilters = () => {
    setIsFilterExpanded(!isFilterExpanded);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Search and Action Buttons */}
      <div className="bg-white p-4 border-b border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search logs..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleFilters}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Filter className="h-4 w-4 mr-2" /> 
              {isFilterExpanded ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <button
              onClick={exportToCSV}
              disabled={selectedLogs.length === 0}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                selectedLogs.length > 0 
                  ? 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' 
                  : 'border border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            >
              <Download className="h-4 w-4 mr-2" /> 
              Export {selectedLogs.length > 0 ? `(${selectedLogs.length})` : ''}
            </button>
  
            <button
              onClick={deleteSelectedLogs}
              disabled={selectedLogs.length === 0}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                selectedLogs.length > 0 
                  ? 'bg-red-600 hover:bg-red-700 text-white border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500' 
                  : 'bg-red-200 text-red-400 border border-transparent cursor-not-allowed'
              }`}
            >
              <Trash2 className="h-4 w-4 mr-2" /> 
              Delete {selectedLogs.length > 0 ? `(${selectedLogs.length})` : ''}
            </button>
          </div>
        </div>
        
        {/* Expanded Filters */}
        {isFilterExpanded && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fadeIn">
            <div className="space-y-1">
              <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" /> Date
              </div>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="h-4 w-4 mr-2 text-gray-500" /> Severity
              </div>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 mr-2 text-gray-500" /> User
              </div>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="all">All Users</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="h-4 w-4 mr-2 text-gray-500" /> Action Type
              </div>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="all">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {/* Active Filters Summary */}
        <div className="mt-3 flex items-center text-sm text-gray-600">
          <span className="mr-2">Showing {filteredLogs.length} of {logs.length} logs</span>
          {dateFilter !== 'all' && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mr-2">
              {dateFilter === 'today' ? 'Today' : 
               dateFilter === 'yesterday' ? 'Yesterday' : 
               dateFilter === 'week' ? 'Last 7 days' : 
               'Last 30 days'}
            </span>
          )}
          {severityFilter !== 'all' && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mr-2">
              {severityFilter}
            </span>
          )}
          {userFilter !== 'all' && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mr-2">
              {userFilter}
            </span>
          )}
          {actionFilter !== 'all' && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mr-2">
              {actionFilter.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto bg-white rounded-b-lg">
          {filteredLogs.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="pl-4 pr-3 py-3 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={selectAll}
                        onChange={() => setSelectAll(!selectAll)}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className={`transition-colors duration-150 hover:bg-gray-50 ${
                      log.severity === 'error' ? 'bg-red-50 hover:bg-red-100' : 
                      log.severity === 'warning' ? 'bg-yellow-50 hover:bg-yellow-100' : ''
                    } ${selectedLogs.includes(log.id) ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="pl-4 pr-3 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={selectedLogs.includes(log.id)}
                          onChange={() => toggleLogSelection(log.id)}
                        />
                      </div>
                    </td>
                    
                    {/* Timestamp */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {format(new Date(log.timestamp), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                      </div>
                    </td>
                    
                    {/* User */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.userName}
                      </div>
                      <div>
                        {getRoleBadge(log.userRole)}
                      </div>
                    </td>
                    
                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.action.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.action === 'BOOK_ISSUED' ? 'Book Checkout' : 
                         log.action === 'BOOK_RETURNED' ? 'Book Return' : 
                         log.action === 'FINE_COLLECTED' ? 'Fine Collection' : ''}
                      </div>
                    </td>
                    
                    {/* Details */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate hover:max-w-none">
                        {log.details}
                      </div>
                    </td>
                    
                    {/* Severity */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No logs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {logs.length === 0 ? 'The log is currently empty.' : 'Try adjusting your filters.'}
              </p>
              {logs.length === 0 && (
                <button
                  onClick={() => {
                    setLogs(initialLogs);
                    setFilteredLogs(initialLogs);
                  }}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Restore Sample Logs
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;