import React, { useState } from "react";
import { createNotification } from "../../services/notificationApi"; // Import the API function

export const NotificationDialog = ({ student, onClose, onSend }) => {
  const [category, setCategory] = useState("Announcements");
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleMessageChange = (e) => {
    const text = e.target.value;
    setMessage(text);
    setCharCount(text.length);
  };

  const handleSend = async () => {
    if (!message.trim()) {
      // Highlight the message field if empty
      const messageElement = document.getElementById("messageText");
      if (messageElement) {
        messageElement.classList.add("error");
        setTimeout(() => {
          messageElement.classList.remove("error");
        }, 2000);
      }
      return;
    }
  
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Ensure we have a valid student ID
      if (!student || (!student._id && !student.id)) {
        throw new Error("Invalid student data");
      }
      
      const notificationData = {
        student: student._id || student.id, // Use whichever field exists
        category,
        message,
      };
      
      const result = await createNotification(notificationData);
      onSend(result);
      onClose();
    } catch (err) {
      console.error("Failed to send notification:", err);
      setError(err.message || "Failed to send notification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Color indicators for categories
  const categoryColors = {
    Announcements: "#4361ee",
    "Due Date Reminders": "#ff9800",
    "Overdue Alerts": "#f1416c",
    Other: "#20d489",
  };

  // Make sure we have the student name even if the student object structure changes
const studentName = student ? (student.name || student.fullName || "this student") : "this student";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 rounded-t-lg">
          {/* Header section with icon and title */}
          <div className="flex items-start mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl mr-4">
              ✉️
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Send Notification
              </h3>
              <p className="text-gray-600 text-sm">
                Send a custom notification to {studentName}
              </p>
            </div>
          </div>

          {/* Gradient divider */}
          <div className="h-0.5 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 mb-6"></div>

          {/* Content area with rounded background */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
            {/* Category section */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">📋</span>
                <label className="font-semibold text-gray-800">
                  Notification Category
                </label>
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="Announcements">Announcements</option>
                <option value="Due Date Reminders">Due Date Reminders</option>
                <option value="Overdue Alerts">Overdue Alerts</option>
                <option value="Other">Other</option>
              </select>

              {/* Color indicators */}
              <div className="flex mt-2 space-x-4">
                {Object.entries(categoryColors).map(([name, color]) => (
                  <div key={name} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-1"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-xs font-medium" style={{ color }}>
                      {name.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Message section */}
            <div>
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">✉️</span>
                <label className="font-semibold text-gray-800">
                  Notification Message
                </label>
              </div>

              <textarea
                id="messageText"
                value={message}
                onChange={handleMessageChange}
                rows={5}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter your notification message here..."
              ></textarea>

              {/* Character counter */}
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-500">
                  {charCount} characters
                </span>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Button section */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="py-3 px-6 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 bg-gray-100"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSubmitting}
            className="py-3 px-10 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 relative"
          >
            {isSubmitting ? (
              <>
                <span className="opacity-0">Send</span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              </>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>

      {/* Add styles for error state */}
      <style jsx>{`
        #messageText.error {
          border: 2px solid #f1416c;
          animation: shake 0.5s;
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20%,
          60% {
            transform: translateX(-5px);
          }
          40%,
          80% {
            transform: translateX(5px);
          }
        }
      `}</style>
    </div>
  );
};