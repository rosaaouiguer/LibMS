// src/components/common/ContextMenu.jsx

import React, { useEffect, useRef, useState } from "react";

const ContextMenu = ({ x, y, items, onClose }) => {
  const menuRef = useRef(null);
  const [submenuItems, setSubmenuItems] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleItemClick = (item, e) => {
    e.stopPropagation();
    if (item.disabled) return;

    if (item.subItems) {
      const rect = e.target.getBoundingClientRect();
      setSubmenuItems(item.subItems);
      setSubmenuPosition({ x: rect.right + 5, y: rect.top });
    } else {
      item.onClick && item.onClick();
      onClose();
    }
  };

  const handleSubItemClick = (subItem) => {
    if (subItem.disabled) return;

    subItem.onClick && subItem.onClick();
    onClose();
  };

  return (
    <>
      <div
        ref={menuRef}
        style={{ top: y, left: x }}
        className="absolute bg-white shadow-lg rounded-md border border-gray-200 w-48 z-50"
      >
        {items.map((item, index) => (
          <div
            key={index}
            onClick={(e) => handleItemClick(item, e)}
            className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center ${
              item.disabled
                ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                : item.danger
                ? "text-red-500 hover:bg-gray-100"
                : "text-gray-800 hover:bg-gray-100"
            }`}
            title={item.tooltip || ""}
          >
            <div className="flex items-center">
              {item.icon && (
                <span className="mr-2">
                  {/* You can use Lucide icons here if needed */}
                </span>
              )}
              {item.label}
            </div>
            {item.subItems && <span className="ml-2">▶</span>}
          </div>
        ))}
      </div>

      {submenuItems && (
        <div
          style={{ top: submenuPosition.y, left: submenuPosition.x }}
          className="absolute bg-white shadow-lg rounded-md border border-gray-200 w-40 z-50"
        >
          {submenuItems.map((subItem, idx) => (
            <div
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                handleSubItemClick(subItem);
              }}
              className={`px-4 py-2 text-sm cursor-pointer ${
                subItem.disabled
                  ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              title={subItem.tooltip || ""}
            >
              {subItem.label}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ContextMenu;
