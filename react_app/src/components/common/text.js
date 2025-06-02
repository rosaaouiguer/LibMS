import React from 'react';

export const TitleText = ({ children, className = '' }) => {
  return (
    <h1 className={`text-2xl font-bold text-gray-800 tracking-tight ${className}`}>
      {children}
    </h1>
  );
};

export const SubtitleText = ({ children, className = '' }) => {
  return (
    <h2 className={`text-base text-gray-600 font-normal ${className}`}>
      {children}
    </h2>
  );
};

export const NormalText = ({ children, className = '' }) => {
  return (
    <p className={`text-sm text-gray-600 ${className}`}>
      {children}
    </p>
  );
};

export const HeadingText = ({ children, level = 1, className = '' }) => {
  const sizes = {
    1: 'text-xl',
    2: 'text-lg',
    3: 'text-base',
    4: 'text-sm',
    5: 'text-xs',
    6: 'text-xs'
  };
  
  const size = sizes[level] || sizes[1];
  
  const Tag = `h${level}`;
  
  return (
    <Tag className={`font-bold text-gray-800 ${size} ${className}`}>
      {children}
    </Tag>
  );
};

export const StatusText = ({ children, statusType = 'info', className = '' }) => {
  const styles = {
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    error: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-600'
  };
  
  const style = styles[statusType] || styles.info;
  
  return (
    <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${style} ${className}`}>
      {children}
    </span>
  );
};

export const TitleLayout = ({ title, subtitle, className = '' }) => {
  return (
    <div className={`mb-6 ${className}`}>
      <TitleText>{title}</TitleText>
      {subtitle && <SubtitleText>{subtitle}</SubtitleText>}
    </div>
  );
};