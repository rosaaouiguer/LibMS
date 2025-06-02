import React, { useState } from "react";
import ContextMenu from "./ContextMenu";

export const StudentCard = ({
  student,
  onClick,
  onEdit,
  onNotify,
  onBanStudent,
  onUnbanStudent,
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  const handleCardRightClick = (e) => {
    e.preventDefault(); // Prevent default context menu

    // Show our custom context menu at the click position
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onClick(student);
  };

  const handleCloseContextMenu = () => {
    setShowContextMenu(false);
  };

  // Context menu items for student actions
  const contextMenuItems = [
    {
      label: "View Details",
      onClick: () => onClick(student),
    },
    {
      label: "Edit Student",
      onClick: () => onEdit && onEdit(student),
    },
    {
      label: "Send Notification",
      onClick: () => onNotify && onNotify(student),
    },
    {
      label: student.banned ? "Unban Student" : "Ban Student",
      danger: !student.banned,
      onClick: () =>
        student.banned
          ? onUnbanStudent && onUnbanStudent(student)
          : onBanStudent && onBanStudent(student),
    },
  ];

  return (
    <>
      <div
        className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow w-full"
        onContextMenu={handleCardRightClick}
        onDoubleClick={handleDoubleClick}
      >
        <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center mb-4 p-1 overflow-hidden relative">
          {student.banned && (
            <div className="absolute inset-0 rounded-full bg-red-500 bg-opacity-30 flex items-center justify-center z-10">
              <span className="text-white font-bold text-xs px-2 py-1 bg-red-600 rounded-full">
                BANNED
              </span>
            </div>
          )}
          <img
            src={student.image_path || "/assets/defaultItemPic.png"}
            alt={student.name}
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {student.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 text-center">
          {student.email}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the card click event
            onClick(student);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md text-sm font-medium transition-colors duration-200"
        >
          View Details
        </button>
      </div>

      {showContextMenu && (
        <ContextMenu
          x={contextMenuPosition.x}
          y={contextMenuPosition.y}
          items={contextMenuItems}
          onClose={handleCloseContextMenu}
        />
      )}
    </>
  );
};

export default StudentCard;
