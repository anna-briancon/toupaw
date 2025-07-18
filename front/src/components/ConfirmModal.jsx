import React from 'react';

export default function ConfirmModal({ open, title = 'Confirmation', message, onConfirm, onCancel, confirmText = 'Confirmer', cancelText = 'Annuler' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-base p-6 w-80 max-w-full animate-fade-in">
        <div className="text-base font-bold mb-2 text-center text-gray-900">{title}</div>
        <div className="mb-4 text-gray-500 text-sm text-center">{message}</div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-xl border border-gray-300 hover:bg-gray-200 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-2 rounded-xl shadow hover:from-emerald-600 hover:to-teal-600 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
} 