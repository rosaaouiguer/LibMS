// components/StudentCategories.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const StudentCategories = () => {
  const [studentCategories, setStudentCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [newCategory, setNewCategory] = useState({
    name: "",
    borrowingLimit: 2,
    loanDuration: 14,
    loanExtensionAllowed: true,
    extensionLimit: 2,
    extensionDuration: 7,
    defaultBanDuration: 14,
  });

  const [editCategory, setEditCategory] = useState({
    _id: null,
    name: "",
    borrowingLimit: 0,
    loanDuration: 0,
    loanExtensionAllowed: true,
    extensionLimit: 0,
    extensionDuration: 0,
    defaultBanDuration: 0,
  });

  // API URL
  const API_URL =
    "https://lms-backend-zjt1.onrender.com/api/student-categories";

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setStudentCategories(response.data.data);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to fetch student categories"
      );
      console.error("Error fetching student categories:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query) {
      // Reset filtered categories
      return;
    }
  };

  const filteredCategories = searchQuery
    ? studentCategories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : studentCategories;

  const handleAddCategory = async () => {
    if (
      newCategory.name &&
      newCategory.borrowingLimit >= 0 &&
      newCategory.loanDuration >= 0
    ) {
      try {
        const response = await axios.post(API_URL, newCategory);

        // Add the new category to the state
        setStudentCategories([...studentCategories, response.data.data]);

        // Reset form and close modal
        setNewCategory({
          name: "",
          borrowingLimit: 2,
          loanDuration: 14,
          loanExtensionAllowed: true,
          extensionLimit: 2,
          extensionDuration: 7,
        });
        setShowAddCategoryModal(false);
      } catch (err) {
        alert(err.response?.data?.error || "Failed to create category");
        console.error("Error creating category:", err);
      }
    }
  };

  const openEditModal = (category) => {
    setEditCategory({ ...category });
    setShowEditCategoryModal(true);
  };

  const handleEditCategory = async () => {
    if (
      editCategory.name &&
      editCategory.borrowingLimit >= 0 &&
      editCategory.loanDuration >= 0
    ) {
      try {
        const response = await axios.put(
          `${API_URL}/${editCategory._id}`,
          editCategory
        );

        // Update the category in the state
        setStudentCategories(
          studentCategories.map((category) =>
            category._id === editCategory._id ? response.data.data : category
          )
        );

        setShowEditCategoryModal(false);
      } catch (err) {
        alert(err.response?.data?.error || "Failed to update category");
        console.error("Error updating category:", err);
      }
    }
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      try {
        await axios.delete(`${API_URL}/${categoryToDelete._id}`);

        // Remove the category from the state
        setStudentCategories(
          studentCategories.filter(
            (category) => category._id !== categoryToDelete._id
          )
        );
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      } catch (err) {
        alert(err.response?.data?.error || "Failed to delete category");
        console.error("Error deleting category:", err);
      }
    }
  };

  // Modal styles
  const modalBackdrop =
    "fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50";
  const modalContainer =
    "bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden";
  const modalHeader =
    "bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-5";
  const modalBody = "p-6";
  const modalFooter = "px-6 py-4 bg-gray-50 flex justify-end gap-3";
  const inputStyle =
    "block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const switchContainer = "flex items-center";
  const switchLabel = "ml-3 text-sm font-medium text-gray-700";

  // Get category color based on borrowing limit
  const getCategoryColor = (limit) => {
    if (limit >= 5) return "bg-emerald-100 text-emerald-800";
    if (limit >= 3) return "bg-blue-100 text-blue-800";
    return "bg-indigo-100 text-indigo-800";
  };

  // Get loan duration description
  const getLoanDurationText = (category) => {
    let text = `${category.loanDuration} days`;
    return text;
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button
            onClick={fetchCategories}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Student Categories
          </h2>
          <p className="text-gray-600 mt-1">
            Manage borrowing limits and loan durations for different student
            categories
          </p>
        </div>
        <button
          onClick={() => setShowAddCategoryModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Category
        </button>
      </div>

      <div className="mb-6">
        <div className="relative w-full mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by Category Name..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-4 py-3 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">{category.name}</h3>
                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                      category.borrowingLimit
                    )}`}
                  >
                    {category.borrowingLimit}{" "}
                    {category.borrowingLimit === 1 ? "book" : "books"}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Borrowing Limit:
                    </span>
                    <span className="font-medium">
                      {category.borrowingLimit} books
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Loan Duration:
                    </span>
                    <span className="font-medium">
                      {getLoanDurationText(category)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Default Ban:</span>
                    <span className="font-medium">
                      {category.defaultBanDuration} days
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 mt-2"></div>
                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={() => openEditModal(category)}
                      className="flex-1 text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-md transition-colors shadow-sm text-sm flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(category)}
                      className="flex-1 text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md transition-colors shadow-sm text-sm flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No student categories found. Create a new category to get started.
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className={modalBackdrop}>
          <div className={modalContainer}>
            <div className={modalHeader}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Student Category
                </h3>
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="text-white opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-indigo-100 mt-1 text-sm">
                Create a new student category with borrowing limits
              </p>
            </div>
            <div className={modalBody}>
              <div className="space-y-5">
                <div>
                  <label className={labelStyle}>Category Name</label>
                  <input
                    type="text"
                    className={inputStyle}
                    placeholder="e.g. 5th Year, Graduate, etc."
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelStyle}>Borrowing Limit</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      className={inputStyle}
                      value={newCategory.borrowingLimit}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          borrowingLimit: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <span className="ml-2 text-gray-500">books</span>
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Loan Duration</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      className={inputStyle}
                      value={newCategory.loanDuration}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          loanDuration: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <span className="ml-2 text-gray-500">days</span>
                  </div>
                </div>
                <div className="pt-2">
                  <div>
                    <label className={labelStyle}>Default Ban Duration</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        className={inputStyle}
                        value={newCategory.defaultBanDuration}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            defaultBanDuration: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <span className="ml-2 text-gray-500">days</span>
                    </div>
                  </div>
                  <label className={switchContainer}>
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={newCategory.loanExtensionAllowed}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          loanExtensionAllowed: e.target.checked,
                        })
                      }
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className={switchLabel}>Allow Loan Extensions</span>
                  </label>
                </div>

                {newCategory.loanExtensionAllowed && (
                  <>
                    <div>
                      <label className={labelStyle}>Reservation Limit</label>
                      <input
                        type="number"
                        min="0"
                        className={inputStyle}
                        value={newCategory.extensionLimit}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            extensionLimit: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>Extension Duration</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="1"
                          className={inputStyle}
                          value={newCategory.extensionDuration}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              extensionDuration: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                        <span className="ml-2 text-gray-500">
                          days per extension
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-2 bg-indigo-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-indigo-800 mb-2">
                    Summary
                  </h4>
                  <div className="text-sm text-indigo-700">
                    <p>
                      Students in this category can borrow{" "}
                      <strong>{newCategory.borrowingLimit} books</strong> for{" "}
                      <strong>{newCategory.loanDuration} days</strong>.
                    </p>
                    {newCategory.loanExtensionAllowed ? (
                      <p className="mt-1">
                        They can extend for {newCategory.extensionDuration}{" "}
                        days, and they have {newCategory.extensionLimit} days to
                        pick up their reserved book.
                      </p>
                    ) : (
                      <p className="mt-1">No extensions allowed.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className={modalFooter}>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-lg transition-all shadow-md"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && (
        <div className={modalBackdrop}>
          <div className={modalContainer}>
            <div className={modalHeader}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Student Category
                </h3>
                <button
                  onClick={() => setShowEditCategoryModal(false)}
                  className="text-white opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-indigo-100 mt-1 text-sm">
                Update borrowing limits and loan duration for{" "}
                {editCategory.name}
              </p>
            </div>
            <div className={modalBody}>
              <div className="space-y-5">
                <div>
                  <label className={labelStyle}>Category Name</label>
                  <input
                    type="text"
                    className={inputStyle}
                    value={editCategory.name}
                    onChange={(e) =>
                      setEditCategory({ ...editCategory, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelStyle}>Borrowing Limit</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      className={inputStyle}
                      value={editCategory.borrowingLimit}
                      onChange={(e) =>
                        setEditCategory({
                          ...editCategory,
                          borrowingLimit: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <span className="ml-2 text-gray-500">books</span>
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Loan Duration</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      className={inputStyle}
                      value={editCategory.loanDuration}
                      onChange={(e) =>
                        setEditCategory({
                          ...editCategory,
                          loanDuration: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <span className="ml-2 text-gray-500">days</span>
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Default Ban Duration</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      className={inputStyle}
                      value={editCategory.defaultBanDuration}
                      onChange={(e) =>
                        setEditCategory({
                          ...editCategory,
                          defaultBanDuration: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <span className="ml-2 text-gray-500">days</span>
                  </div>
                </div>
                <div className="pt-2">
                  <label className={switchContainer}>
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={editCategory.loanExtensionAllowed}
                      onChange={(e) =>
                        setEditCategory({
                          ...editCategory,
                          loanExtensionAllowed: e.target.checked,
                        })
                      }
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className={switchLabel}>Allow Loan Extensions</span>
                  </label>
                </div>

                {editCategory.loanExtensionAllowed && (
                  <>
                    <div>
                      <label className={labelStyle}>
                        Reservation Days before Expiry
                      </label>

                      <input
                        type="number"
                        min="0"
                        className={inputStyle}
                        value={editCategory.extensionLimit}
                        onChange={(e) =>
                          setEditCategory({
                            ...editCategory,
                            extensionLimit: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>Extension Duration</label>
                      <div className="flex items-center">
                        {/* FIXED: changed from loanExtensionDuration to extensionDuration */}
                        <input
                          type="number"
                          min="1"
                          className={inputStyle}
                          value={editCategory.extensionDuration}
                          onChange={(e) =>
                            setEditCategory({
                              ...editCategory,
                              extensionDuration: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                        <span className="ml-2 text-gray-500">
                          days per extension
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-2 bg-indigo-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-indigo-800 mb-2">
                    Summary
                  </h4>
                  <div className="text-sm text-indigo-700">
                    <p>
                      Students in this category can borrow{" "}
                      <strong>{editCategory.borrowingLimit} books</strong> for{" "}
                      <strong>{editCategory.loanDuration} days</strong>.
                    </p>
                    {editCategory.loanExtensionAllowed ? (
                      <p className="mt-1">
                        They can extend for {editCategory.extensionDuration}{" "}
                        days, and they have {editCategory.extensionLimit} days
                        to pick up their reserved book.
                      </p>
                    ) : (
                      <p className="mt-1">No extensions allowed.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className={modalFooter}>
              <button
                onClick={() => setShowEditCategoryModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCategory}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-lg transition-all shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={modalBackdrop}>
          <div className={modalContainer}>
            <div className={modalHeader}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Confirm Deletion
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-white opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-indigo-100 mt-1 text-sm">
                This action cannot be undone
              </p>
            </div>
            <div className={modalBody}>
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mt-4">
                  Delete {categoryToDelete?.name}?
                </h3>
                <p className="text-gray-500 mt-2">
                  Are you sure you want to delete this student category? All
                  students in this category will be moved to the default
                  category.
                </p>
              </div>
            </div>
            <div className={modalFooter}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-md"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCategories;
