import React from 'react';

export default function LoadingSpinner({ className = '', overlay = false }) {
  const spinner = (
    <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 ${className}`}></div>
  );
  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }
  return spinner;
} 