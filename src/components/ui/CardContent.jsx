import React from 'react';

const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default CardContent;