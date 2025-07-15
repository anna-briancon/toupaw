import React from 'react';

export default function ModalPlaceholder({ open, title, text, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="p-6 w-80 max-w-full">
        <div className="text-xl font-bold text-couleur-titre mb-3">{title}</div>
        <div className="mb-4 text-couleur-texte-info text-base">{text}</div>
        <button onClick={onClose} className="w-full bg-couleur-principale text-couleur-texte py-2 rounded-xl font-bold hover:bg-couleur-titre/80 transition">Fermer</button>
      </div>
    </div>
  );
} 