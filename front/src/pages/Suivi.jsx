import React, { useState, useEffect } from 'react';
import RappelSanteSection from '../components/RappelSanteSection';
import PromenadeSection from '../components/PromenadeSection';
import AlimentationSection from '../components/AlimentationSection';
import PoidsSection from '../components/PoidsSection';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import ModalPlaceholder from '../components/ModalPlaceholder';
import PetSelector from '../components/PetSelector';
import AddMealForm from '../components/AlimentationSection';
import AddManualWalkForm from '../components/PromenadeSection';
import AddReminderForm from '../components/AddReminderForm';
import SymptomSection from '../components/SymptomSection';

export default function Suivi() {
  const [pet, setPet] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [refreshAlim, setRefreshAlim] = useState(0);
  const [refreshWalk, setRefreshWalk] = useState(0);
  const [refreshRappel, setRefreshRappel] = useState(0);

  useEffect(() => {
    async function fetchPetList() {
      setLoading(true);
      try {
        const petsRes = await axios.get('/pets');
        setPets(petsRes.data);
        // Sélectionner le pet stocké si présent
        const storedId = localStorage.getItem('selectedPetId');
        const found = petsRes.data.find(p => String(p.id) === storedId);
        setPet(found || petsRes.data[0]);
      } catch {
        setPets([]);
        setPet(null);
      }
      setLoading(false);
    }
    fetchPetList();
  }, []);

  return (
    <div className="min-h-screen bg-couleur-fond p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-ranille text-3xl font-bold text-gray-900 sm:text-left">Suivi</h1>
        </div>
        <PetSelector
          pets={pets}
          selectedPet={pet}
          onSelectPet={setPet}
        />
      </div>
      <div>
        <RappelSanteSection
          petId={pet?.id}
          onShowAll={() => navigate(`/suivi/rappels?pet=${pet?.id}`)}
        />
        <PromenadeSection
          petId={pet?.id}
          onShowHistory={() => navigate(`/suivi/promenade?pet=${pet?.id}`)}
          onAddManual={() => setModal('balade')}
          onStartWalk={() => setModal('startWalk')}
          key={refreshWalk}
        />
        <AlimentationSection
          petId={pet?.id}
          onShowHistory={() => navigate(`/suivi/alimentation?pet=${pet?.id}`)}
          onAddMeal={() => setModal('repas')}
          onAddDrink={() => { }}
          onRemoveDrink={() => { }}
          key={refreshAlim}
        />
        <SymptomSection
          petId={pet?.id}
          onShowHistory={() => navigate(`/suivi/symptomes?pet=${pet?.id}`)}
        />
        {pet?.id && (
          <PoidsSection
            petId={pet.id}
            onShowHistory={() => navigate(`/suivi/poids?pet=${pet.id}`)}
          />
        )}
      </div>
      {/* Modals d'ajout réels */}
      {modal === 'repas' && (
        <AddMealForm
          petId={pet?.id}
          onSave={() => { setModal(null); setRefreshAlim(r => r + 1); }}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === 'balade' && (
        <AddManualWalkForm
          petId={pet?.id}
          onSave={() => { setModal(null); setRefreshWalk(r => r + 1); }}
          onCancel={() => setModal(null)}
        />
      )}
      <ModalPlaceholder open={modal === 'startWalk'} title="Démarrer une balade" text="Ici s'ouvrira le suivi de balade en temps réel." onClose={() => setModal(null)} />
      {loading && (
        <div className="fixed inset-0 bg-couleur-fond bg-opacity-70 flex items-center justify-center z-50">
          <svg className="animate-spin h-12 w-12 text-couleur-principale" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      )}
    </div>
  );
} 