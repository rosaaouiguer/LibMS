import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  Users, 
  Book, 
  Filter, 
  CheckSquare, 
  Square, 
  X,
  Database,
  FileSpreadsheet,
  Loader
} from 'lucide-react';

// Import the student API
import { getAllStudents } from '../../services/studentApi';
import { getAllBooks } from '../../services/bookApi';


// Export formats
const exportFormats = [
  { id: 'xlsx', name: 'Excel (XLSX)', icon: <FileSpreadsheet size={20} /> },
  { id: 'csv', name: 'CSV', icon: <FileText size={20} /> },
  { id: 'pdf', name: 'PDF', icon: <FileText size={20} /> },
  { id: 'json', name: 'JSON', icon: <Database size={20} /> },
];

const ExportData = () => {
  // State for active tab (students or books)
  const [activeTab, setActiveTab] = useState('students');
  
  // State for selected formats
  const [selectedFormats, setSelectedFormats] = useState(['xlsx']);
  
  // State for storing students from API
  const [students, setStudents] = useState([]);
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState(null);
  
  // State for filters
  const [studentFilters, setStudentFilters] = useState({
    categories: [],
    searchQuery: '',
  });
  
  const [bookFilters, setBookFilters] = useState({
    categories: [],
    searchQuery: '',
  });
  
  // State for selected items
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);
  
  // Filter menu states
  const [showStudentFilters, setShowStudentFilters] = useState(false);
  const [showBookFilters, setShowBookFilters] = useState(false);
  
  const [books, setBooks] = useState([]);
  
  // Fetch students and books on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch students
        const studentData = await getAllStudents();
        setStudents(studentData);
        
        // Fetch books
        const bookData = await getAllBooks();
        setBooks(bookData);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to fetch data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Get unique category values
  const studentCategories = [...new Set(students.map(student => student.category?.name))];

  
  // Filter students based on selected filters
  const filteredStudents = students.filter(student => {
    // Apply category filter
    if (studentFilters.categories.length > 0 && !studentFilters.categories.includes(student.category?.name)) {
      return false;
    }
    
    // Apply search filter
    if (
      studentFilters.searchQuery && 
      !student.name.toLowerCase().includes(studentFilters.searchQuery.toLowerCase()) &&
      !student.id.toLowerCase().includes(studentFilters.searchQuery.toLowerCase()) &&
      !student.email.toLowerCase().includes(studentFilters.searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });
  
  // Filter books based on selected filters
  const filteredBooks = books.filter(book => {
    // Get category name, handle both direct category field and categoryId object
    const bookCategory = book.categoryId?.name || book.category || "Uncategorized";
    
    // Apply category filter
    if (bookFilters.categories.length > 0 && !bookFilters.categories.includes(bookCategory)) {
      return false;
    }
    
    // Apply search filter
    if (
      bookFilters.searchQuery && 
      !book.title?.toLowerCase().includes(bookFilters.searchQuery.toLowerCase()) &&
      !book.author?.toLowerCase().includes(bookFilters.searchQuery.toLowerCase()) &&
      !book.callNumber?.toLowerCase().includes(bookFilters.searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });
  
  // Toggle selection of all visible students
  const toggleSelectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };
  
// Toggle selection of all visible books
const toggleSelectAllBooks = () => {
  if (selectedBooks.length === filteredBooks.length) {
    setSelectedBooks([]);
  } else {
    setSelectedBooks(filteredBooks.map(book => book._id || book.id));
  }
};

// Toggle selection of an individual book
const toggleBookSelection = (id) => {
  if (selectedBooks.includes(id)) {
    setSelectedBooks(selectedBooks.filter(bookId => bookId !== id));
  } else {
    setSelectedBooks([...selectedBooks, id]);
  }
};
  
  // Toggle selection of an individual student
  const toggleStudentSelection = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(studentId => studentId !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };
  

  
  // Toggle format selection
  const toggleFormat = (formatId) => {
    if (selectedFormats.includes(formatId)) {
      if (selectedFormats.length > 1) {
        setSelectedFormats(selectedFormats.filter(id => id !== formatId));
      }
    } else {
      setSelectedFormats([...selectedFormats, formatId]);
    }
  };
  
  // Toggle category filter for students
  const toggleStudentCategory = (category) => {
    if (studentFilters.categories.includes(category)) {
      setStudentFilters({
        ...studentFilters,
        categories: studentFilters.categories.filter(cat => cat !== category)
      });
    } else {
      setStudentFilters({
        ...studentFilters,
        categories: [...studentFilters.categories, category]
      });
    }
  };
  
  // Toggle category filter for books
  const toggleBookCategory = (category) => {
    if (bookFilters.categories.includes(category)) {
      setBookFilters({
        ...bookFilters,
        categories: bookFilters.categories.filter(cat => cat !== category)
      });
    } else {
      setBookFilters({
        ...bookFilters,
        categories: [...bookFilters.categories, category]
      });
    }
  };
  
  // Utility functions for exporting
  const exportToJSON = (data, filename) => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `${filename}.json`;
    link.click();
  };

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(value => 
      typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    ).join(','));
    const csvContent = [headers, ...rows].join('\n');
    const dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToXLSX = async (data, filename) => {
    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportToPDF = async (data, filename) => {
    const { jsPDF } = await import('jspdf');
    const { autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF();
    const headers = [Object.keys(data[0])];
    const rows = data.map(obj => Object.values(obj));
    
    autoTable(doc, {
      head: headers,
      body: rows,
    });
    
    doc.save(`${filename}.pdf`);
  };
// Handle export action
// Handle export action
const handleExport = async () => {
  let data;
  
  if (activeTab === 'students') {
    // Use actual student data from API and filter out _id and image_path
    data = filteredStudents
      .filter(student => selectedStudents.includes(student.id))
      .map(({ _id, image_path, ...rest }) => {
        // Create a new object with category as string instead of object
        return {
          ...rest,
          category: rest.category?.name || 'Uncategorized' // Convert category object to string
        };
      });
  }  else {
    // Use actual book data from API or sample data
    const sourceBooks = filteredBooks;
    
    data = sourceBooks
      .filter(book => selectedBooks.includes(book._id || book.id))
      .map(book => {
        // Create a new object with only the required fields
        return {
          id: book._id || book.id,
          title: book.title,
          author: book.author,
          callNumber: book.callNumber,
          availability: book.availableCopies === 0 ? 'Unavailable' : 'Available'
        };
      });
  }

  if (data.length === 0) {
    alert('Please select items to export');
    return;
  }

  const filename = `library_${activeTab}_export_${new Date().toISOString().slice(0, 10)}`;

  try {
    for (const format of selectedFormats) {
      switch (format) {
        case 'json':
          exportToJSON(data, filename);
          break;
        case 'csv':
          exportToCSV(data, filename);
          break;
        case 'xlsx':
          await exportToXLSX(data, filename);
          break;
        case 'pdf':
          await exportToPDF(data, filename);
          break;
        default:
          console.warn(`Unknown export format: ${format}`);
      }
    }
  } catch (error) {
    console.error('Export error:', error);
    alert('Error during export. Please try again.');
  }
};
  // Reset all filters
  const resetFilters = () => {
    if (activeTab === 'students') {
      setStudentFilters({ categories: [], searchQuery: '' });
    } else {
      setBookFilters({ categories: [], searchQuery: '' });
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      
      {/* Content Area */}
      <div className="flex-1 bg-white rounded-b-lg shadow-md p-8 overflow-auto">
        {/* Tabs for Students and Books */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`flex items-center py-3 px-6 text-sm font-medium rounded-t-lg mr-2 ${
              activeTab === 'students' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={18} className="mr-2" />
            Students
          </button>
          <button
            className={`flex items-center py-3 px-6 text-sm font-medium rounded-t-lg ${
              activeTab === 'books' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
            onClick={() => setActiveTab('books')}
          >
            <Book size={18} className="mr-2" />
            Books
          </button>
        </div>
        
        {/* Export Options and Actions */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          {/* Search Bar */}
          <div className="relative flex-grow max-w-lg mb-4 md:mb-0">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={activeTab === 'students' ? studentFilters.searchQuery : bookFilters.searchQuery}
              onChange={(e) => {
                if (activeTab === 'students') {
                  setStudentFilters({ ...studentFilters, searchQuery: e.target.value });
                } else {
                  setBookFilters({ ...bookFilters, searchQuery: e.target.value });
                }
              }}
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          
          {/* Filter Button */}
          <div className="flex flex-wrap items-center">
            <div className="relative mr-2">
              <button 
                className="flex items-center py-2 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => {
                  if (activeTab === 'students') {
                    setShowStudentFilters(!showStudentFilters);
                    setShowBookFilters(false);
                  } else {
                    setShowBookFilters(!showBookFilters);
                    setShowStudentFilters(false);
                  }
                }}
              >
                <Filter size={16} className="mr-2 text-gray-600" />
                <span className="text-sm font-medium">Filter</span>
              </button>
              
              {/* Student Filter Menu */}
              {showStudentFilters && (
                <div className="absolute top-full right-0 mt-1 z-10 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Filter Students</h4>
                    <button onClick={() => setShowStudentFilters(false)} className="text-gray-500 hover:text-gray-700">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {studentCategories.map(category => (
                        <label key={category} className="flex items-center text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            className="mr-2 h-4 w-4 text-blue-600 rounded"
                            checked={studentFilters.categories.includes(category)}
                            onChange={() => toggleStudentCategory(category)}
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <button 
                      onClick={resetFilters}
                      className="text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                      Reset Filters
                    </button>
                    <button 
                      onClick={() => setShowStudentFilters(false)}
                      className="text-sm bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Active Filters Pills */}
            <div className="flex flex-wrap gap-2 mr-2">
              {activeTab === 'students' && studentFilters.categories.map(category => (
                <span key={category} className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {category}
                  <button 
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    onClick={() => toggleStudentCategory(category)}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              
              {activeTab === 'books' && bookFilters.categories.map(category => (
                <span key={category} className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {category}
                  <button 
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    onClick={() => toggleBookCategory(category)}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            
            {/* Export Button */}
            <button
              className="flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={handleExport}
              disabled={(activeTab === 'students' && selectedStudents.length === 0) || 
                        (activeTab === 'books' && selectedBooks.length === 0)}
            >
              <Download size={16} className="mr-2" />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>
        
        {/* Export Format Selection */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Export Format</h3>
          <div className="flex flex-wrap gap-3">
            {exportFormats.map(format => (
              <label 
                key={format.id} 
                className={`flex items-center px-4 py-2 border rounded-md cursor-pointer transition-colors ${
                  selectedFormats.includes(format.id)
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selectedFormats.includes(format.id)}
                  onChange={() => toggleFormat(format.id)}
                />
                {format.icon}
                <span className="ml-2 text-sm">{format.name}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Students Data Table */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <Loader className="mx-auto h-8 w-8 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600">Loading students...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                <p>{error}</p>
                <button 
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="pl-4 py-3">
                        <div className="flex items-center">
                          <button
                            className="flex text-gray-500 hover:text-gray-700"
                            onClick={toggleSelectAllStudents}
                          >
                            {selectedStudents.length === filteredStudents.length && filteredStudents.length > 0 ? (
                              <CheckSquare size={18} className="text-blue-600" />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ISBN
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DOB
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium">No students found</p>
                          <p className="text-sm">Try adjusting your search or filter criteria</p>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr 
                          key={student.id} 
                          className={`${
                            selectedStudents.includes(student.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                          } cursor-pointer`}
                          onClick={() => toggleStudentSelection(student.id)}
                        >
                          <td className="pl-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {selectedStudents.includes(student.id) ? (
                                <CheckSquare size={18} className="text-blue-600" />
                              ) : (
                                <Square size={18} className="text-gray-400" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.id}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{student.name}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.email}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.phone}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.dob}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {student.category?.name}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Selection Summary */}
            {filteredStudents.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 text-sm text-gray-500 border-t">
                <span className="font-medium">{selectedStudents.length}</span> of <span className="font-medium">{filteredStudents.length}</span> students selected
              </div>
            )}
          </div>
        )}
        
        {/* Books Data Table */}
        {activeTab === 'books' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="pl-4 py-3">
                      <div className="flex items-center">
                        <button
                          className="flex text-gray-500 hover:text-gray-700"
                          onClick={toggleSelectAllBooks}
                        >
                          {selectedBooks.length === filteredBooks.length && filteredBooks.length > 0 ? (
                            <CheckSquare size={18} className="text-blue-600" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Call Number
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availability
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">No books found</p>
                        <p className="text-sm">Try adjusting your search or filter criteria</p>
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((book) => (
<tr 
                        key={book._id || book.id} 
                        className={`${
                          selectedBooks.includes(book._id || book.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                        } cursor-pointer`}
                        onClick={() => toggleBookSelection(book._id || book.id)}
                      >
                        <td className="pl-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {selectedBooks.includes(book._id || book.id) ? (
                              <CheckSquare size={18} className="text-blue-600" />
                            ) : (
                              <Square size={18} className="text-gray-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {book.isbn }
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{book.title}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {book.author}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {book.callNumber}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${
                            book.availableCopies === 0 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {book.availableCopies === 0 ? 'Unavailable' : 'Available'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Selection Summary */}
            {filteredBooks.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 text-sm text-gray-500 border-t">
                <span className="font-medium">{selectedBooks.length}</span> of <span className="font-medium">{filteredBooks.length}</span> books selected
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportData;