import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreatePetModal } from '../pages/pet/CreatePet';
import { Dog, Cat, PawPrint } from 'lucide-react';

export default function PetSelector({ pets, selectedPet, onSelectPet }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fermer le menu si on clique en dehors du menu OU du titre
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Empêcher le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div ref={ref}>
      {/* Titre cliquable sans encadrement */}
      <div
        className="flex items-center gap-3 cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        {selectedPet && (
          selectedPet.photo_url ? (
            <img
              src={selectedPet.photo_url.startsWith('/uploads')
                ? `${window.location.origin}${selectedPet.photo_url}`
                : selectedPet.photo_url}
              alt={selectedPet.name}
              className="w-10 h-10 rounded-full object-cover border border-emerald-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-50 border border-emerald-200">
              {selectedPet.species === 'dog' && <Dog className="w-6 h-6 text-emerald-400" />}
              {selectedPet.species === 'cat' && <Cat className="w-6 h-6 text-emerald-400" />}
              {selectedPet.species === 'other' && <PawPrint className="w-6 h-6 text-emerald-400" />}
            </div>
          )
        )}
        <h1 className="text-xl sm:text-xl font-bold text-couleur-titre font-ranille">
          {selectedPet ? selectedPet.name : 'Sélectionner un animal'}
        </h1>
        <svg className={`h-7 w-7 transition-transform ${open ? 'rotate-180' : ''} ml-2`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {/* Overlay et menu en bas de page */}
      {open && (
        <>
          {/* Fond assombri */}
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setOpen(false)}></div>
          {/* Menu en bas */}
          <div className="fixed left-0 right-0 bottom-16 z-50 max-h-80 overflow-auto bg-white border-t border-couleur-principale rounded-t-2xl shadow-2xl animate-fade-in mx-auto w-full max-w-xl">
            <div className="py-2">
              {pets && pets.length > 0 ? pets.map(pet => (
                <button
                  key={pet.id}
                  className={`w-full text-left px-6 py-4 hover:bg-couleur-principale/10 text-couleur-texte font-semibold text-base ${selectedPet?.id === pet.id ? 'bg-couleur-principale/20' : ''}`}
                  onClick={() => {
                    onSelectPet(pet);
                    localStorage.setItem('selectedPetId', pet.id);
                    setOpen(false);
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    {pet.photo_url ? (
                      <img
                        src={pet.photo_url.startsWith('/uploads')
                          ? `${window.location.origin}${pet.photo_url}`
                          : pet.photo_url}
                        alt={pet.name}
                        className="w-8 h-8 rounded-full object-cover border border-emerald-200"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-50 border border-emerald-200">
                        {pet.species === 'dog' && <Dog className="w-5 h-5 text-emerald-400" />}
                        {pet.species === 'cat' && <Cat className="w-5 h-5 text-emerald-400" />}
                        {pet.species === 'other' && <PawPrint className="w-5 h-5 text-emerald-400" />}
                      </span>
                    )}
                    {pet.name}
                  </span>
                </button>
              )) : (
                <div className="px-6 py-4 text-couleur-texte">Aucun animal</div>
              )}
              <div className="border-t my-2" />
              <button
                className="w-full text-left px-6 py-4 hover:bg-couleur-principale/10 text-couleur-principale font-bold flex items-center gap-2 text-base"
                onClick={() => {
                  setOpen(false);
                  setShowCreateModal(true);
                }}
              >
                <span>+ Ajouter un animal</span>
              </button>
              <button
                className="w-full text-left px-6 py-4 hover:bg-couleur-principale/10 text-emerald-700 font-bold flex items-center gap-2 text-base border-t"
                onClick={() => {
                  setOpen(false);
                  navigate('/multi-pets');
                }}
              >
                <span>Gérer mes animaux</span>
              </button>
            </div>
          </div>
        </>
      )}
      {/* Modal d'ajout d'animal */}
      <CreatePetModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          if (typeof onSelectPet === 'function') {
          }
        }}
      />
    </div>
  );
} 