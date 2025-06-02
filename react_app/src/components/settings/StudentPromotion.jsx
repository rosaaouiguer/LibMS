import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const StudentPromotion = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [mappedFields, setMappedFields] = useState({});
  const [selectedFromCategory, setSelectedFromCategory] = useState("");
  const [selectedToCategory, setSelectedToCategory] = useState("");
  const [promotionInProgress, setPromotionInProgress] = useState(false);
  const [promotionComplete, setPromotionComplete] = useState(false);
  const [promotionStats, setPromotionStats] = useState({ total: 0, moved: 0 });
  const [errorMessages, setErrorMessages] = useState([]);
  const [studentCategoriesData, setStudentCategoriesData] = useState([]);

  // Ref for file input
  const fileInputRef = useRef(null);

  // Fetch categories at component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://lms-backend-zjt1.onrender.com/api/student-categories"
        );
        setStudentCategoriesData(response.data.data);
      } catch (error) {
        console.error("Error fetching student categories:", error);
        setErrorMessages(["Failed to load student categories"]);
      }
    };

    fetchCategories();
  }, []);

  // Required fields for the student promotion file
  const requiredFields = ["studentId", "name"];

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setPromotionComplete(false);
    setErrorMessages([]);
    setPreviewData([]);
    setColumns([]);
    setMappedFields({});
    setStudentList([]);

    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (fileExtension === "csv") {
      // Parse CSV
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length === 0) {
            setErrorMessages(["CSV file is empty or contains no valid data."]);
            return;
          }

          // Get headers and preview data
          const headers = Object.keys(results.data[0]);
          const preview = results.data.slice(0, 5);

          setPreviewData(preview);
          setColumns(headers);
          setStudentList(results.data);

          // Try to match fields automatically
          const initialMapping = {};
          headers.forEach((header) => {
            const requiredField = requiredFields.find(
              (reqField) => reqField.toLowerCase() === header.toLowerCase()
            );
            if (requiredField) {
              initialMapping[header] = requiredField;
            }
          });
          setMappedFields(initialMapping);
        },
        error: (error) => {
          setErrorMessages([`Error parsing CSV file: ${error.message}`]);
        },
      });
    } else if (["xlsx", "xls"].includes(fileExtension)) {
      // Handle Excel files
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            setErrorMessages(["Excel file is empty or could not be parsed"]);
            return;
          }

          // Extract headers
          const headers = Object.keys(jsonData[0]);
          const preview = jsonData.slice(0, 5);

          setPreviewData(preview);
          setColumns(headers);
          setStudentList(jsonData);

          // Initialize field mapping
          const initialMapping = {};
          headers.forEach((header) => {
            const requiredField = requiredFields.find(
              (reqField) => reqField.toLowerCase() === header.toLowerCase()
            );
            if (requiredField) {
              initialMapping[header] = requiredField;
            }
          });
          setMappedFields(initialMapping);
        } catch (error) {
          setErrorMessages([
            `Error parsing Excel file: ${error.message || "Unknown error"}`,
          ]);
        }
      };
      reader.onerror = () => {
        setErrorMessages(["Error reading Excel file"]);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrorMessages([
        `Unsupported file format: ${fileExtension}. Please upload CSV or Excel files.`,
      ]);
    }
  };

  // Update field mapping
  const updateFieldMapping = (columnName, mappedField) => {
    setMappedFields((prev) => ({
      ...prev,
      [columnName]: mappedField,
    }));
  };

  // Check if required fields are mapped
  const validateMapping = () => {
    const mappedValues = Object.values(mappedFields);
    return requiredFields.every((field) => mappedValues.includes(field));
  };

  // Handle promotion of students to new category
  const handlePromoteStudents = async () => {
    if (!validateMapping()) {
      setErrorMessages(["Please map all required fields before promoting."]);
      return;
    }

    if (!selectedFromCategory || !selectedToCategory) {
      setErrorMessages(["Please select both source and target categories."]);
      return;
    }

    setPromotionInProgress(true);
    setErrorMessages([]);

    try {
      // Extract student IDs from the mapped data
      const studentIds = studentList.map((row) => {
        const idField = Object.keys(mappedFields).find(
          (key) => mappedFields[key] === "studentId"
        );
        return row[idField];
      });

      // Call API to update student categories
      const response = await axios.post(
        "https://lms-backend-zjt1.onrender.com/api/student/bulk-update-category",
        {
          studentIds,
          fromCategoryId: selectedFromCategory,
          toCategoryId: selectedToCategory,
        }
      );

      // Show success results
      setPromotionComplete(true);
      setPromotionStats({
        total: studentIds.length,
        moved: response.data.updatedCount || studentIds.length,
      });
    } catch (error) {
      setErrorMessages([
        `Error promoting students: ${
          error.response?.data?.message || error.message || "Unknown error"
        }`,
      ]);
    } finally {
      setPromotionInProgress(false);
    }
  };

  // Reset the promotion process
  const resetPromotion = () => {
    setUploadedFile(null);
    setPreviewData([]);
    setColumns([]);
    setMappedFields({});
    setPromotionComplete(false);
    setErrorMessages([]);
    setStudentList([]);
    setSelectedFromCategory("");
    setSelectedToCategory("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      {/* Category Selection */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">
            Step 2: Select Categories
          </h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Category
              </label>
              <select
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={selectedFromCategory}
                onChange={(e) => setSelectedFromCategory(e.target.value)}
              >
                <option value="">Select source category</option>
                {studentCategoriesData.map((category) => (
                  <option key={`from-${category._id}`} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Category
              </label>
              <select
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={selectedToCategory}
                onChange={(e) => setSelectedToCategory(e.target.value)}
              >
                <option value="">Select target category</option>
                {studentCategoriesData.map((category) => (
                  <option key={`to-${category._id}`} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">
            Step 3: Upload List of Students to Promote
          </h3>
        </div>
        <div className="p-5">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              Upload a CSV or Excel file containing students who should be
              promoted. Your file should contain the following fields:
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {requiredFields.map((field) => (
                  <span
                    key={field}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div
            className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-300 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const input = fileInputRef.current;
                if (input) {
                  input.files = e.dataTransfer.files;
                  handleFileChange({ target: input });
                }
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mt-2 text-sm font-medium text-gray-600">
              Drag and drop your file here, or{" "}
              <label className="text-indigo-600 hover:text-indigo-800 cursor-pointer">
                browse
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </label>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: CSV, Excel (.xlsx, .xls)
            </p>
          </div>

          {uploadedFile && (
            <div className="mt-4 bg-green-50 p-3 rounded-lg flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mt-0.5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800">
                  File uploaded successfully
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(2)}{" "}
                  KB)
                </p>
              </div>
            </div>
          )}

          {errorMessages.length > 0 && (
            <div className="mt-4 bg-red-50 p-3 rounded-lg">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-500 mt-0.5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {errorMessages.length > 1
                      ? "Errors occurred:"
                      : errorMessages[0]}
                  </p>
                  {errorMessages.length > 1 && (
                    <ul className="mt-1 text-xs text-red-700 list-disc list-inside">
                      {errorMessages.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Preview */}
      {previewData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">
              Step 3: Map Fields and Review Data
            </h3>
          </div>
          <div className="p-5">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Map your file columns to the correct fields:
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column, i) => (
                      <th
                        key={i}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <div className="flex flex-col">
                          <span>{column}</span>
                          <select
                            className="mt-1 text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-full"
                            value={mappedFields[column] || ""}
                            onChange={(e) =>
                              updateFieldMapping(column, e.target.value)
                            }
                          >
                            <option value="">Select field</option>
                            {requiredFields.map((field) => (
                              <option key={field} value={field}>
                                {field}
                              </option>
                            ))}
                            <option value="ignore">-- Ignore Column --</option>
                          </select>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {row[column]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={resetPromotion}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start Over
              </button>
              <button
                onClick={handlePromoteStudents}
                className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white 
                  ${
                    validateMapping() &&
                    selectedFromCategory &&
                    selectedToCategory
                      ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                disabled={
                  !validateMapping() ||
                  !selectedFromCategory ||
                  !selectedToCategory
                }
              >
                Promote Students
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Progress */}
      {promotionInProgress && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">
              Promotion in Progress
            </h3>
          </div>
          <div className="p-5">
            <div className="mb-2 flex justify-between text-sm text-gray-600">
              <span>Processing category change...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-700 h-2.5 rounded-full animate-pulse"
                style={{ width: "100%" }}
              ></div>
            </div>
            <p className="mt-3 text-sm text-gray-500 text-center">
              Please wait while we update student categories...
            </p>
          </div>
        </div>
      )}

      {/* Promotion Results */}
      {promotionComplete && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-5 border-b border-green-200 bg-green-50">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-green-800">
                Promotion Complete
              </h3>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-6 justify-center mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">
                  {promotionStats.total}
                </div>
                <div className="text-gray-500 text-sm">Students Processed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {promotionStats.moved}
                </div>
                <div className="text-gray-500 text-sm">
                  Successfully Promoted
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={resetPromotion}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Promote More Students
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPromotion;
