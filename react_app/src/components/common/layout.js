import React from 'react';
import { TitleLayout } from './text';

export const MainLayout = ({ children, className = '' }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <main className={`flex-1 overflow-auto p-6 ${className}`}>
        {children}
      </main>
    </div>
  );
};

export const TwoColumnLayout = ({
  sidebarWidget,
  titleWidget,
  searchWidget,
  actionWidget = null,
  contentWidget,
  className = ''
}) => {
  return (
    <div className={`flex h-full ${className}`}>
      <div className="w-1/5 min-w-[200px] border-r border-gray-200">
        {sidebarWidget}
      </div>
      
      <div className="flex-1 flex flex-col p-6 space-y-6 overflow-auto">
        {titleWidget}
        {searchWidget}
        {actionWidget && actionWidget}
        <div className="flex-1 overflow-auto">
          {contentWidget}
        </div>
      </div>
    </div>
  );
};

export const PageContainer = ({
  title,
  subtitle = '',
  children,
  className = ''
}) => {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      <TitleLayout title={title} subtitle={subtitle} />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export const ContentCard = ({
  title = null,
  children,
  className = '',
  padding = true
}) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>
    </div>
  );
};