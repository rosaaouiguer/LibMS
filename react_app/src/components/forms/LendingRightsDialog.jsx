import React, { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  Clock,
  Info,
  CalendarRange,
  AlertCircle,
  Trash2,
} from "lucide-react";
import {
  getLendingRightsByBookId,
  createBookLendingRights,
  updateBookLendingRights,
  deleteBookLendingRights,
} from "../../services/bookLendingRightsApi";

const LendingRightsDialog = ({ book, onClose }) => {
  // CSS styles matching student category modal
  const modalBody = "p-6";
  const modalFooter =
    "px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const inputStyle =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const switchContainer = "flex items-center cursor-pointer";
  const switchLabel = "ml-3 text-sm font-medium text-gray-700";

  // State for existing lending rights
  const [existingRights, setExistingRights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOverrideWarning, setShowOverrideWarning] = useState(false);
  const [error, setError] = useState(null);

  // Default lending rights
  const [formData, setFormData] = useState({
    loanDuration: 14,
    allowExtensions: true,
    maxExtensions: 2,
    extensionDuration: 7,
  });

  // Load existing lending rights if any
  useEffect(() => {
    const fetchLendingRights = async () => {
      setLoading(true);
      try {
        const rights = await getLendingRightsByBookId(book._id);
        if (rights) {
          setExistingRights(rights);
          setFormData({
            loanDuration: rights.loanDuration,
            allowExtensions: rights.loanExtensionAllowed,
            maxExtensions: rights.extensionLimit,
            extensionDuration: rights.extensionDuration,
          });
        } else {
          // No existing rights, show override warning
          setShowOverrideWarning(true);
        }
      } catch (err) {
        setError("Failed to load lending rights data");
        console.error("Error loading lending rights:", err);
      } finally {
        setLoading(false);
      }
    };

    if (book && book._id) {
      fetchLendingRights();
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value, 10) || 0
          : value,
    }));
  };

  const handleDelete = async () => {
    if (!existingRights || !existingRights._id) return;

    try {
      await deleteBookLendingRights(existingRights._id);

      onClose();
    } catch (err) {
      setError("Failed to delete lending rights");
      console.error("Error deleting lending rights:", err);
    }
  };
  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    const lendingRightsData = {
      book_id: book._id,
      book_title: book.title,
      loanDuration: formData.loanDuration,
      allowExtensions: formData.allowExtensions,
      maxExtensions: formData.allowExtensions ? formData.maxExtensions : 0,
      extensionDuration: formData.allowExtensions
        ? formData.extensionDuration
        : 0,
    };

    try {
      let result;
      if (existingRights) {
        const payload = {
          loanDuration: lendingRightsData.loanDuration,
          loanExtensionAllowed: lendingRightsData.allowExtensions,
          extensionLimit: lendingRightsData.maxExtensions,
          extensionDuration: lendingRightsData.extensionDuration,
        };
        result = await updateBookLendingRights(existingRights._id, payload);
      } else {
        result = await createBookLendingRights(lendingRightsData);
      }

      onClose();
    } catch (err) {
      setError("Failed to save lending rights");
      console.error("Error saving lending rights:", err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center">
          <p>Loading lending rights data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 bg-indigo-50 border-b">
          <h3 className="text-lg font-medium text-indigo-800 flex items-center">
            <CalendarRange size={18} className="mr-2" />
            {existingRights ? "Edit Lending Rights" : "Create Lending Rights"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            <div className="flex">
              <AlertCircle size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {showOverrideWarning && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-700">
            <div className="flex">
              <Info size={20} className="mr-2 flex-shrink-0" />
              <span>
                Setting book lending rights will override any student category
                lending rights for this book.
              </span>
            </div>
          </div>
        )}

        <div className={modalBody}>
          <div className="space-y-5">
            {/* Loan duration */}
            <div>
              <label htmlFor="loanDuration" className={labelStyle}>
                Loan Duration
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="loanDuration"
                  name="loanDuration"
                  min="1"
                  max="90"
                  value={formData.loanDuration}
                  onChange={handleChange}
                  className={inputStyle}
                  required
                />
                <span className="ml-2 text-gray-500">days</span>
              </div>
            </div>

            {/* Allow extensions */}
            <div className="pt-2">
              <label className={switchContainer}>
                <input
                  type="checkbox"
                  className="sr-only peer"
                  name="allowExtensions"
                  checked={formData.allowExtensions}
                  onChange={handleChange}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className={switchLabel}>Allow Loan Extensions</span>
              </label>
            </div>

            {/* Extension settings (only show if extensions are allowed) */}
            {formData.allowExtensions && (
              <>
                <div>
                  <label htmlFor="maxExtensions" className={labelStyle}>
                    Days For Reservation Pickup
                  </label>
                  <input
                    type="number"
                    id="maxExtensions"
                    name="maxExtensions"
                    min="1"
                    max="10"
                    value={formData.maxExtensions}
                    onChange={handleChange}
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="extensionDuration" className={labelStyle}>
                    Extension Duration
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id="extensionDuration"
                      name="extensionDuration"
                      min="1"
                      max="30"
                      value={formData.extensionDuration}
                      onChange={handleChange}
                      className={inputStyle}
                      required
                    />
                    <span className="ml-2 text-gray-500">
                      days per extension
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Lending rights summary */}
            <div className="pt-2 bg-indigo-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-indigo-800 mb-2">
                Summary
              </h4>
              <div className="text-sm text-indigo-700">
                <p>
                  Students are allowed to borrow this book for{" "}
                  <strong>{formData.loanDuration} days</strong>.
                </p>
                {formData.allowExtensions ? (
                  <p className="mt-1">
                    They can extend for
                    {formData.extensionDuration} days multiple times.
                  </p>
                ) : (
                  <p className="mt-1">No extensions allowed.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={modalFooter}>
          {existingRights && (
            <button
              type="button"
              onClick={handleDelete}
              className="mr-auto px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center"
            >
              <Trash2 size={16} className="mr-1" />
              Remove Override
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 rounded-lg transition-all shadow-md"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default LendingRightsDialog;
