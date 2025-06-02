import React from 'react';

export const MainButton = ({ text, onClick, className = '', disabled = false, type = "button" }) => {
  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium 
      transition-all duration-200 shadow-sm hover:shadow min-h-[38px]
      disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${className}`}
    >
      {text}
    </button>
  );
};

export const IconButton = ({ icon, onClick, size = 38, className = '', ariaLabel = '' }) => {
  return (
    <button 
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex items-center justify-center rounded-md cursor-pointer 
      transition-all duration-200 bg-white border border-gray-200 hover:bg-gray-50 
      shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${className}`}
      style={{ width: size, height: size }}
    >
      {icon}
    </button>
  );
};

export const IconTextButton = ({ text, icon, onClick, className = '' }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 
      text-gray-700 py-2 px-4 rounded-md font-medium cursor-pointer transition-all duration-200 
      min-h-[38px] shadow-sm hover:shadow focus:outline-none focus:ring-2 
      focus:ring-blue-500 focus:ring-opacity-50 ${className}`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {text}
    </button>
  );
};

export const TextButton = ({ text, onClick, className = '' }) => {
  return (
    <button 
      onClick={onClick}
      className={`text-blue-600 hover:text-blue-800 font-medium cursor-pointer transition-colors 
      underline-offset-2 hover:underline focus:outline-none focus:ring-2 
      focus:ring-blue-500 focus:ring-opacity-50 py-1 ${className}`}
    >
      {text}
    </button>
  );
};

export const GhostButton = ({ text, onClick, className = '' }) => {
  return (
    <button 
      onClick={onClick}
      className={`text-gray-700 border border-gray-300 bg-transparent hover:bg-gray-50 
      py-2 px-4 rounded-md font-medium cursor-pointer transition-all duration-200 
      min-h-[38px] focus:outline-none focus:ring-2 focus:ring-gray-300 ${className}`}
    >
      {text}
    </button>
  );
};

export const ToggleButton = ({ textOn = "On", textOff = "Off", isOn = false, onChange, className = '' }) => {
  return (
    <button 
      onClick={() => onChange(!isOn)}
      className={`py-2 px-4 rounded-md font-medium cursor-pointer transition-all duration-200 
      min-h-[38px] focus:outline-none focus:ring-2 focus:ring-opacity-50 ${isOn 
        ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500' 
        : 'bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-400'} ${className}`}
    >
      {isOn ? textOn : textOff}
    </button>
  );
};

export const DropdownButton = ({ text, onClick, className = '' }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between gap-2 bg-white border border-gray-200 
      hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md font-medium cursor-pointer 
      transition-all duration-200 min-h-[38px] shadow-sm hover:shadow focus:outline-none 
      focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${className}`}
    >
      {text}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 ml-1" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};