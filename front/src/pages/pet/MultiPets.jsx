import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { Plus, Edit, Trash2, PawPrint, Dog, Cat, ChevronDown, ChevronUp, Info, Users, Lightbulb, Share2, Eye } from 'lucide-react';
import { CreatePetModal } from './CreatePet';
import EditPetModal from './EditPet';
import InviteUser from '../../components/InviteUser';
import PetMembers from '../../components/PetMembers';
import { useSelector } from "react-redux";

const TIPS = [
  "Chaque animal a sa personnalité : apprends à les observer et à respecter leurs différences.",
  "Prévois un espace dédié pour chaque animal, surtout s’ils ne s’entendent pas toujours.",
  "Garde un carnet de santé à jour pour chacun.",
  "Évite la jalousie : accorde du temps à chaque compagnon individuellement.",
  "Introduis les nouveaux venus progressivement, avec patience et douceur.",
];

const FAQ = [
  {
    q: "Comment ajouter un nouvel animal ?",
    a: "Clique sur le bouton 'Ajouter' ou le bouton flottant en bas à droite, puis remplis le formulaire avec les informations de ton animal.",
  },
  {
    q: "Puis-je gérer des animaux de différentes espèces ?",
    a: "Oui, tu peux ajouter chiens, chats ou autres animaux. Utilise le filtre pour n’afficher qu’une espèce si besoin.",
  },
  {
    q: "Comment changer l’animal sélectionné ?",
    a: "Clique sur la carte de l’animal souhaité. Il sera utilisé par défaut dans les autres sections de l’app.",
  },
  {
    q: "Comment supprimer un animal ?",
    a: "Clique sur l’icône poubelle sur la carte de l’animal. Attention, cette action est irréversible.",
  },
  {
    q: "Comment partager un animal avec d'autres utilisateurs ?",
    a: "Clique sur le bouton 'Partager' sous la carte de l'animal, saisis l'email de la personne à inviter. Tu peux voir la liste des membres avec 'Membres'. Seul le propriétaire (créateur de l'animal) peut retirer un membre, et il ne peut pas se retirer lui-même. Les membres invités ne peuvent pas gérer les autres membres.",
  },
];

function Accordion({ title, icon, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-emerald-100 shadow-sm mb-4">
      <button
        className="w-full flex items-center justify-between px-5 py-4 focus:outline-none"
        onClick={() => setOpen(o => !o)}
      >
        <span className="flex items-center gap-3 font-semibold text-lg text-gray-900">{icon}{title}</span>
        {open ? <ChevronUp className="h-5 w-5 text-emerald-500" /> : <ChevronDown className="h-5 w-5 text-emerald-500" />}
      </button>
      {open && (
        <div className="px-6 pb-5">{children}</div>
      )}
    </div>
  );
}

export default function MultiPets() {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [showMembersPetId, setShowMembersPetId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPetId, setEditPetId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [openedSection, setOpenedSection] = useState({});
  const auth = useSelector(state => state.auth);

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
    setEditPetId(pet.id);
    setShowEditModal(true);
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

  function getAgeString(birthdate) {
    if (!birthdate) return '';
    const birth = new Date(birthdate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years === 0 && months === 0 && days > 0) return `(${days} jour${days > 1 ? 's' : ''})`;
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

  const speciesList = Array.from(new Set(pets.map(p => p.species))).filter(Boolean);
  const filteredPets = filter === 'all' ? pets : pets.filter(p => p.species === filter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-semibold px-3 py-2 rounded-lg hover:bg-emerald-50 transition"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Retour
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-couleur-titre font-ranille flex items-center gap-2"><Users className="h-7 w-7 text-emerald-500" />Mes animaux</h1>
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow"
          >
            <Plus className="h-5 w-5" /> Ajouter
          </button>
        </div>

        {/* Filtres */}
        {speciesList.length > 1 && (
          <div className="flex gap-2 mb-6">
            <button
              className={`px-3 py-1 rounded-full border font-semibold text-sm transition ${filter === 'all' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
              onClick={() => setFilter('all')}
            >Tous</button>
            {speciesList.map(sp => (
              <button
                key={sp}
                className={`px-3 py-1 rounded-full border font-semibold text-sm transition ${filter === sp ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
                onClick={() => setFilter(sp)}
              >
                {sp === 'dog' && <Dog className="inline h-4 w-4 mr-1" />} {sp === 'cat' && <Cat className="inline h-4 w-4 mr-1" />} {sp.charAt(0).toUpperCase() + sp.slice(1)}
              </button>
            ))}
          </div>
        )}
        {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-4">{error}</div>}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-emerald-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
        ) : filteredPets.length === 0 ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredPets.map(pet => {
              const isSelected = String(selectedPetId) === String(pet.id);
              let imageSrc = null;
              if (pet.photo_url) {
                imageSrc = pet.photo_url.startsWith('/uploads')
                  ? `${window.location.origin}${pet.photo_url}`
                  : pet.photo_url;
              }
              return (
                <div
                  key={pet.id}
                  className={`relative group bg-white border rounded-2xl p-5 shadow-md transition cursor-pointer hover:shadow-lg ${isSelected ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-emerald-100'}`}
                  onClick={() => handleSelect(pet)}
                >
                  <div className="flex items-center gap-4">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={pet.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-emerald-200 shadow"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full flex items-center justify-center bg-emerald-50 border-2 border-emerald-200">
                        {pet.species === 'dog' && <Dog className="w-10 h-10 text-emerald-400" />}
                        {pet.species === 'cat' && <Cat className="w-10 h-10 text-emerald-400" />}
                        {pet.species === 'other' && <PawPrint className="w-10 h-10 text-emerald-400" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xl text-gray-900 flex items-center gap-2">{pet.name} <span className="text-gray-500 font-normal text-base">{getAgeString(pet.birthdate)}</span></div>
                      <div className="text-gray-500 text-sm">
                        {getSpeciesLabel(pet.species, pet.gender)}
                        {pet.gender && (
                          <span className="ml-2">{getGenderSymbol(pet.gender)}</span>
                        )}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {pet.breed && <span>{pet.breed}</span>}
                      </div>

                      {pet.birthdate && (
                        <div className="text-gray-400 text-xs">
                          {pet.gender === 'female' ? 'Née le' : 'Né le'} {new Date(pet.birthdate).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                    {/* Boutons modifier/supprimer toujours visibles */}
                    <div className="flex flex-col gap-2 ml-2 items-end">
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
                  </div>
                  {/* Boutons Partager / Membres côte à côte, même style */}
                  <div className="flex gap-3 mt-3 mb-1">
                    <button
                      className={`flex-1 flex items-center gap-1 justify-center border rounded-md px-2 py-1 text-sm font-medium transition
                        ${openedSection[pet.id] === 'share' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'}`}
                      style={{ minWidth: 0 }}
                      onClick={e => { e.stopPropagation(); setOpenedSection(s => ({ ...s, [pet.id]: s[pet.id] === 'share' ? null : 'share' })); }}
                    >
                      <Share2 className="h-4 w-4" /> Partager
                    </button>
                    <button
                      className={`flex-1 flex items-center gap-1 justify-center border rounded-md px-2 py-1 text-sm font-medium transition
                        ${openedSection[pet.id] === 'members' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'}`}
                      style={{ minWidth: 0 }}
                      onClick={e => { e.stopPropagation(); setOpenedSection(s => ({ ...s, [pet.id]: s[pet.id] === 'members' ? null : 'members' })); }}
                    >
                      <Eye className="h-4 w-4" /> Membres
                    </button>
                  </div>
                  {/* Animation d'apparition, un seul ouvert à la fois */}
                  <div className={`transition-all duration-300 ${openedSection[pet.id] === 'share' ? 'opacity-100 max-h-[400px] mt-2' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                    {openedSection[pet.id] === 'share' && (
                      <InviteUser petId={pet.id} onInvite={() => setOpenedSection(s => ({ ...s, [pet.id]: null }))} />
                    )}
                  </div>
                  <div className={`transition-all duration-300 ${openedSection[pet.id] === 'members' ? 'opacity-100 max-h-[400px] mt-2' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                    {openedSection[pet.id] === 'members' && (
                      <PetMembers petId={pet.id} currentUserId={auth.user?.id} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Conseils multi-animaux */}
        <div className="mt-10 mb-6">
          <Accordion title="Conseils pour gérer plusieurs animaux" icon={<Lightbulb className="h-6 w-6 text-emerald-400" />}>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {TIPS.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          </Accordion>
        </div>
        {/* FAQ multi-animaux */}
        <div className="mb-10">
          <Accordion title="FAQ Multi-animaux" icon={<PawPrint className="h-6 w-6 text-emerald-400" />}>
            <div className="space-y-3">
              {FAQ.map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-emerald-100 p-4 shadow-sm">
                  <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="text-emerald-600">Q.</span> {item.q}
                  </div>
                  <div className="text-gray-700 pl-6">{item.a}</div>
                </div>
              ))}
            </div>
          </Accordion>
        </div>
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
        <EditPetModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          petId={editPetId}
          onSuccess={() => { setShowEditModal(false); fetchPets(); }}
        />

      </div>
      <div className="mt-6 text-xs text-gray-500 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-emerald-400" />
        Astuce : tu peux partager un animal avec plusieurs personnes (famille, pet-sitter, etc.) et retirer l'accès à tout moment.
      </div>
    </div>
  );
} 