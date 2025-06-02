import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LibraryRulesAPI from '../../services/libraryrulesApi';

const LibraryRules = () => {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentRule, setCurrentRule] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'borrowing'
  });
  
  const categories = ['All', 'borrowing', 'conduct', 'penalties', 'resources'];
  
  const navigate = useNavigate();
  
  // CSS Classes
  const modalBackdrop = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  const modalContainer = "bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden";
  const modalHeader = "bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-5";
  const modalBody = "p-6";
  const modalFooter = "px-6 py-4 bg-gray-50 flex justify-end space-x-3";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
  const textareaStyle = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
  
  // Fetch all rules from the API
  useEffect(() => {
    const fetchRules = async () => {
      setIsLoading(true);
      try {
        const data = await LibraryRulesAPI.getAllRules();
        setRules(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch library rules. Please try again later.');
        console.error('Error fetching rules:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRules();
  }, []);
  
  // Filter rules based on search and category
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || rule.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleAddRule = async () => {
    try {
      const newRule = await LibraryRulesAPI.createRule(formData);
      setRules([...rules, newRule]);
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error adding rule:', err);
      alert('Failed to add library rule. Please try again.');
    }
  };
  
  const handleEditRule = async () => {
    try {
      const updatedRule = await LibraryRulesAPI.updateRule(currentRule._id, formData);
      
      // Update the rules array with the edited rule
      const updatedRules = rules.map(rule => 
        rule._id === currentRule._id ? updatedRule : rule
      );
      
      setRules(updatedRules);
      setIsEditModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error updating rule:', err);
      alert('Failed to update library rule. Please try again.');
    }
  };
  
  const handleDeleteRule = async () => {
    try {
      await LibraryRulesAPI.deleteRule(currentRule._id);
      
      // Remove the deleted rule from the rules array
      setRules(rules.filter(rule => rule._id !== currentRule._id));
      setIsDeleteModalOpen(false);
      setCurrentRule(null);
    } catch (err) {
      console.error('Error deleting rule:', err);
      alert('Failed to delete library rule. Please try again.');
    }
  };
  
  const openEditModal = (rule) => {
    setCurrentRule(rule);
    setFormData({
      title: rule.title,
      description: rule.description,
      category: rule.category
    });
    setIsEditModalOpen(true);
  };
  
  const openDeleteModal = (rule) => {
    setCurrentRule(rule);
    setIsDeleteModalOpen(true);
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'borrowing'
    });
    setCurrentRule(null);
  };

  // Format date function for displaying createdAt or updatedAt
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };
  
  // Display loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-center">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 className="mt-2 text-lg font-medium text-red-800">Error Loading Rules</h3>
        <p className="mt-1 text-red-700">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-3 bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      {/* Header with search and filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-1 w-full md:w-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
            ))}
          </select>
          
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-md"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Rule
          </button>
        </div>
      </div>
      
      {/* Rules list */}
      <div className="bg-gray-50 rounded-lg shadow">
        {filteredRules.length > 0 ? (
          filteredRules.map((rule) => (
            <div 
              key={rule._id} 
              className="p-5 border-b border-gray-200 last:border-0 hover:bg-indigo-50 transition-colors duration-150"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-800">{rule.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {rule.category.charAt(0).toUpperCase() + rule.category.slice(1)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(rule)}
                    className="p-1.5 text-indigo-500 bg-indigo-100 hover:text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors duration-200 group relative"
                    aria-label="Edit rule"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Edit
                    </span>
                  </button>
                  <button
                    onClick={() => openDeleteModal(rule)}
                    className="p-1.5 text-red-500 bg-red-100  hover:text-red-600 rounded-full hover:bg-red-200 transition-colors duration-200 group relative"
                    aria-label="Delete rule"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Delete
                    </span>
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-2">{rule.description}</p>
              <p className="text-xs text-gray-500">Last updated: {formatDate(rule.updatedAt || rule.createdAt)}</p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No rules found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </div>
      
      {/* Add Rule Modal */}
      {isAddModalOpen && (
        <div className={modalBackdrop}>
          <div className={modalContainer}>
            <div className={modalHeader}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Library Rule
                </h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-white opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-indigo-100 mt-1 text-sm">Create a new rule or regulation for the library</p>
            </div>
            <div className={modalBody}>
              <div className="space-y-5">
                <div>
                  <label className={labelStyle}>Rule Title</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className={inputStyle}
                    placeholder="Enter rule title"
                  />
                </div>
                
                <div>
                  <label className={labelStyle}>Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={inputStyle}
                  >
                    {categories.filter(cat => cat !== 'All').map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={labelStyle}>Description</label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className={textareaStyle}
                    placeholder="Enter rule description"
                  ></textarea>
                </div>
                
                <div className="pt-2 bg-indigo-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-indigo-800 mb-2">Preview</h4>
                  <div className="text-sm text-indigo-700">
                    <p><strong>{formData.title || 'Rule Title'}</strong></p>
                    <p className="mt-1">{formData.description || 'Rule description will appear here.'}</p>
                    <p className="mt-2 text-xs text-indigo-600">
                      Category: {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className={modalFooter}>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRule}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-lg transition-all shadow-md"
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Rule Modal */}
      {isEditModalOpen && (
        <div className={modalBackdrop}>
          <div className={modalContainer}>
            <div className={modalHeader}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Library Rule
                </h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-white opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-indigo-100 mt-1 text-sm">Update an existing library rule or regulation</p>
            </div>
            <div className={modalBody}>
              <div className="space-y-5">
                <div>
                  <label className={labelStyle}>Rule Title</label>
                  <input
                    id="edit-title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className={inputStyle}
                  />
                </div>
                
                <div>
                  <label className={labelStyle}>Category</label>
                  <select
                    id="edit-category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={inputStyle}
                  >
                    {categories.filter(cat => cat !== 'All').map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={labelStyle}>Description</label>
                  <textarea
                    id="edit-description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className={textareaStyle}
                  ></textarea>
                </div>
                
                <div className="pt-2 bg-indigo-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-indigo-800 mb-2">Preview</h4>
                  <div className="text-sm text-indigo-700">
                    <p><strong>{formData.title || 'Rule Title'}</strong></p>
                    <p className="mt-1">{formData.description || 'Rule description will appear here.'}</p>
                    <p className="mt-2 text-xs text-indigo-600">
                      Category: {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className={modalFooter}>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditRule}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-lg transition-all shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Rule Modal */}
      {isDeleteModalOpen && currentRule && (
        <div className={modalBackdrop}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-pink-700 text-white p-5">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Rule
                </h3>
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-white opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-red-100 mt-1 text-sm">This action cannot be undone</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-red-100 rounded-full p-3">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Are you sure you want to delete this rule?</h3>
              <p className="text-gray-500 text-center mb-6">This will permanently remove <strong>"{currentRule.title}"</strong> from the library rules.</p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Rule Details</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>{currentRule.title}</strong></p>
                  <p className="mt-1">{currentRule.description}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    Category: {currentRule.category.charAt(0).toUpperCase() + currentRule.category.slice(1)}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRule}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 rounded-lg transition-all shadow-md"
              >
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryRules;