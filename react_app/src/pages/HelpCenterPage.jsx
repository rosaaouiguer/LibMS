import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Search, ArrowLeft } from "lucide-react";
import axios from "axios";

const HelpCenterPage = () => {
  const [helpContents, setHelpContents] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSections, setFilteredSections] = useState([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch help content from the API
  useEffect(() => {
    const fetchHelpContent = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "https://lms-backend-zjt1.onrender.com/api/help/sections"
        );
        const data = response.data.data;

        if (data && data.length > 0) {
          setHelpContents(data);
          setActiveSection(data[0]);
          setActiveItem(data[0].items[0]);
          setFilteredSections(data);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching help content:", err);
        setError("Failed to load help content. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchHelpContent();
  }, []);

  // Effect for filtering based on search
  useEffect(() => {
    if (!helpContents.length) return;

    if (searchTerm.trim() === "") {
      setFilteredSections(helpContents);
      return;
    }

    const search = searchTerm.toLowerCase().trim();
    const filtered = helpContents
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          item.title.toLowerCase().includes(search)
        ),
      }))
      .filter(
        (section) =>
          section.items.length > 0 ||
          section.name.toLowerCase().includes(search)
      );

    setFilteredSections(filtered);
  }, [searchTerm, helpContents]);

  // Effect for detecting screen size
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsNavOpen(false);
      } else {
        setIsNavOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle item click
  const handleItemClick = (section, item) => {
    setActiveSection(section);
    setActiveItem(item);
    if (isSmallScreen) {
      setIsNavOpen(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading help center content...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 border-b border-gray-200 shadow-sm z-10"
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Help Center</h1>
          <p className="text-gray-600 mt-1">
            Learn how to use the Library Management System
          </p>
        </div>
      </motion.div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <motion.div
          className={`${
            isNavOpen ? "block" : "hidden md:block"
          } w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 z-20`}
          initial={isSmallScreen ? { x: -300, opacity: 0 } : { opacity: 0 }}
          animate={
            isSmallScreen
              ? isNavOpen
                ? { x: 0, opacity: 1 }
                : { x: -300, opacity: 0 }
              : { opacity: 1 }
          }
          transition={{ duration: 0.3 }}
        >
          {/* Search box */}
          <div className="p-4 sticky top-0 bg-white z-10 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Search help topics..."
                className="w-full p-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="p-4">
            {/* Mobile back button */}
            {isSmallScreen && (
              <button
                onClick={() => setIsNavOpen(false)}
                className="mb-4 flex items-center text-sm font-medium text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to content
              </button>
            )}

            {/* Navigation tree */}
            {filteredSections.map((section) => (
              <div key={section.id} className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="mr-2 text-lg">{section.icon}</span>
                  <h3 className="font-medium text-gray-800">{section.name}</h3>
                </div>

                <ul className="ml-2 pl-4 border-l border-gray-200 space-y-1">
                  {section.items.map((item) => (
                    <motion.li
                      key={item.id}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => handleItemClick(section, item)}
                        className={`w-full text-left py-2 px-3 rounded-md text-sm flex items-center justify-between
                          ${
                            activeItem && activeItem.id === item.id
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <span>{item.title}</span>
                        {activeItem && activeItem.id === item.id && (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}

            {filteredSections.length === 0 && (
              <div className="text-center p-6 text-gray-500">
                <p>No help topics match your search.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          className="flex-1 overflow-y-auto relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Mobile view navigation toggle */}
          {isSmallScreen && !isNavOpen && (
            <button
              onClick={() => setIsNavOpen(true)}
              className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md text-gray-600 hover:bg-gray-50 z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}

          {/* Content render */}
          <div className="p-6 md:p-8 max-w-3xl mx-auto">
            {activeItem ? (
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {activeItem.title}
                </h2>
                <div dangerouslySetInnerHTML={{ __html: activeItem.content }} />
              </motion.div>
            ) : (
              <div className="text-center p-6 text-gray-500">
                <p>Select a help topic to view content.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
