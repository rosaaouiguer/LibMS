import React, { useState, useEffect } from "react";
import { BanStatusBadge } from "../components/common/BanStatusBadge";

export const StudentDetailView = ({
  student,
  onBack,
  onSendNotification,
  onEditStudent,
  onBanStudent,
  onUnbanStudent,
}) => {
  // Convert tabs to state-based view for better organization
  const [activeTab, setActiveTab] = useState("profile");
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch category information if student has a category ID
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      if (!student.category) return;
      
      // Check if category is already a full object
      if (typeof student.category === 'object' && student.category.name) {
        setCategoryInfo(student.category);
        return;
      }
      
      // Otherwise, fetch the category by ID
      setIsLoading(true);
      try {
        const response = await fetch(`/api/studentCategories/${student.category}`);
        if (!response.ok) {
          throw new Error('Failed to fetch category details');
        }
        const data = await response.json();
        setCategoryInfo(data);
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryInfo();
  }, [student.category]);

  // Format date of birth for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    
    try {
      // Handle both potential formats: ISO date or DD/MM/YYYY
      let date;
      if (dateString.includes('/')) {
        // Split DD/MM/YYYY format
        const [day, month, year] = dateString.split('/');
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center md:justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-white hover:text-blue-100 mb-4 md:mb-0 transition-all duration-200 hover:translate-x-[-4px]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Students
            </button>

            <div className="flex space-x-3">
              <button
                onClick={() => onEditStudent(student)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center hover:shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => onSendNotification(student)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center hover:shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                Notify
              </button>
              {student.banned ? (
                <button
                  onClick={() => onUnbanStudent(student)}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center hover:shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Unban
                </button>
              ) : (
                <button
                  onClick={() => onBanStudent(student)}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center hover:shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Ban
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Student profile section with overlapping card */}
      <div className="container mx-auto px-6 -mt-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="flex flex-col items-center mb-6 md:mb-0">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center p-1 border-4 border-white shadow-lg overflow-hidden">
                  <img
                    src={student.image_path || student.image || "/assets/defaultItemPic.png"}
                    alt={student.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                {student.banned && (
                  <div className="absolute -bottom-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    BANNED
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col items-center">
                {isLoading ? (
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full mb-2">
                    Loading...
                  </span>
                ) : categoryInfo ? (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full mb-2">
                    {categoryInfo.name} - {categoryInfo.description}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full mb-2">
                    No Category
                  </span>
                )}
                <span className="text-sm text-gray-500">ID: {student.studentId || student.id}</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 md:mb-0">
                  {student.name}
                </h2>
                <div className="flex justify-end">
                  {!isLoading && categoryInfo && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                      {categoryInfo.name}
                    </span>
                  )}
                </div>
              </div>

              <BanStatusBadge
                banned={student.banned}
                bannedUntil={student.bannedUntil}
              />

              {/* Tabs */}
              <div className="border-b border-gray-200 mt-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`${
                      activeTab === "profile"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                  >
                    Profile
                  </button>
                </nav>
              </div>
              
              {/* Tab Content */}
              <div className="py-6">
                {activeTab === "profile" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center mb-3 text-gray-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-3 text-indigo-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <p className="font-medium">Email</p>
                      </div>
                      <p className="text-gray-800 ml-8 break-all">{student.email}</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center mb-3 text-gray-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-3 text-indigo-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <p className="font-medium">Phone</p>
                      </div>
                      <p className="text-gray-800 ml-8">{student.phoneNumber || student.phone || "Not specified"}</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center mb-3 text-gray-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-3 text-indigo-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="font-medium">Date of Birth</p>
                      </div>
                      <p className="text-gray-800 ml-8">{formatDate(student.dateOfBirth || student.dob)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};