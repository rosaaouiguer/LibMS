import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainButton, TextButton } from "../common/buttons";
import { motion } from "framer-motion";

import {
  Book,
  BookOpen,
  Camera,
  ChevronLeft,
  Upload,
  X,
  Info,
  Hash,
  Link,
  Lock,
} from "lucide-react";

const BookForm = ({ book = null, onCancel }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    summary: "",
    keywords: "",
    imageURL: "",
    ebookLink: "",
    callNumber: "",
    totalCopies: 1,
    availableCopies: 1,
    barcode: "",
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!book; // Flag to check if we're in edit mode

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        isbn: book.isbn || "",
        summary: book.summary || "",
        keywords: book.keywords || "",
        imageURL: book.imageURL || "",
        ebookLink: book.ebookLink || "",
        callNumber: book.callNumber || "",
        totalCopies: book.totalCopies || 1,
        availableCopies: book.availableCopies || book.totalCopies || 1,
        barcode: book.barcode || "",
      });
      setImagePreview(book.imageURL);
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Convert numeric fields to numbers
    const numericFields = ["totalCopies", "availableCopies"];
    const processedValue = numericFields.includes(name)
      ? parseInt(value, 10) || 0 // Convert to integer, default to 0 if NaN
      : value;

    setFormData({
      ...formData,
      [name]: processedValue,
    });

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setFormData({
        ...formData,
        imageURL: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({
      ...formData,
      imageURL: "",
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.author.trim()) {
      newErrors.author = "Author is required";
    }

    if (!formData.isbn.trim()) {
      newErrors.isbn = "ISBN is required";
    }

    if (!isEditMode && formData.availableCopies > formData.totalCopies) {
      newErrors.availableCopies = "Available copies cannot exceed total copies";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log(formData);

      // In edit mode, ensure we preserve the original copies values
      const dataToSubmit = isEditMode
        ? {
            ...formData,
            totalCopies: book.totalCopies,
            availableCopies: book.availableCopies,
          }
        : formData;

      const url = isEditMode
        ? `https://lms-backend-zjt1.onrender.com/api/books/${book._id}`
        : `https://lms-backend-zjt1.onrender.com/api/books`;

      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save book");
      }

      const result = await response.json();
      console.log("Book saved successfully:", result);
      navigate("/books");
    } catch (error) {
      console.error("Error saving book:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-b from-indigo-50 to-white min-h-full overflow-auto pb-10"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center mb-8 pt-8">
          <motion.button
            whileHover={{ x: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            onClick={onCancel}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </motion.button>
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-center flex-1 text-gray-800"
          >
            {isEditMode ? "Edit Book" : "Add New Book"}
          </motion.h1>
        </div>

        {/* Form card */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            {/* Image upload section */}
            <div className="flex flex-col md:flex-row mb-10 items-start">
              <div className="w-full md:w-auto flex flex-col items-center mb-6 md:mb-0">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="w-48 h-64 border-2 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 shadow-sm relative"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Book cover"
                      className="max-w-full max-h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center p-4">
                      <BookOpen className="h-16 w-16 mx-auto mb-3 opacity-70" />
                      <p className="text-sm font-medium">No cover image</p>
                    </div>
                  )}
                </motion.div>
                <div className="mt-5 flex flex-col space-y-3 w-full">
                  <motion.label
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    htmlFor="cover-upload"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-center cursor-pointer inline-block transition-colors shadow-sm flex items-center justify-center gap-2 font-medium"
                  >
                    <Upload size={18} />
                    Upload Cover
                  </motion.label>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {imagePreview && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={removeImage}
                      className="text-gray-600 hover:text-red-600 text-center py-2 flex items-center justify-center gap-2 border border-gray-300 rounded-lg hover:border-red-200 transition-colors"
                    >
                      <X size={16} />
                      Remove Cover
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Form fields */}
              <div className="flex-1 md:ml-10 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                      Title <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter book title"
                      className={`w-full rounded-lg border ${
                        errors.title
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-300"
                      } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm`}
                    />
                    {errors.title && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1.5 flex items-center gap-1"
                      >
                        <Info size={14} />
                        {errors.title}
                      </motion.p>
                    )}
                  </div>

                  {/* Author */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                      Author <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      placeholder="Enter author name"
                      className={`w-full rounded-lg border ${
                        errors.author
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-300"
                      } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm`}
                    />
                    {errors.author && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1.5 flex items-center gap-1"
                      >
                        <Info size={14} />
                        {errors.author}
                      </motion.p>
                    )}
                  </div>

                  {/* ISBN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                      ISBN <Hash size={14} className="text-gray-400" />{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleChange}
                      placeholder="Enter ISBN"
                      className={`w-full rounded-lg border ${
                        errors.isbn
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-300"
                      } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm`}
                    />
                    {errors.isbn && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1.5 flex items-center gap-1"
                      >
                        <Info size={14} />
                        {errors.isbn}
                      </motion.p>
                    )}
                  </div>

                  {/* Keywords */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Keywords
                    </label>
                    <input
                      type="text"
                      name="keywords"
                      value={formData.keywords}
                      onChange={handleChange}
                      placeholder="Enter keywords separated by commas"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Separate keywords with commas
                    </p>
                  </div>

                  {/* E-book Link */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                      E-book Link <Link size={14} className="text-gray-400" />
                    </label>
                    <input
                      type="url"
                      name="ebookLink"
                      value={formData.ebookLink}
                      onChange={handleChange}
                      placeholder="Enter link to e-book"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
                    />
                  </div>

                  {/* Summary */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Summary
                    </label>
                    <textarea
                      name="summary"
                      value={formData.summary}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Enter a brief summary of the book"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
                    />
                  </div>

                  {/* Call Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Call Number
                    </label>
                    <input
                      type="text"
                      name="callNumber"
                      value={formData.callNumber}
                      onChange={handleChange}
                      placeholder="Enter call number"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
                    />
                  </div>

                  {/* Total Copies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                      Total Copies
                      {isEditMode && (
                        <Lock
                          size={14}
                          className="ml-2 text-gray-400"
                          title="Locked in edit mode"
                        />
                      )}
                    </label>
                    <input
                      type="number"
                      name="totalCopies"
                      min="1"
                      value={formData.totalCopies}
                      onChange={handleChange}
                      disabled={isEditMode}
                      className={`w-full rounded-lg border ${
                        isEditMode
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "border-gray-300"
                      } px-4 py-3 focus:outline-none ${
                        !isEditMode && "focus:ring-2 focus:ring-indigo-500"
                      } transition-all duration-200 shadow-sm`}
                    />
                    {isEditMode && (
                      <p className="mt-1 text-xs text-gray-500">
                        Cannot be modified in edit mode
                      </p>
                    )}
                  </div>

                  {/* Available Copies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                      Available Copies
                      {isEditMode && (
                        <Lock
                          size={14}
                          className="ml-2 text-gray-400"
                          title="Locked in edit mode"
                        />
                      )}
                    </label>
                    <input
                      type="number"
                      name="availableCopies"
                      min="0"
                      max={formData.totalCopies}
                      value={formData.availableCopies}
                      onChange={handleChange}
                      disabled={isEditMode}
                      className={`w-full rounded-lg border ${
                        isEditMode
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "border-gray-300"
                      } px-4 py-3 focus:outline-none ${
                        !isEditMode && "focus:ring-2 focus:ring-indigo-500"
                      } transition-all duration-200 shadow-sm`}
                    />
                    {isEditMode && (
                      <p className="mt-1 text-xs text-gray-500">
                        Cannot be modified in edit mode
                      </p>
                    )}
                    {errors.availableCopies && !isEditMode && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1.5 flex items-center gap-1"
                      >
                        <Info size={14} />
                        {errors.availableCopies}
                      </motion.p>
                    )}
                  </div>

                  {/* Barcode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Barcode
                    </label>
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      placeholder="Enter barcode"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100 mt-6">
              <TextButton
                text="Cancel"
                onClick={onCancel}
                className="hover:bg-gray-100 py-2.5 px-5 rounded-lg transition-colors"
              />
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MainButton
                  text={isEditMode ? "Save Changes" : "Add Book"}
                  type="submit"
                  disabled={isSubmitting}
                  className={`${
                    isSubmitting
                      ? "bg-indigo-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } py-2.5 px-6 rounded-lg transition-colors shadow-md`}
                />
              </motion.div>
            </div>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default BookForm;
