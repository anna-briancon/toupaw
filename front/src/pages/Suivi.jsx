import React, { useState, useEffect } from 'react';
import ReminderSection from './reminder/ReminderSection';
import PromenadeSection from './walk/WalkSection';
import MealsSection from './meal/MealSection';
import WeightSection from './weight/WeightSection';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import ModalPlaceholder from '../components/ModalPlaceholder';
import PetSelector from '../components/PetSelector';
import AddMealForm from './meal/MealSection';
import AddManualWalkForm from './walk/WalkSection';
import ReminderAdd from './reminder/ReminderAdd';
import SymptomSection from './symptom/SymptomSection';
import SectionTitle from '../components/SectionTitle';
import Header from "../components/Header";
import LoadingSpinner from '../components/ui/LoadingSpinner';

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
    <div className="min-h-screen bg-couleur-fond p-6 pb-24 pt-24">
       <Header pets={pets} selectedPet={pet} onSelectPet={p => {
        setPet(p);
        localStorage.setItem('selectedPetId', p.id);
      }} />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <SectionTitle>Suivi</SectionTitle>
        </div>
        {/* <PetSelector
          pets={pets}
          selectedPet={pet}
          onSelectPet={setPet}
        /> */}
      </div>
      <div>
        <ReminderSection
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
        <MealsSection
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
          <WeightSection
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
      {loading && <LoadingSpinner overlay />}
    </div>
  );
} 