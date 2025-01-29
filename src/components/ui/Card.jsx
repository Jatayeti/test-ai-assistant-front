import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`rounded-2xl bg-gray-800 text-white shadow-lg p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;