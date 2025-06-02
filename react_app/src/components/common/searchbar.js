import React, { useState } from 'react';
import { MainButton } from './buttons';

export const SearchBar = ({ placeholder = "Search by Student ID, Name...", onSearch, className = '' }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (onSearch) onSearch(query);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`flex flex-wrap gap-3 w-full ${className}`}>
      <div className="flex-1 flex items-center border border-blue-600 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow transition-shadow duration-200">
        <div className="px-3 text-gray-500">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="flex-1 py-2 px-2 outline-none text-gray-700"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <MainButton 
        text="Filter Results" 
        onClick={handleSearch}
      />
    </div>
  );
};

export const AdvancedSearchBar = ({ onSearch, filters = [], className = '' }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const handleSearch = () => {
    if (onSearch) onSearch({ query, filters: activeFilters });
  };

  const toggleFilter = (filterId, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-wrap gap-3 w-full">
        <div className="flex-1 flex items-center border border-blue-600 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow transition-shadow duration-200">
          <div className="px-3 text-gray-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="flex-1 py-2 px-2 outline-none text-gray-700"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <MainButton 
          text="Search" 
          onClick={handleSearch}
        />
        {filters.length > 0 && (
          <button
            className="bg-gray-100 hover:bg-gray-200 px-3 rounded-lg flex items-center text-gray-700 transition-colors duration-200"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        )}
      </div>
      
      {showFilters && filters.length > 0 && (
        <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map(filter => (
              <div key={filter.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{filter.label}</label>
                {filter.type === 'select' && (
                  <select 
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    value={activeFilters[filter.id] || ''}
                    onChange={(e) => toggleFilter(filter.id, e.target.value)}
                  >
                    <option value="">All</option>
                    {filter.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                {filter.type === 'checkbox' && (
                  <div className="space-y-1">
                    {filter.options.map(option => (
                      <label key={option.value} className="flex items-center">
                        <input 
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={activeFilters[filter.id]?.includes(option.value) || false}
                          onChange={(e) => {
                            const current = activeFilters[filter.id] || [];
                            const newValues = e.target.checked 
                              ? [...current, option.value]
                              : current.filter(v => v !== option.value);
                            toggleFilter(filter.id, newValues);
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setActiveFilters({});
                setShowFilters(false);
              }}
              className="text-sm text-gray-600 hover:text-gray-800 mr-4"
            >
              Clear Filters
            </button>
            <MainButton text="Apply Filters" onClick={handleSearch} />
          </div>
        </div>
      )}
    </div>
  );
};