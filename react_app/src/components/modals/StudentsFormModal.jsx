import React, { useState, useEffect } from "react";

export const StudentsFormModal = ({ student = null, onClose, onSave }) => {
  // State for loading categories
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Log the student prop to diagnose issues when component mounts
  useEffect(() => {
    console.log("Student data received:", student);
  }, [student]);

  const [formData, setFormData] = useState({
    _id: student?._id || "", // Add MongoDB _id
    name: student?.name || "",
    id: student?.id || student?.studentId || "", // Check both property names
    email: student?.email || "",
    phone: student?.phone || student?.phoneNumber || "", // Check both property names
    dob: student?.dob || "",
    category: student?.category?._id || "", // Store ObjectId as string
    image_path: student?.image || "assets/defaultItemPic.png",
    image: null, // For handling file upload
  });

  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    id: "",
  });

  // Update formData when student prop changes
  useEffect(() => {
    if (student) {
      console.log("Updating form data with student:", student);
      setFormData({
        _id: student._id || "",
        name: student.name || "",
        id: student.id || student.studentId || "", // Check both property names
        email: student.email || "",
        phone: student.phone || student.phoneNumber || "", // Check both property names
        dob: student.dob || "",
        category: student.category?._id || "",
        image_path:
          student.image || student.image_path || "assets/defaultItemPic.png",
        banned: student.banned,
        bannedUntil: student.bannedUntil,
        image: null,
      });
    }
  }, [student]);

  // Fetch student categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        // Add cache-busting query parameter to avoid 304 responses
        const response = await fetch(
          `https://lms-backend-zjt1.onrender.com/api/student-categories?_=${Date.now()}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch student categories");
        }
        const data = await response.json();

        // Debug the response
        console.log("API Response:", data);
        console.log("Response type:", typeof data);

        // Make sure data is an array before setting it to state
        if (Array.isArray(data)) {
          console.log(
            "Setting categories directly from array, length:",
            data.length
          );
          setCategories(data);
        } else if (data && typeof data === "object") {
          // Check for common response patterns
          if (Array.isArray(data.categories)) {
            console.log(
              "Setting categories from data.categories, length:",
              data.categories.length
            );
            setCategories(data.categories);
          } else if (Array.isArray(data.data)) {
            console.log(
              "Setting categories from data.data, length:",
              data.data.length
            );
            setCategories(data.data);
          } else if (Array.isArray(data.results)) {
            console.log(
              "Setting categories from data.results, length:",
              data.results.length
            );
            setCategories(data.results);
          } else {
            console.log(
              "Response is an object but doesn't contain expected array"
            );
            setCategories([]);
            setLoadError("API returned unexpected data format");
          }
        } else {
          // If neither, set to empty array and show error
          console.log("Response is not an array or object");
          setCategories([]);
          throw new Error("Invalid categories data received");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoadError("Failed to load student categories. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle date conversion when the date input changes
    if (name === "dob") {
      // Store date in DD/MM/YYYY format for the API when date input changes
      const dateObj = new Date(value);
      if (!isNaN(dateObj.getTime())) {
        const formattedDate = `${dateObj
          .getDate()
          .toString()
          .padStart(2, "0")}/${(dateObj.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${dateObj.getFullYear()}`;
        setFormData((prev) => ({ ...prev, dob: formattedDate }));
      } else {
        // If invalid date, just store the raw value
        setFormData((prev) => ({ ...prev, dob: value }));
      }
    } else {
      // For non-date fields, handle normally
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear errors when user makes changes
    setFormError("");
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Add the image file to formData
      setFormData((prev) => ({
        ...prev,
        image: e.target.files[0],
        image_path: URL.createObjectURL(e.target.files[0]), // Preview image
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      // Handle field-specific errors
      if (error.message) {
        if (
          error.message.includes("email") &&
          error.message.includes("already used")
        ) {
          setFieldErrors((prev) => ({
            ...prev,
            email: "This email is already registered to another student",
          }));
        } else if (
          error.message.includes("studentId") &&
          error.message.includes("already used")
        ) {
          setFieldErrors((prev) => ({
            ...prev,
            id: "This Student ID is already assigned to another student",
          }));
        } else {
          // Display general error in the form
          setFormError(
            error.message || "Failed to save student. Please try again."
          );
        }
      } else {
        setFormError("Failed to save student. Please try again.");
      }
    }
  };

  // Safe way to find selected category
  const selectedCategory = Array.isArray(categories)
    ? categories.find((cat) => cat._id === formData.category)
    : null;

  // For the date input field, convert DD/MM/YYYY to YYYY-MM-DD
  const getDateInputValue = () => {
    if (!formData.dob) return "";
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(formData.dob)) {
      return formData.dob;
    }
    // Try to convert from DD/MM/YYYY to YYYY-MM-DD
    const parts = formData.dob.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return "";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {student ? "Edit Student" : "Add New Student"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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

        {/* Form Error Message */}
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {formError}
          </div>
        )}

        {/* Categories loading error */}
        {loadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {loadError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4 p-1">
                <img
                  src={formData.image_path || "/assets/defaultItemPic.png"}
                  alt="Student Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-1 px-3 rounded-md transition-all"
              >
                Change Photo
              </label>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                  placeholder="Enter student's full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  className={`w-full border ${
                    fieldErrors.id ? "border-red-500" : "border-gray-300"
                  } rounded-md py-2 px-3 text-sm`}
                  placeholder="e.g., 1Y001"
                  required
                />
                {fieldErrors.id && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full border ${
                    fieldErrors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md py-2 px-3 text-sm`}
                  placeholder="student@example.com"
                  required
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                  placeholder="e.g., 555-123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={getDateInputValue()}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                  disabled={isLoading}
                  required
                >
                  <option value="">Select a category</option>
                  {Array.isArray(categories) &&
                    categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name} - {category.description}
                      </option>
                    ))}
                </select>
                {isLoading && (
                  <p className="text-gray-500 text-xs mt-1">
                    Loading categories...
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
            >
              Save Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
