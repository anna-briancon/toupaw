import React from "react";
import PetSelector from "./PetSelector";

// Remplace ce chemin par le chemin réel de ton logo si besoin
import logo from "/assets/logo.png";

const Header = ({ pets, selectedPet, onSelectPet }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-2 bg-white shadow-md border-b border-emerald-100">
      {/* Logo + Sélecteur d'animal */}
      <div className="flex items-center gap-4 h-14">
        <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
        <div className="flex items-center h-full">
          <PetSelector pets={pets} selectedPet={selectedPet} onSelectPet={onSelectPet} />
        </div>
      </div>
      {/* Bulle utilisateur */}
      <div className="flex items-center h-14">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold">
          {/* Initiales ou icône utilisateur */}
          <span>U</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 