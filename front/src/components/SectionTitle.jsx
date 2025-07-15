import React from 'react';

export default function SectionTitle({ children, className = '', ...props }) {
  return (
    <h1
      className={`font-ranille text-3xl font-bold text-gray-900 sm:text-left mb-6 sm:mb-8 ${className}`}
      {...props}
    >
      {children}
    </h1>
  );
} 