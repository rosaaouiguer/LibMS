import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { createStudent } from "../../services/studentApi";
import { createBook } from "../../services/bookApi";
import StudentPromotion from "./StudentPromotion";

const ImportData = () => {
  const [importType, setImportType] = useState("students");
  const [activeTab, setActiveTab] = useState("import");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [mappedFields, setMappedFields] = useState({});
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [importInProgress, setImportInProgress] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importStats, setImportStats] = useState({
    total: 0,
    success: 0,
    errors: 0,
  });
  const [errorMessages, setErrorMessages] = useState([]);
  const [showPromotionSection, setShowPromotionSection] = useState(false);
  const [allData, setAllData] = useState([]);

  // Refs
  const fileInputRef = useRef(null);

  const [studentCategoriesData, setStudentCategoriesData] = useState([]);

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

    if (importType === "students") {
      fetchCategories();
    }
  }, [importType]);

  const requiredFields = {
    students: [
      "name",
      "studentId",
      "dateOfBirth",
      "email",
      "category",
      "phone",
    ],
    books: [
      "title",
      "author",
      "isbn",
      "callNumber",
      "totalCopies",
      "availableCopies",
    ],
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setImportSuccess(false);
    setErrorMessages([]);
    setPreviewData([]);
    setColumns([]);
    setMappedFields({});
    setAllData([]);

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
          setAllData(results.data);

          // Try to match fields automatically
          const initialMapping = {};
          headers.forEach((header) => {
            const requiredField = requiredFields[importType].find(
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
          setAllData(jsonData);

          // Initialize field mapping
          const initialMapping = {};
          headers.forEach((header) => {
            const requiredField = requiredFields[importType].find(
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

  // Open field mapping modal
  const openMappingModal = () => {
    if (!uploadedFile) {
      setErrorMessages(["Please upload a file first."]);
      return;
    }

    if (columns.length === 0) {
      setErrorMessages(["No columns found in the uploaded file."]);
      return;
    }

    setShowMappingModal(true);
  };

  // Update field mapping
  const updateFieldMapping = (columnName, mappedField) => {
    setMappedFields((prev) => ({
      ...prev,
      [columnName]: mappedField,
    }));
  };

  const validateMapping = () => {
    const mappedValues = Object.values(mappedFields).filter(
      (value) => value && value !== "ignore"
    );

    if (importType === "books") {
      const essentialBookFields = ["title", "author", "isbn"];
      return essentialBookFields.every((field) => mappedValues.includes(field));
    }

    if (importType === "students") {
      const essentialStudentFields = ["name", "studentId", "dateOfBirth"];
      return essentialStudentFields.every((field) =>
        mappedValues.includes(field)
      );
    }

    return false;
  };

  // Inside ImportData.jsx → transformData(row) (replace full function body)
  const transformData = (row) => {
    const transformedData = {};
    const nameParts = [];

    Object.keys(mappedFields).forEach((fileColumn) => {
      const apiField = mappedFields[fileColumn];
      if (!apiField || apiField === "ignore") return;

      if (apiField === "name") {
        const namePart = row[fileColumn];
        if (namePart) nameParts.push(namePart);
        transformedData.name = nameParts;
        return;
      }

      if (apiField === "category") {
        const categoryValue = row[fileColumn];
        const numberMatch = categoryValue ? categoryValue.match(/\d+/) : null;
        const categoryNumber = numberMatch ? numberMatch[0] : null;

        let categoryObject = null;
        if (categoryNumber) {
          categoryObject = studentCategoriesData.find((cat) =>
            cat.name.includes(categoryNumber)
          );
        }

        if (!categoryObject && categoryValue) {
          categoryObject = studentCategoriesData.find(
            (cat) =>
              cat.name === categoryValue ||
              cat.name.trim() === categoryValue.trim()
          );
          if (!categoryObject) {
            categoryObject = studentCategoriesData.find((cat) =>
              cat.name.includes(categoryValue.trim())
            );
          }
          if (!categoryObject) {
            categoryObject = studentCategoriesData.find((cat) => {
              const match = cat.name.match(/\(([^)]+)\)/);
              return match && match[1] === categoryValue.trim();
            });
          }
        }

        transformedData[apiField] = categoryObject
          ? categoryObject._id
          : studentCategoriesData[0]?._id || null;
        return;
      }

      if (apiField === "phone") {
        transformedData["phoneNumber"] = row[fileColumn];
        return;
      }

      if (apiField === "dateOfBirth") {
        const dateValue = row[fileColumn];
        if (dateValue) {
          try {
            const parts = dateValue.split("/");
            let date =
              parts.length === 3
                ? new Date(parts[2], parts[1] - 1, parts[0])
                : new Date(dateValue);
            transformedData[apiField] = !isNaN(date)
              ? date.toISOString().split("T")[0]
              : dateValue;
          } catch {
            transformedData[apiField] = dateValue;
          }
        }
        return;
      }

      transformedData[apiField] = row[fileColumn];
    });

    Object.keys(row).forEach((columnName) => {
      const columnValue = row[columnName];
      if (typeof columnValue === "string") {
        const dateMatch = columnValue.match(/(\d{2}\/\d{2}\/\d{4})/);
        if (dateMatch && columnValue.toLowerCase().includes("pénal")) {
          try {
            const [day, month, year] = dateMatch[1].split("/");
            const date = new Date(year, month - 1, day);
            if (!isNaN(date)) {
              transformedData.bannedUntil = date.toISOString().split("T")[0];
              transformedData.banned = true;
            }
          } catch {}
        }
      }
    });

    if (Array.isArray(transformedData.name)) {
      transformedData.name = transformedData.name.join(" ");
    }

    if (importType === "students") {
      if (!transformedData.email && transformedData.name) {
        const parts = transformedData.name.split(" ");
        if (parts.length >= 2) {
          const firstNameParts = parts.slice(1).map((part) =>
            part
              .toLowerCase()
              .normalize("NFD")
              .replace(/[̀-ͯ]/g, "")
              .replace(/[^a-z0-9.]/g, ".")
          );
          const lastNameParts = parts[0]
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^a-z0-9.]/g, ".");
          transformedData.email = `${firstNameParts.join(
            "."
          )}.${lastNameParts}@ensia.edu.dz`;
        } else {
          const emailName = parts[0]
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^a-z0-9.]/g, ".");
          transformedData.email = `${emailName}@ensia.edu.dz`;
        }
      }
      if (!transformedData.password) transformedData.password = "";
      if (transformedData.studentId)
        transformedData.id = transformedData.studentId;
      if (transformedData.dateOfBirth)
        transformedData.dob = transformedData.dateOfBirth;
    }

    if (importType === "books") {
      if (!transformedData.hasOwnProperty("callNumber")) {
        transformedData.callNumber = "";
      }
      if (!transformedData.hasOwnProperty("totalCopies")) {
        transformedData.totalCopies = 1;
      } else {
        transformedData.totalCopies =
          parseInt(transformedData.totalCopies) || 1;
      }
      if (!transformedData.hasOwnProperty("availableCopies")) {
        transformedData.availableCopies = 0;
      } else {
        transformedData.availableCopies =
          parseInt(transformedData.availableCopies) || 0;
      }
    }

    return transformedData;
  };

  // Update the handleImport function to include more detailed error handling
  const handleImport = async () => {
    if (!validateMapping()) {
      setErrorMessages(["Please map all required fields before importing."]);
      return;
    }

    // Check if mapped fields correspond to the required fields
    const mappedValues = Object.values(mappedFields).filter(
      (value) => value && value !== "ignore"
    );
    let missingFields = [];

    if (importType === "books") {
      const essentialBookFields = ["title", "author", "isbn"];
      missingFields = essentialBookFields.filter(
        (field) => !mappedValues.includes(field)
      );
    } else {
      // For students, only require essential fields
      const essentialStudentFields = ["name", "studentId", "dateOfBirth"];
      missingFields = essentialStudentFields.filter(
        (field) => !mappedValues.includes(field)
      );
    }

    if (missingFields.length > 0) {
      setErrorMessages([
        `Missing required field mappings: ${missingFields.join(", ")}`,
      ]);
      return;
    }

    // Check if categories were loaded - warn user if not
    if (importType === "students" && studentCategoriesData.length === 0) {
      setErrorMessages([
        "Warning: Student categories could not be loaded. Category mapping may not work correctly.",
      ]);
      return;
    }

    setImportInProgress(true);
    setImportProgress(0);
    setErrorMessages([]);

    const total = allData.length;
    let success = 0;
    let errors = 0;
    let errorsList = [];

    // Process data in batches to show progress
    const batchSize = 10;
    const batches = Math.ceil(total / batchSize);

    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, total);
      const batch = allData.slice(start, end);

      // Process each item in the batch
      const results = await Promise.allSettled(
        batch.map(async (row, index) => {
          try {
            // Transform the data according to mappings
            const transformedData = transformData(row);

            // Debug output to console with more details
            console.log(`Processing row ${start + index + 1}:`);
            console.log("Original row data:", JSON.stringify(row));
            console.log("Transformed data:", JSON.stringify(transformedData));

            if (importType === "students") {
              // Validate required fields before API call
              const missingRequiredFields = [];
              if (!transformedData.studentId)
                missingRequiredFields.push("studentId");
              if (!transformedData.dateOfBirth)
                missingRequiredFields.push("dateOfBirth");
              if (!transformedData.name) missingRequiredFields.push("name");
              if (!transformedData.email) missingRequiredFields.push("email");
              if (!transformedData.category)
                missingRequiredFields.push("category");

              if (missingRequiredFields.length > 0) {
                throw new Error(
                  `Missing required fields: ${missingRequiredFields.join(", ")}`
                );
              }

              // Make the API call
              await createStudent(transformedData);
            } else if (importType === "books") {
              // For books, validate essential fields
              const missingBookFields = [];
              if (!transformedData.title) missingBookFields.push("title");
              if (!transformedData.author) missingBookFields.push("author");
              if (!transformedData.isbn) missingBookFields.push("isbn");

              if (missingBookFields.length > 0) {
                throw new Error(
                  `Missing required book fields: ${missingBookFields.join(
                    ", "
                  )}`
                );
              }

              // Double check that default values are set
              console.log("Book data being sent to API:", {
                title: transformedData.title,
                author: transformedData.author,
                isbn: transformedData.isbn,
                callNumber:
                  transformedData.callNumber !== undefined
                    ? transformedData.callNumber
                    : "",
                totalCopies:
                  transformedData.totalCopies !== undefined
                    ? transformedData.totalCopies
                    : 1,
                availableCopies:
                  transformedData.availableCopies !== undefined
                    ? transformedData.availableCopies
                    : 0,
              });

              // Make the API call
              await createBook(transformedData);
            }

            return { success: true };
          } catch (error) {
            console.error("Import error:", error);
            // More detailed error logging
            const errorResponse = error.response?.data;
            console.error("API error response:", errorResponse);

            return {
              success: false,
              error:
                error.response?.data?.message ||
                error.message ||
                "Unknown error",
              data: row,
              rowIndex: start + index,
              apiResponse: errorResponse,
            };
          }
        })
      );

      // Count successes and errors
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          if (result.value.success) {
            success++;
          } else {
            errors++;
            errorsList.push(
              `Row ${result.value.rowIndex + 1} error: ${result.value.error}`
            );

            // Log additional error details if available
            if (result.value.apiResponse) {
              console.error(
                `Detailed API error for row ${result.value.rowIndex + 1}:`,
                result.value.apiResponse
              );
            }
          }
        } else {
          errors++;
          errorsList.push(`Processing error: ${result.reason}`);
        }
      });

      // Update progress
      const progress = Math.min(
        Math.round((((i + 1) * batchSize) / total) * 100),
        100
      );
      setImportProgress(progress);

      // Update stats as we go
      setImportStats({
        total,
        success,
        errors,
      });

      // Limit error messages to avoid UI overload
      if (errorsList.length > 5) {
        setErrorMessages([
          ...errorsList.slice(0, 5),
          `...and ${errorsList.length - 5} more errors`,
        ]);
      } else {
        setErrorMessages(errorsList);
      }
    }

    setImportInProgress(false);
    setImportSuccess(true);

    if (importType === "students" && success > 0) {
      setShowPromotionSection(true);
    }
  };
  // Reset the import process
  const resetImport = () => {
    setUploadedFile(null);
    setPreviewData([]);
    setColumns([]);
    setMappedFields({});
    setImportSuccess(false);
    setErrorMessages([]);
    setAllData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Reset state when import type changes
  useEffect(() => {
    resetImport();
  }, [importType]);

  // Modal backdrop and container styles
  const modalBackdrop =
    "fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50";
  const modalContainer =
    "bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden";
  const modalHeader =
    "bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-5";
  const modalBody = "p-6";
  const modalFooter = "px-6 py-4 bg-gray-50 flex justify-end gap-3";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Import</h2>
          <p className="text-gray-600 mt-1">
            Import students or books data from CSV or Excel files
          </p>
        </div>
      </div>

      {/* Step 1: Import Type Selector - ALWAYS SHOWN FIRST */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">
            Step 1: Select Import Type
          </h3>
        </div>
        <div className="p-5">
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setImportType("students");
                setActiveTab("import");
              }}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                importType === "students"
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 hover:border-indigo-200 hover:bg-indigo-50"
              }`}
            >
              <div className="flex items-center justify-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h4 className="font-medium text-center">Students</h4>
              <p className="text-sm text-gray-500 text-center mt-1">
                Import student records
              </p>
            </button>

            <button
              onClick={() => setImportType("books")}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                importType === "books"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-purple-200 hover:bg-purple-50"
              }`}
            >
              <div className="flex items-center justify-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h4 className="font-medium text-center">Books</h4>
              <p className="text-sm text-gray-500 text-center mt-1">
                Import book records
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Tab Navigation - ONLY FOR STUDENTS */}
      {importType === "students" && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("import")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex-1 ${
                  activeTab === "import"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 inline-block mr-2"
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
                Import Students
              </button>
              <button
                onClick={() => setActiveTab("promotion")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex-1 ${
                  activeTab === "promotion"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 inline-block mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                Student Promotion
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Content Area - Show Promotion or Import based on selection */}
      {importType === "students" && activeTab === "promotion" ? (
        <StudentPromotion
          studentCategoriesData={studentCategoriesData}
          onPromotionComplete={() => {}}
        />
      ) : (
        /* Import Section - Step 3: File Upload */
        <>
          {/* File Upload */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">
                Step 2: Upload Your File
              </h3>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Upload a CSV or Excel file containing your {importType} data.
                  Your file should contain the following fields:
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {requiredFields[importType].map((field) => (
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
                      {uploadedFile.name} (
                      {(uploadedFile.size / 1024).toFixed(2)} KB)
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

          {/* Data Preview and Mapping */}
          {previewData.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
              {/* ...rest of the Data Preview section... */}
              <div className="p-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">
                  {importType === "students"
                    ? "Step 4: Data Preview & Field Mapping"
                    : "Step 3: Data Preview & Field Mapping"}
                </h3>
              </div>
              <div className="p-5">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Review your data and map the columns to the correct fields:
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
                                {requiredFields[importType].map((field) => (
                                  <option key={field} value={field}>
                                    {field}
                                  </option>
                                ))}
                                <option value="ignore">
                                  -- Ignore Column --
                                </option>
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
                          className={
                            rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
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
                    onClick={resetImport}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Start Over
                  </button>
                  <button
                    onClick={handleImport}
                    className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white 
                      ${
                        validateMapping()
                          ? "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    disabled={!validateMapping()}
                  >
                    Import Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Import Progress & Results - Always visible when active */}
      {importInProgress && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">
              Import in Progress
            </h3>
          </div>
          <div className="p-5">
            <div className="mb-2 flex justify-between text-sm text-gray-600">
              <span>Processing...</span>
              <span>{importProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-700 h-2.5 rounded-full"
                style={{ width: `${importProgress}%` }}
              ></div>
            </div>
            <p className="mt-3 text-sm text-gray-500 text-center">
              Please wait while we process your data...
            </p>
          </div>
        </div>
      )}

      {importSuccess && (
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
                Import Complete
              </h3>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-6 justify-center mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">
                  {importStats.total}
                </div>
                <div className="text-gray-500 text-sm">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {importStats.success}
                </div>
                <div className="text-gray-500 text-sm">
                  Successfully Imported
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {importStats.errors}
                </div>
                <div className="text-gray-500 text-sm">Errors</div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={resetImport}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Import More Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Mapping Modal */}
      {showMappingModal && (
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2                     h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Map Data Fields
                </h3>
                <button
                  onClick={() => setShowMappingModal(false)}
                  className="text-white hover:text-gray-200"
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
              <p className="mt-2 text-indigo-100">
                Match your file columns to the system fields
              </p>
            </div>

            <div className={modalBody}>
              <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500 mt-0.5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Required fields: {requiredFields[importType].join(", ")}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Please ensure all required fields are mapped before
                      proceeding.
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        File Column
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Mapped To
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {columns.map((column) => {
                      const isRequired = requiredFields[importType].includes(
                        mappedFields[column]
                      );
                      return (
                        <tr key={column}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {column}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                              value={mappedFields[column] || ""}
                              onChange={(e) =>
                                updateFieldMapping(column, e.target.value)
                              }
                            >
                              <option value="">-- Select Field --</option>
                              {requiredFields[importType].map((field) => (
                                <option key={field} value={field}>
                                  {field}
                                </option>
                              ))}
                              <option value="ignore">
                                -- Ignore Column --
                              </option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {mappedFields[column] ? (
                              isRequired ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Required
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  Mapped
                                </span>
                              )
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                Not Mapped
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

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
                        {errorMessages[0]}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={modalFooter}>
              <button
                type="button"
                onClick={() => setShowMappingModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateMapping()) {
                    setShowMappingModal(false);
                  } else {
                    const missingFields = requiredFields[importType].filter(
                      (field) => !Object.values(mappedFields).includes(field)
                    );
                    setErrorMessages([
                      `Please map all required fields. Missing: ${missingFields.join(
                        ", "
                      )}`,
                    ]);
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Confirm Mapping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportData;
