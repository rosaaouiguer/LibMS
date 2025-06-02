import React, { useState, useEffect } from "react";
import UserAPI from "../../services/userApi";
import { SearchBar } from "../common/searchbar";

const StaffMembers = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStaffMembers, setFilteredStaffMembers] = useState([]);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
  });

  const [editStaff, setEditStaff] = useState({
    id: null,
    name: "",
    email: "",
  });

  const [newRole, setNewRole] = useState("");
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [passwordReset, setPasswordReset] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [users, roles] = await Promise.all([
          UserAPI.getAllUsers(),
          UserAPI.getRoles()
        ]);
        setStaffMembers(users);
        setRoles(roles);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter staff members based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredStaffMembers(staffMembers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = staffMembers.filter(
      (staff) =>
        staff.name.toLowerCase().includes(query) ||
        staff.email.toLowerCase().includes(query) ||
        (staff.roleId && staff.roleId.roleName.toLowerCase().includes(query))
    );

    setFilteredStaffMembers(filtered);
  }, [searchQuery, staffMembers]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Add new staff member
  const handleAddStaff = async () => {
    try {
      const user = await UserAPI.createUser(newStaff);
      setStaffMembers([...staffMembers, user]);
      setNewStaff({ name: "", email: "", password: "", roleId: "" });
      setShowAddStaffModal(false);
    } catch (err) {
      setError(err.message || "Failed to add staff member");
    }
  };

  // Open edit modal
  const openEditModal = (staff) => {
    setEditStaff({
      id: staff._id,
      name: staff.name,
      email: staff.email,
    });
    setShowEditStaffModal(true);
  };

  // Update staff member
  const handleEditStaff = async () => {
    try {
      const updatedUser = await UserAPI.updateUser(editStaff.id, {
        name: editStaff.name,
        email: editStaff.email
      });
      setStaffMembers(staffMembers.map(u => 
        u._id === editStaff.id ? updatedUser : u
      ));
      setShowEditStaffModal(false);
    } catch (err) {
      setError(err.message || "Failed to update staff member");
    }
  };

  // Open change role modal
  const openChangeRoleModal = (staff) => {
    setSelectedStaff(staff);
    setNewRole(staff.roleId._id);
    setShowChangeRoleModal(true);
  };

  // Change staff role
  const handleChangeRole = async () => {
    try {
      const updatedUser = await UserAPI.changeUserRole(selectedStaff._id, newRole);
      setStaffMembers(staffMembers.map(u => 
        u._id === selectedStaff._id ? updatedUser : u
      ));
      setShowChangeRoleModal(false);
    } catch (err) {
      setError(err.message || "Failed to change role");
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (staff) => {
    setStaffToDelete(staff);
    setShowDeleteModal(true);
  };

  // Delete staff member
  const handleDeleteStaff = async () => {
    try {
      await UserAPI.deleteUser(staffToDelete._id);
      setStaffMembers(staffMembers.filter(u => u._id !== staffToDelete._id));
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.message || "Failed to delete staff member");
      setShowDeleteModal(false);
    }
  };

  // Open reset password modal
  const openResetPasswordModal = (staff) => {
    setSelectedStaff(staff);
    setPasswordReset({ newPassword: "", confirmPassword: "" });
    setPasswordError("");
    setShowResetPasswordModal(true);
  };

  // Reset password
  const handleResetPassword = async () => {
    const { newPassword, confirmPassword } = passwordReset;

    if (!newPassword || !confirmPassword) {
      setPasswordError("Both fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    try {
      await UserAPI.resetPassword(selectedStaff._id, newPassword);
      setShowResetPasswordModal(false);
      setPasswordReset({ newPassword: "", confirmPassword: "" });
      setPasswordError("");
    } catch (err) {
      setPasswordError(err.message || "Failed to reset password");
    }
  };

  // Modal styles
  const modalBackdrop = "fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50";
  const modalContainer = "bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden";
  const modalHeader = "bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-5";
  const modalBody = "p-6";
  const modalFooter = "px-6 py-4 bg-gray-50 flex justify-end gap-3";

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Staff Members</h2>
          <p className="text-gray-600 mt-1">
            Manage your organization's staff accounts
          </p>
        </div>
        <button
          onClick={() => setShowAddStaffModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Staff Member
        </button>
      </div>

      <div className="mb-6">
        <div className="relative w-full">
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
            placeholder="Search by Name, Email, Role..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="bg-white overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStaffMembers.map((staff) => (
              <tr key={staff._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-800 font-medium shadow-sm">
                        {staff.name
                          .split(" ")
                          .map((name) => name[0])
                          .join("")}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {staff.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{staff.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 shadow-sm">
                    {staff.roleId?.roleName || "No Role"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openChangeRoleModal(staff)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors shadow-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Change Role
                    </button>
                    <button
                      onClick={() => openEditModal(staff)}
                      className="text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-md transition-colors shadow-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
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
                      onClick={() => openDeleteModal(staff)}
                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors shadow-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
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
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Add Staff Member
                </h3>
                <button
                  onClick={() => setShowAddStaffModal(false)}
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
              <p className="text-purple-100 mt-1 text-sm">
                Create a new staff account with appropriate permissions
              </p>
            </div>
            <div className={modalBody}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Enter full name"
                    value={newStaff.name}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="email@example.com"
                    value={newStaff.email}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Set a secure password"
                    value={newStaff.password}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, password: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    value={newStaff.roleId}
                    onChange={(e) =>
                      setNewStaff({ ...newStaff, roleId: e.target.value })
                    }
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.roleName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className={modalFooter}>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-lg transition-all shadow-md"
              >
                Add Staff Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditStaffModal && (
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
                  Edit Staff Member
                </h3>
                <button
                  onClick={() => setShowEditStaffModal(false)}
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
              <p className="text-purple-100 mt-1 text-sm">
                Update staff member information
              </p>
            </div>
            <div className={modalBody}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    value={editStaff.name}
                    onChange={(e) =>
                      setEditStaff({ ...editStaff, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    value={editStaff.email}
                    onChange={(e) =>
                      setEditStaff({ ...editStaff, email: e.target.value })
                    }
                  />
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowEditStaffModal(false);
                      openResetPasswordModal({
                        _id: editStaff.id,
                        name: editStaff.name,
                        email: editStaff.email,
                      });
                    }}
                    className="w-full text-indigo-700 bg-indigo-50 hover:bg-indigo-100 text-sm py-2 rounded-lg transition-colors flex items-center justify-center"
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
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
            <div className={modalFooter}>
              <button
                onClick={() => setShowEditStaffModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditStaff}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-lg transition-all shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {showChangeRoleModal && selectedStaff && (
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Change Role
                </h3>
                <button
                  onClick={() => setShowChangeRoleModal(false)}
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
              <p className="text-purple-100 mt-1 text-sm">
                Update role and permissions for{" "}
                <span className="font-medium">{selectedStaff.name}</span>
              </p>
            </div>
            <div className={modalBody}>
              <div className="mb-5">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-800 font-medium text-lg shadow-sm mr-3">
                    {selectedStaff.name
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {selectedStaff.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {selectedStaff.email}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select New Role
                  </label>
                  <select
                    className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.roleName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 bg-indigo-50 rounded-lg p-4 text-sm text-indigo-800">
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 mt-0.5 text-indigo-600"
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
                    <p>
                      Changing a user's role will modify their system access
                      permissions. Make sure you understand the security
                      implications before proceeding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className={modalFooter}>
              <button
                onClick={() => setShowChangeRoleModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRole}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-lg transition-all shadow-md"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && staffToDelete && (
        <div className={modalBackdrop}>
          <div className={modalContainer}>
            <div className="bg-gradient-to-r from-red-500 to-red-700 text-white p-5">
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
              <p className="text-red-100 mt-1 text-sm">
                This action cannot be undone
              </p>
            </div>
            <div className={modalBody}>
              <div className="mb-5">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete the staff account for{" "}
                  <span className="font-medium text-gray-900">
                    {staffToDelete.name}
                  </span>
                  ? This will permanently remove their account and access to the
                  system.
                </p>

                <div className="flex items-center p-4 border border-red-100 bg-red-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-3">
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="text-sm text-red-700">
                    Staff member details:
                    <ul className="mt-1 text-red-600">
                      <li>
                        <strong>Name:</strong> {staffToDelete.name}
                      </li>
                      <li>
                        <strong>Email:</strong> {staffToDelete.email}
                      </li>
                      <li>
                        <strong>Role:</strong> {staffToDelete.roleId?.roleName || "No Role"}
                      </li>
                    </ul>
                  </div>
                </div>
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
                onClick={handleDeleteStaff}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 rounded-lg transition-all shadow-md"
              >
                Delete Staff Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
{showResetPasswordModal && selectedStaff && (
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
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            Reset Password
          </h3>
          <button
            onClick={() => {
              setShowResetPasswordModal(false);
              setPasswordReset({ newPassword: '', confirmPassword: '' });
              setPasswordError('');
            }}
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
        <p className="text-blue-100 mt-1 text-sm">
          Reset password for{" "}
          <span className="font-medium">{selectedStaff.name}</span>
        </p>
      </div>
      <div className={modalBody}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter new password (min 6 characters)"
              value={passwordReset.newPassword}
              onChange={(e) =>
                setPasswordReset({
                  ...passwordReset,
                  newPassword: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Confirm new password"
              value={passwordReset.confirmPassword}
              onChange={(e) =>
                setPasswordReset({
                  ...passwordReset,
                  confirmPassword: e.target.value,
                })
              }
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>
        </div>
      </div>
      <div className={modalFooter}>
        <button
          onClick={() => {
            setShowResetPasswordModal(false);
            setPasswordReset({ newPassword: '', confirmPassword: '' });
            setPasswordError('');
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleResetPassword}
          disabled={!passwordReset.newPassword || !passwordReset.confirmPassword}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-md ${
            !passwordReset.newPassword || !passwordReset.confirmPassword
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-blue-700 hover:to-indigo-800'
          }`}
        >
          Reset Password
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default StaffMembers;