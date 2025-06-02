import React, { useState, useEffect } from 'react';
import { MainLayout, ContentCard } from '../components/common/layout';
import { MainButton, IconTextButton } from '../components/common/buttons';
import { TitleText, SubtitleText } from '../components/common/text';
import { PieChart, BarChart, LineChart, ComposedChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Bar, Cell, Pie, Area } from 'recharts';
import { Calendar, Filter, BookOpen, Users, Star, AlertTriangle, TrendingUp, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReportGenerator from '../components/report/ReportGenerator';
import SimpleReportGenerator from '../components/report/SimpleReportGenerator';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Sample data generator for the enhanced dashboard
const generateData = () => {
  // Low stock books
  const lowStockBooks = [
    { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee", copies: 2, threshold: 5, category: "Fiction" },
    { id: 2, title: "Introduction to Chemistry", author: "John Smith", copies: 1, threshold: 4, category: "Science" },
    { id: 3, title: "World War II: A History", author: "Michael Davis", copies: 3, threshold: 5, category: "History" },
    { id: 4, title: "Pride and Prejudice", author: "Jane Austen", copies: 2, threshold: 6, category: "Fiction" },
    { id: 5, title: "Advanced Calculus", author: "Robert Johnson", copies: 1, threshold: 3, category: "Mathematics" }
  ];

  // Most active students
  const activeStudents = [
    { id: 1, name: "Fatima Zahra", books: 24, avatar: "FZ", grade: "12A" },
    { id: 2, name: "Ahmed Khalil", books: 21, avatar: "AK", grade: "11B" },
    { id: 3, name: "Nora Mansouri", books: 19, avatar: "NM", grade: "12C" },
    { id: 4, name: "Youssef Benhadi", books: 17, avatar: "YB", grade: "10A" },
    { id: 5, name: "Leila Tazi", books: 16, avatar: "LT", grade: "11A" }
  ];

  // Available books for selection
  const availableBooks = [
    { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction" },
    { id: 2, title: "1984", author: "George Orwell", category: "Fiction" },
    { id: 3, title: "Introduction to Chemistry", author: "John Smith", category: "Science" },
    { id: 4, title: "World War II: A History", author: "Michael Davis", category: "History" },
    { id: 5, title: "Pride and Prejudice", author: "Jane Austen", category: "Fiction" }
  ];

  // Popular books data
  const popularBooks = [
    { name: 'To Kill a Mockingbird', loans: 78, rating: 4.8, copies: 15 },
    { name: '1984', loans: 65, rating: 4.6, copies: 12 },
    { name: 'The Great Gatsby', loans: 58, rating: 4.5, copies: 10 },
    { name: 'Pride and Prejudice', loans: 52, rating: 4.7, copies: 8 },
    { name: 'The Hobbit', loans: 49, rating: 4.9, copies: 9 }
  ];

  // Feedback data
  const feedbackData = [
    { category: 'Book Quality', excellent: 45, good: 32, average: 15, poor: 8 },
    { category: 'Library Services', excellent: 38, good: 41, average: 12, poor: 9 },
    { category: 'Staff Helpfulness', excellent: 52, good: 35, average: 10, poor: 3 },
    { category: 'Selection', excellent: 30, good: 42, average: 20, poor: 8 },
    { category: 'Atmosphere', excellent: 47, good: 38, average: 12, poor: 3 }
  ];

  // Book borrowing statistics over time
  const generateBookStatsData = (startDate, endDate, selectedBookIds) => {
    // For demo purposes, we're generating random data
    // In a real app, this would be filtered based on the parameters

    // Create an array of dates between startDate and endDate
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateArray = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate borrowing data for each date
    return dateArray.map(date => {
      const formattedDate = date.toISOString().split('T')[0];
      const result = { date: formattedDate };

      // If no books selected or "All books" is selected, show total
      if (!selectedBookIds || selectedBookIds.length === 0 || selectedBookIds.includes('all')) {
        result.total = Math.floor(Math.random() * 30) + 5;
      } else {
        // Generate data for each selected book
        selectedBookIds.forEach(bookId => {
          const book = availableBooks.find(b => b.id === parseInt(bookId));
          if (book) {
            result[`book-${bookId}`] = Math.floor(Math.random() * 10) + 1;
          }
        });
      }

      return result;
    });
  };

  // Recent feedback comments
  const recentFeedback = [
    { id: 1, user: "Ahmed K.", rating: 5, comment: "The new fiction section is amazing!", time: "5 mins ago", category: "Library Layout" },
    { id: 2, user: "Fatima L.", rating: 4, comment: "Really enjoyed the book club this week", time: "1 hour ago", category: "Services" },
    { id: 3, user: "Youssef B.", rating: 3, comment: "Would like to see more science titles", time: "2 hours ago", category: "Selection" },
    { id: 4, user: "Nora M.", rating: 5, comment: "The librarian was extremely helpful!", time: "Yesterday", category: "Staff" },
    { id: 5, user: "Omar A.", rating: 2, comment: "Some books need replacement, pages missing", time: "Yesterday", category: "Book Quality" }
  ];



  return {
    lowStockBooks,
    activeStudents,
    availableBooks,
    popularBooks,
    feedbackData,
    generateBookStatsData,
    recentFeedback
  };
};

// UI Components
const StatCard = ({ title, value, icon, color }) => {
  const bgColors = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-amber-50',
    red: 'bg-red-50',
    purple: 'bg-purple-50'
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-amber-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col h-[130px] hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <span className="text-gray-700 font-medium">{title}</span>
        <div className={`p-2 rounded-full ${bgColors[color]}`}>
          <span className={`${iconColors[color]}`}>{icon}</span>
        </div>
      </div>
      <div className="mt-2">
        <span className="text-3xl font-bold text-gray-800">{value}</span>
      </div>
    </div>
  );
};

const LowStockItem = ({ book }) => {
  const percentRemaining = (book.copies / book.threshold) * 100;

  return (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <p className="text-sm font-semibold text-gray-800">{book.title}</p>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-50 text-red-600">
            {book.copies} left
          </span>
        </div>
        <p className="text-xs text-gray-500">{book.author} • {book.category}</p>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-red-500 h-1.5 rounded-full"
            style={{ width: `${percentRemaining}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const ActiveStudentItem = ({ student, rank }) => {
  const getColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-amber-100 text-amber-800';
      case 2: return 'bg-gray-100 text-gray-800';
      case 3: return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-0">
      <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 font-semibold text-sm ${getColor(rank)}`}>
        {rank}
      </div>
      <div className="w-8 h-8 flex items-center justify-center rounded-full mr-3 bg-indigo-100 text-indigo-800 font-medium text-sm">
        {student.avatar}
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <p className="text-sm font-medium text-gray-800">{student.name}</p>
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
            {student.books} books
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">Grade {student.grade}</p>
      </div>
    </div>
  );
};

const FeedbackItem = ({ feedback }) => {
  const getRatingColor = (rating) => {
    switch (rating) {
      case 5: return 'text-green-500';
      case 4: return 'text-green-400';
      case 3: return 'text-amber-400';
      case 2: return 'text-orange-400';
      case 1: return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-0">
      <div className="w-10 h-10 flex items-center justify-center rounded-full mr-3 bg-indigo-50 text-indigo-600 font-medium">
        {feedback.user.substring(0, 2)}
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <div>
            <span className="text-sm font-medium text-gray-800">{feedback.user}</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {feedback.category}
            </span>
          </div>
          <div className={`flex items-center ${getRatingColor(feedback.rating)}`}>
            {[...Array(feedback.rating)].map((_, i) => (
              <Star key={i} size={12} fill="currentColor" />
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-600">{feedback.comment}</p>
        <p className="text-xs text-gray-500 mt-1">{feedback.time}</p>
      </div>
    </div>
  );
};

// Date range picker component (simplified)
const DateRangePicker = ({ onChange, startDate, endDate }) => {
  const handleStartDateChange = (e) => {
    onChange({ startDate: e.target.value, endDate });
  };

  const handleEndDateChange = (e) => {
    onChange({ startDate, endDate: e.target.value });
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="p-2 pr-8 border border-gray-300 rounded-md text-sm"
        />
        <Calendar size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
      </div>
      <span className="text-gray-500">to</span>
      <div className="relative">
        <input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="p-2 pr-8 border border-gray-300 rounded-md text-sm"
        />
        <Calendar size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
      </div>
    </div>
  );
};

// Book Statistics Component
const BookStatistics = ({ data, availableBooks, onDateRangeChange, onBookSelectionChange }) => {
  const [selectedBooks, setSelectedBooks] = useState(['all']);
  const [dateRange, setDateRange] = useState({
    startDate: '2024-03-01',
    endDate: '2024-03-31'
  });

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    onDateRangeChange && onDateRangeChange(newDateRange);
  };

  const handleBookSelection = (e) => {
    const value = e.target.value;
    let newSelection;

    if (value === 'all') {
      newSelection = ['all'];
    } else {
      // Remove 'all' if it was previously selected
      const currentSelection = selectedBooks.filter(id => id !== 'all');

      if (currentSelection.includes(value)) {
        // If already selected, remove it
        newSelection = currentSelection.filter(id => id !== value);
        // If nothing selected, default to 'all'
        if (newSelection.length === 0) newSelection = ['all'];
      } else {
        // Add to selection
        newSelection = [...currentSelection, value];
      }
    }

    setSelectedBooks(newSelection);
    onBookSelectionChange && onBookSelectionChange(newSelection);
  };

  // Generate colors for different books
  const bookColors = {
    'all': '#4361EE',
    '1': '#38d9a9',
    '2': '#fcc419',
    '3': '#ff6b6b',
    '4': '#da77f2',
    '5': '#3bc9db'
  };

  // Get the chart data keys based on selected books
  const getChartDataKeys = () => {
    if (selectedBooks.includes('all')) {
      return [{ dataKey: 'total', name: 'All Books', color: bookColors['all'] }];
    }

    return selectedBooks.map(bookId => {
      const book = availableBooks.find(b => b.id === parseInt(bookId));
      return {
        dataKey: `book-${bookId}`,
        name: book ? book.title : `Book ${bookId}`,
        color: bookColors[bookId] || '#4361EE'
      };
    });
  };

  const dataKeys = getChartDataKeys();

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
        <div>
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={handleDateRangeChange}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleBookSelection({ target: { value: 'all' } })}
            className={`px-3 py-1 rounded-full text-xs font-medium ${selectedBooks.includes('all')
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            All Books
          </button>
          {availableBooks.map(book => (
            <button
              key={book.id}
              onClick={() => handleBookSelection({ target: { value: String(book.id) } })}
              className={`px-3 py-1 rounded-full text-xs font-medium ${selectedBooks.includes(String(book.id))
                  ? `bg-${bookColors[book.id].substring(1)} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              style={selectedBooks.includes(String(book.id)) ? { backgroundColor: bookColors[book.id], color: 'white' } : {}}
            >
              {book.title}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#5E6278', fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#5E6278', fontSize: 12 }}
            />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            />
            <Legend wrapperStyle={{ paddingTop: 15 }} />
            {dataKeys.map((config, index) => (
              <Line
                key={config.dataKey}
                type="monotone"
                dataKey={config.dataKey}
                name={config.name}
                stroke={config.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {dataKeys.map((config, index) => {
            // Calculate some statistics
            const values = data.map(item => item[config.dataKey]).filter(Boolean);
            const total = values.reduce((sum, val) => sum + val, 0);
            const avg = values.length ? (total / values.length).toFixed(1) : 0;
            const max = values.length ? Math.max(...values) : 0;

            return (
              <div
                key={config.dataKey}
                className="bg-gray-50 p-3 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }}></div>
                  <span className="text-sm font-medium text-gray-700 truncate">{config.name}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <div>
                    <div className="font-bold text-gray-800 text-lg">{total}</div>
                    <div>Total</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">{avg}</div>
                    <div>Average</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">{max}</div>
                    <div>Peak</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};



// Feedback colors mapping
const FEEDBACK_COLORS = {
  excellent: '#38d9a9',
  good: '#3bc9db',
  average: '#fcc419',
  poor: '#ff6b6b'
};

// Main Dashboard Component - continued from third row
const Dashboard = () => {
  const [data, setData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dateRange, setDateRange] = useState({ startDate: '2024-03-01', endDate: '2024-03-31' });
  const [selectedBooks, setSelectedBooks] = useState(['all']);
  const [bookStatsData, setBookStatsData] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // For feedback filtering
  const navigate = useNavigate();

  useEffect(() => {
    // In a real application, this would be an API call with date params
    const generatedData = generateData();
    setData(generatedData);

    // Generate book stats data based on the selected date range and books
    const statsData = generatedData.generateBookStatsData(
      dateRange.startDate,
      dateRange.endDate,
      selectedBooks
    );
    setBookStatsData(statsData);
  }, [refreshKey, dateRange, selectedBooks]);

  if (!data) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  const handleBookSelectionChange = (selectedBookIds) => {
    setSelectedBooks(selectedBookIds);
  };

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Filter feedback based on active tab
  const filteredFeedback = activeTab === 'all'
    ? data.recentFeedback
    : data.recentFeedback.filter(feedback => feedback.category.toLowerCase().includes(activeTab));

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <TitleText>Library Dashboard</TitleText>
          <SubtitleText>Real-time insights and management</SubtitleText>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={handleDateRangeChange}
          />
          <div className="flex gap-2">
            <div className="flex gap-2">
            <SimpleReportGenerator 
  data={{
    lowStockBooks: data.lowStockBooks,
    activeStudents: data.activeStudents,
    popularBooks: data.popularBooks,
    feedbackData: data.feedbackData
  }}
  dateRange={dateRange}
/>
            </div>
            <IconTextButton
              text="Export Data"
              onClick={() => navigate('/export')}
              icon={<Download size={16} />}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Books Loaned"
          value="2,467"
          icon={<BookOpen size={20} />}
          color="blue"
        />
        <StatCard
          title="Active Students"
          value="856"
          icon={<Users size={20} />}
          color="green"
        />
        <StatCard
          title="Low Stock Items"
          value="17"
          icon={<AlertTriangle size={20} />}
          color="red"
        />
        <StatCard
          title="User Satisfaction"
          value="4.7/5"
          icon={<Star size={20} />}
          color="purple"
        />
      </div>

      {/* First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ContentCard title="Books Requiring Acquisition" className="lg:col-span-1">
          <div className="h-80 overflow-y-auto px-1">
            {data.lowStockBooks.map(book => (
              <LowStockItem key={book.id} book={book} />
            ))}
            <div className="mt-4">
              <button className="w-full py-2 bg-blue-50 text-blue-600 font-medium rounded-md hover:bg-blue-100 transition-colors text-sm">
                View All Low Stock Items
              </button>
            </div>
          </div>
        </ContentCard>

        <ContentCard title="Book Borrowing Statistics" className="lg:col-span-2">
          <BookStatistics
            data={bookStatsData}
            availableBooks={data.availableBooks}
            onDateRangeChange={handleDateRangeChange}
            onBookSelectionChange={handleBookSelectionChange}
          />
        </ContentCard>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ContentCard title="Most Popular Books" className="lg:col-span-1">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.popularBooks} margin={{ top: 20, right: 10, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#5E6278', fontSize: 10 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#5E6278', fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="loans" fill="#4361EE" radius={[4, 4, 0, 0]}>
                  {data.popularBooks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#4361EE" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ContentCard>

        <ContentCard title="Most Active Students" className="lg:col-span-1">
          <div className="h-80 overflow-y-auto px-1">
            {data.activeStudents.map((student, index) => (
              <ActiveStudentItem key={student.id} student={student} rank={index + 1} />
            ))}
            <div className="mt-4">
              <button className="w-full py-2 bg-blue-50 text-blue-600 font-medium rounded-md hover:bg-blue-100 transition-colors text-sm">
                View All Student Activity
              </button>
            </div>
          </div>
        </ContentCard>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentCard title="Library Service Feedback">
          <div className="mb-4 flex overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md mr-2 whitespace-nowrap ${activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All Feedback
            </button>
            <button
              onClick={() => setActiveTab('service')}
              className={`px-4 py-2 text-sm font-medium rounded-md mr-2 whitespace-nowrap ${activeTab === 'service'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab('book')}
              className={`px-4 py-2 text-sm font-medium rounded-md mr-2 whitespace-nowrap ${activeTab === 'book'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Book Quality
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2 text-sm font-medium rounded-md mr-2 whitespace-nowrap ${activeTab === 'staff'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Staff
            </button>
            <button
              onClick={() => setActiveTab('selection')}
              className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'selection'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Book Selection
            </button>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data.feedbackData}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                layout="vertical"
              >
                <CartesianGrid stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#5E6278', fontSize: 12 }}
                />
                <YAxis
                  dataKey="category"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={100}
                  tick={{ fill: '#5E6278', fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="poor" name="Poor" stackId="a" fill={FEEDBACK_COLORS.poor} radius={[0, 0, 4, 4]} />
                <Bar dataKey="average" name="Average" stackId="a" fill={FEEDBACK_COLORS.average} />
                <Bar dataKey="good" name="Good" stackId="a" fill={FEEDBACK_COLORS.good} />
                <Bar dataKey="excellent" name="Excellent" stackId="a" fill={FEEDBACK_COLORS.excellent} radius={[4, 4, 0, 0]} />
                <Line
                  dataKey={(entry) => {
                    const total = entry.excellent + entry.good + entry.average + entry.poor;
                    const score = (entry.excellent * 5 + entry.good * 4 + entry.average * 3 + entry.poor * 2) / total;
                    return score.toFixed(1);
                  }}
                  name="Avg. Rating"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ContentCard>

        <ContentCard title="Recent Feedback">
          <div className="h-80 overflow-y-auto px-1">
            {filteredFeedback.length > 0 ? (
              filteredFeedback.map(feedback => (
                <FeedbackItem key={feedback.id} feedback={feedback} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <BookOpen size={32} className="mb-2" />
                <p>No feedback found for this category</p>
              </div>
            )}
            <div className="mt-4">
              <button
                className="w-full py-2 bg-blue-50 text-blue-600 font-medium rounded-md hover:bg-blue-100 transition-colors text-sm"
                onClick={() => alert('This would show all feedback in a modal or separate page')}
              >
                View All Feedback
              </button>
            </div>
          </div>
        </ContentCard>
      </div>
    </MainLayout>
  );
};

export default Dashboard;