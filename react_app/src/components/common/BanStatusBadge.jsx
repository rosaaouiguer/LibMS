import React from "react";

export const BanStatusBadge = ({ banned, bannedUntil }) => {
  if (!banned) return null;

  const formattedDate = new Date(bannedUntil).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center mb-6">
      <div className="flex-shrink-0 bg-red-100 rounded-full p-2 mr-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-red-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div>
        <h4 className="font-semibold text-red-800">Account Banned</h4>
        <p className="text-sm">Banned until {formattedDate}</p>
      </div>
    </div>
  );
};
