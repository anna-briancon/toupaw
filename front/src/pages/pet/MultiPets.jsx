import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { Plus, Edit, Trash2, PawPrint } from 'lucide-react';
import { CreatePetModal } from './CreatePet';

export default function MultiPets() {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(() => localStorage.getItem('selectedPetId'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/pets');
      setPets(res.data);
    } catch (e) {
      setError("Erreur lors du chargement des animaux");
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleSelect = (pet) => {
    setSelectedPetId(pet.id);
    localStorage.setItem('selectedPetId', pet.id);
  };

  const handleAdd = () => {
    setShowCreateModal(true);
  };

  const handleEdit = (pet) => {
    navigate(`/edit-pet/${pet.id}`); // À implémenter : page d'édition
  };

  const handleDelete = async (pet) => {
    setShowConfirmDelete(pet.id);
  };

  const confirmDelete = async (petId) => {
    setDeleting(true);
    try {
      await axios.delete(`/pets/${petId}`);
      if (selectedPetId === String(petId)) {
        localStorage.removeItem('selectedPetId');
        setSelectedPetId(null);
      }
      setShowConfirmDelete(null);
      fetchPets();
    } catch (e) {
      setError("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  // Fonction utilitaire pour calculer l'âge en années et mois
  function getAgeString(birthdate) {
    if (!birthdate) return '';
    const birth = new Date(birthdate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) {
      months--;
      // nombre de jours dans le mois précédent
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    // Moins d'un mois => jours
    if (years === 0 && months === 0 && days > 0) return `(${days} jour${days > 1 ? 's' : ''})`;
    // Moins d'un an => mois
    if (years === 0) return `(${months} mois)`;
    if (months === 0) return `(${years} an${years > 1 ? 's' : ''})`;
    if (months >= 6) return `(${years} an${years > 1 ? 's' : ''} et demi)`;
    return `(${years} an${years > 1 ? 's' : ''}, ${months} mois)`;
  }

  function getGenderSymbol(gender) {
    if (gender === 'male') return '♂';
    if (gender === 'female') return '♀';
    if (gender === 'other') return '⚥';
    return '';
  }

  function getSpeciesLabel(species, gender) {
    if (species === 'dog') return gender === 'female' ? 'Chienne' : 'Chien';
    if (species === 'cat') return gender === 'female' ? 'Chatte' : 'Chat';
    return 'Autre';
  }

  return (
    <div className="min-h-screen bg-couleur-fond p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-semibold px-3 py-2 rounded-lg hover:bg-emerald-50 transition"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Retour
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-couleur-titre font-ranille">Mes animaux</h1>
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow"
          >
            <Plus className="h-5 w-5" /> Ajouter
          </button>
        </div>
        {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-4">{error}</div>}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-emerald-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-12">
            <PawPrint className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg">Aucun animal enregistré</p>
            <button
              onClick={handleAdd}
              className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow"
            >
              <Plus className="h-5 w-5" /> Ajouter un animal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pets.map(pet => {
              const isSelected = String(selectedPetId) === String(pet.id);
              const onlyOne = pets.length === 1;
              return (
                <div
                  key={pet.id}
                  className={`flex items-center gap-4 bg-white border rounded-xl p-4 shadow-sm transition cursor-pointer ${!onlyOne && isSelected ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-emerald-100'}`}
                  onClick={() => handleSelect(pet)}
                >
                  <img
                    src={pet.photo_url || 'https://placekitten.com/80/80'}
                    alt={pet.name}
                    className="w-16 h-16 rounded-full object-cover border border-emerald-200"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-900">{pet.name} <span className="text-gray-500 font-normal text-sm">{getAgeString(pet.birthdate)}</span></div>
                    <div className="text-gray-500 text-sm">
                      {getSpeciesLabel(pet.species, pet.gender)}
                      {pet.gender && (
                        <span className="ml-2">{getGenderSymbol(pet.gender)}</span>
                      )}
                      {pet.breed && ` - ${pet.breed}`}
                    </div>
                    {pet.birthdate && (
                      <div className="text-gray-400 text-xs">
                        {pet.gender === 'female' ? 'Née le' : 'Né le'} {new Date(pet.birthdate).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                  <button
                    className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600"
                    onClick={e => { e.stopPropagation(); handleEdit(pet); }}
                    title="Éditer"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    onClick={e => { e.stopPropagation(); handleDelete(pet); }}
                    title="Supprimer"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {/* Confirmation suppression */}
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full">
              <h2 className="text-lg font-bold mb-4">Supprimer cet animal ?</h2>
              <p className="mb-6 text-gray-600">Cette action est irréversible.</p>
              <div className="flex gap-4 justify-end">
                <button
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-semibold"
                  onClick={() => setShowConfirmDelete(null)}
                  disabled={deleting}
                >Annuler</button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
                  onClick={() => confirmDelete(showConfirmDelete)}
                  disabled={deleting}
                >{deleting ? 'Suppression...' : 'Supprimer'}</button>
              </div>
            </div>
          </div>
        )}
        <CreatePetModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); fetchPets(); }}
        />
      </div>
    </div>
  );
} 