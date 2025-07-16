import React from "react";
import PetSelector from "./PetSelector";
import logo from "/assets/logo.png";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Header = ({ pets, selectedPet, onSelectPet }) => {
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  // Prend la première lettre du nom ou de l'email
  const initial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-2 bg-white shadow-md border-b border-emerald-100">
      {/* Logo + Sélecteur d'animal */}
      <div className="flex items-center gap-4 h-14">
        <img src={logo} alt="Logo" className="h-14 w-auto object-contain" />
        <div className="flex items-center h-full">
          <PetSelector pets={pets} selectedPet={selectedPet} onSelectPet={onSelectPet} />
        </div>
      </div>
      {/* Bulle utilisateur */}
      <div className="flex items-center h-14">
        <button
          className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 transition hover:scale-105 text-emerald-400"
          title="Paramètres du compte"
          onClick={() => navigate('/account-settings')}
        >
          <span>{initial}</span>
        </button>
      </div>
    </header>
  );
};

export default Header; 