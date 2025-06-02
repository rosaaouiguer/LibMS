// services/studentApi.js
import axios from "axios";

const API_URL = "https://lms-backend-zjt1.onrender.com/api/student";

// Convert backend date format to frontend format
const formatDateForFrontend = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
};

// Convert frontend date format to backend format
const formatDateForBackend = (dateString) => {
  if (!dateString) return null;

  // First, check if it's already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Otherwise try to parse as day/month/year
  try {
    const [day, month, year] = dateString.split("/");
    return new Date(year, month - 1, day).toISOString().split("T")[0];
  } catch (err) {
    // If parsing fails, return the original string
    console.error("Error formatting date:", err);
    return dateString;
  }
};

// Map backend student to frontend format
const mapToFrontendStudent = (student) => {
  return {
    _id: student._id, // Add MongoDB ID for API operations
    name: student.name,
    id: student.studentId,
    email: student.email,
    dob: formatDateForFrontend(student.dateOfBirth),
    phone: student.phoneNumber || "",
    // Properly handle category object including all relevant properties
    category:
      typeof student.category === "object" && student.category !== null
        ? {
            _id: student.category._id,
            name: student.category.name || "Undergraduate",
            description: student.category.description,
            borrowingLimit: student.category.borrowingLimit,
            loanDuration: student.category.loanDuration,
            loanExtensionAllowed: student.category.loanExtensionAllowed,
            extensionLimit: student.category.extensionLimit,
            extensionDuration: student.category.extensionDuration,
          }
        : student.category || "Undergraduate",
    banned: student.banned || false,
    bannedUntil: student.bannedUntil || null,
    image_path: student.image || "/assets/defaultItemPic.png",
  };
};

// Map frontend student to backend format
const mapToBackendStudent = (student) => {
  return {
    name: Array.isArray(student.name) ? student.name.join(" ") : student.name,
    studentId: student.studentId || student.id,
    email:
      student.email ||
      (Array.isArray(student.name)
        ? `${student.name[1]?.toLowerCase() || ""}.${
            student.name[0]?.toLowerCase() || ""
          }@ensia.edu.dz`
        : student.name?.split(" ").slice(0, 2).join(".").toLowerCase() +
          "@ensia.edu.dz"),
    dateOfBirth: student.dateOfBirth || formatDateForBackend(student.dob),
    phoneNumber: student.phoneNumber || student.phone,
    category:
      student.category && typeof student.category === "object"
        ? student.category._id
        : student.category,
    password: student.password || "",
    banned: student.banned || false,
    bannedUntil: student.bannedUntil,
  };
};

// Get all students
export const getAllStudents = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.data.map(mapToFrontendStudent);
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

// Get a single student by ID
export const getStudentById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return mapToFrontendStudent(response.data.data);
  } catch (error) {
    console.error(`Error fetching student ${id}:`, error);
    throw error;
  }
};

// Create a new student
export const createStudent = async (student, image) => {
  try {
    const formData = new FormData();
    const backendStudent = mapToBackendStudent(student);

    console.log("Student data being sent to API:", backendStudent);

    Object.keys(backendStudent).forEach((key) => {
      if (backendStudent[key] !== null && backendStudent[key] !== undefined) {
        formData.append(key, backendStudent[key]);
      }
    });

    if (student.image) {
      formData.append("image", student.image);
    }

    const response = await axios.post(API_URL, backendStudent);
    return response.data.data;
  } catch (error) {
    console.error("Error creating student:", error);
    if (error.response && error.response.data) {
      console.error("Server response:", error.response.data);
      if (error.response.data.error) {
        throw new Error(
          Array.isArray(error.response.data.error)
            ? error.response.data.error.join(", ")
            : error.response.data.error
        );
      }
    }
    throw error;
  }
};

// Update an existing student
export const updateStudent = async (id, student, image) => {
  try {
    const formData = new FormData();
    const backendStudent = mapToBackendStudent(student);

    // Add student data to form data
    Object.keys(backendStudent).forEach((key) => {
      if (backendStudent[key] !== null && backendStudent[key] !== undefined) {
        formData.append(key, backendStudent[key]);
      }
    });

    // Add image if provided
    if (student.image) {
      formData.append("image", student.image);
    }

    // Use MongoDB _id for update operations, not the studentId
    const mongoId = student._id;
    const response = await axios.put(`${API_URL}/${mongoId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return mapToFrontendStudent(response.data.data);
  } catch (error) {
    console.error(`Error updating student ${id}:`, error);
    if (error.response && error.response.data && error.response.data.error) {
      // Handle validation errors from backend
      throw new Error(
        Array.isArray(error.response.data.error)
          ? error.response.data.error.join(", ")
          : error.response.data.error
      );
    }
    throw error;
  }
};

// Delete a student
export const deleteStudent = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting student ${id}:`, error);
    throw error;
  }
};

// Search students
export const searchStudents = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/search`, { params: query });
    return response.data.data.map(mapToFrontendStudent);
  } catch (error) {
    console.error("Error searching students:", error);
    throw error;
  }
};

// Ban a student
export const banStudent = async (student, bannedUntil) => {
  try {
    // Use the MongoDB _id directly, not the student ID (studentId)
    const mongoId = student._id;

    const response = await axios.put(`${API_URL}/${mongoId}`, {
      banned: true,
      bannedUntil,
    });

    return mapToFrontendStudent(response.data.data);
  } catch (error) {
    console.error(`Error banning student:`, error);
    throw error;
  }
};

// Unban a student
export const unbanStudent = async (student) => {
  try {
    // Use MongoDB _id, not studentId
    const mongoId = student._id;

    const response = await axios.put(`${API_URL}/${mongoId}`, {
      banned: false,
      bannedUntil: null,
    });

    return mapToFrontendStudent(response.data.data);
  } catch (error) {
    console.error(`Error unbanning student:`, error);
    throw error;
  }
};
