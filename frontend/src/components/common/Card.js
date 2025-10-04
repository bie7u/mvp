import React from 'react';

const Card = ({ children, title, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors ${className}`}>
      {title && <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;
