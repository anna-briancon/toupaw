import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import {
  Stethoscope, ChevronLeft, ChartColumnDecreasing, Syringe, Pill, AlertCircle, Heart, Weight, Plus, Edit, Trash2, ChevronRight, Calendar, Clock, ArrowLeft
} from 'lucide-react';
import AddReminderForm from './ReminderAdd';
import ConfirmModal from '../../components/ConfirmModal';
import ReminderEdit from './ReminderEdit';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function usePetId() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  return params.get('pet');
}

const HEALTH_TYPES = [
  { value: 'vaccination', label: 'Vaccination', icon: Syringe, color: 'bg-blue-100 text-blue-700', emoji: '' },
  { value: 'vet_visit', label: 'Visite véto', icon: Stethoscope, color: 'bg-emerald-100 text-emerald-700', emoji: '' },
  { value: 'medication', label: 'Traitement', icon: Pill, color: 'bg-purple-100 text-purple-700', emoji: '' },
  { value: 'deworming', label: 'Vermifuge', icon: Heart, color: 'bg-orange-100 text-orange-700', emoji: '' },
  { value: 'soins', label: 'Soins', icon: Heart, color: 'bg-pink-100 text-pink-700', emoji: '' },
];
const HEALTH_LABELS = {
  vaccination: 'Vaccination',
  vet_visit: 'Visite véto',
  medication: 'Traitement',
  deworming: 'Vermifuge',
  soins: 'Soins',
};

export default function RappelsList() {
  const navigate = useNavigate();
  const petId = usePetId();
  const [healthEvents, setHealthEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editEventId, setEditEventId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [healthTypeFilter, setHealthTypeFilter] = useState('all');
  const [completedFilter, setCompletedFilter] = useState('active');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const reload = () => {
    if (!petId) return;
    setLoading(true);
    axios.get(`/health-events/${petId}`)
      .then(res => setHealthEvents(res.data))
      .catch(() => setHealthEvents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, [petId]);

  useEffect(() => {
    setHealthTypeFilter('all');
  }, [completedFilter]);

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };
  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    await axios.delete(`/health-events/${confirmDeleteId}`);
    setConfirmDeleteId(null);
    reload();
  };

  const activeTypes = Array.from(new Set(healthEvents.filter(e => !e.completed).map(e => e.type)));
  const completedTypes = Array.from(new Set(healthEvents.filter(e => !!e.completed).map(e => e.type)));
  const currentTypes = completedFilter === 'active' ? activeTypes : completedTypes;
  const orderedTypes = HEALTH_TYPES.filter(t => currentTypes.includes(t.value));

  let items = healthEvents;
  if (completedFilter === 'active') {
    items = items.filter(e => !e.completed);
  } else if (completedFilter === 'completed') {
    items = items.filter(e => !!e.completed);
  }
  if (healthTypeFilter !== 'all') {
    items = items.filter(e => e.type === healthTypeFilter);
  }
  items = items.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Stats
  const activeEvents = healthEvents.filter(e => !e.completed);
  const completedEvents = healthEvents.filter(e => !!e.completed);

  // Calcul des événements en retard
  const lateEvents = items.filter(e => new Date(e.date) < new Date());

  const getEventIcon = (type) => {
    const eventType = HEALTH_TYPES.find(t => t.value === type);
    return eventType ? eventType.icon : Stethoscope;
  };
  const getEventColor = (type) => {
    const eventType = HEALTH_TYPES.find(t => t.value === type);
    return eventType ? eventType.color : 'bg-gray-100 text-gray-700';
  };
  const getEventEmoji = (type) => {
    const eventType = HEALTH_TYPES.find(t => t.value === type);
    return eventType ? eventType.emoji : '🩺';
  };
  const getEventLabel = (type) => {
    return HEALTH_LABELS[type] || type;
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let timeText = date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    if (diffDays === 0) {
      timeText = `Aujourd'hui • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      timeText = `Demain • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays > 0 && diffDays <= 7) {
      timeText = `Dans ${diffDays} jours • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 0 && diffDays >= -7) {
      timeText = `Il y a ${Math.abs(diffDays)} jours • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return timeText;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 p-3 sm:p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header harmonisé WalkList */}
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 mb-6 sm:mb-10 bg-gradient-to-r from-emerald-400/80 to-teal-400/80 rounded-xl sm:rounded-2xl shadow-lg px-3 sm:px-6 py-4 sm:py-8 border border-emerald-200 overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none select-none">
            <Stethoscope className="h-20 w-20 sm:h-32 sm:w-32 text-white" />
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mb-2 sm:mb-4 flex items-center gap-2 text-white hover:text-emerald-100 font-semibold px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-emerald-500/30 transition z-10 text-sm sm:text-base"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            Retour
          </button>
          <div className="flex items-center gap-2 sm:gap-3 z-10">
            <div className="p-2 sm:p-3 bg-white/30 rounded-lg sm:rounded-xl shadow">
              <Stethoscope className="h-6 w-6 sm:h-10 sm:w-10 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-ranille drop-shadow leading-tight">Événements santé</h1>
              <p className="text-white/80 text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium">Gardez un œil sur la santé de vos animaux</p>
            </div>
          </div>
        </div>
        {/* Bloc stats harmonisé WalkList */}
        <div className="bg-white/80 border border-emerald-200 rounded-xl shadow p-3 sm:p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <ChartColumnDecreasing className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-700">Stats santé</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-gradient-to-br from-purple-200/80 to-violet-100 border-0 rounded-lg sm:rounded-2xl shadow p-2 sm:p-4 text-center flex flex-col items-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-purple-700 mb-1 sm:mb-2">
                <Clock className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-[10px] sm:text-xs font-semibold">Actifs</span>
              </div>
              <div className="text-base sm:text-2xl font-extrabold text-gray-900">{activeEvents.length}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-200/80 to-cyan-100 border-0 rounded-lg sm:rounded-2xl shadow p-2 sm:p-4 text-center flex flex-col items-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-blue-700 mb-1 sm:mb-2">
                <Stethoscope className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-[10px] sm:text-xs font-semibold">Total</span>
              </div>
              <div className="text-base sm:text-2xl font-extrabold text-gray-900">{healthEvents.length}</div>
            </div>
            <div className="bg-gradient-to-br from-green-200/80 to-emerald-100 border-0 rounded-lg sm:rounded-2xl shadow p-2 sm:p-4 text-center flex flex-col items-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-green-700 mb-1 sm:mb-2">
                <Calendar className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-[10px] sm:text-xs font-semibold">Terminés</span>
              </div>
              <div className="text-base sm:text-2xl font-extrabold text-gray-900">{completedEvents.length}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-200/80 to-amber-100 border-0 rounded-lg sm:rounded-2xl shadow p-2 sm:p-4 text-center flex flex-col items-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-orange-700 mb-1 sm:mb-2">
                <AlertCircle className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-[10px] sm:text-xs font-semibold">En retard</span>
              </div>
              <div className="text-base sm:text-2xl font-extrabold text-gray-900">{lateEvents.length}</div>
            </div>
          </div>
        </div>
        {/* Tabs et filtres améliorés */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="flex w-full sm:w-auto rounded-lg sm:rounded-xl overflow-hidden shadow border border-emerald-200">
            <button onClick={() => setCompletedFilter('active')} className={`flex-1 px-3 sm:px-5 py-1.5 sm:py-2 font-semibold text-xs sm:text-sm transition ${completedFilter === 'active' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-white text-emerald-700 hover:bg-emerald-50'}`}>Actifs</button>
            <button onClick={() => setCompletedFilter('completed')} className={`flex-1 px-3 sm:px-5 py-1.5 sm:py-2 font-semibold text-xs sm:text-sm transition ${completedFilter === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-white text-emerald-700 hover:bg-emerald-50'}`}>Terminés</button>
          </div>
          {currentTypes.length > 1 && (
            <div className="flex gap-1 sm:gap-2 flex-wrap w-full sm:w-auto justify-center sm:justify-start mt-2">
              <button
                onClick={() => setHealthTypeFilter('all')}
                className={`px-2.5 sm:px-4 py-1 rounded-full flex items-center justify-center border text-xs sm:text-sm font-semibold transition shadow ${healthTypeFilter === 'all' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500' : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'}`}
              >
                Tous
              </button>
              {orderedTypes.map(t => {
                const IconComponent = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => setHealthTypeFilter(t.value)}
                    className={`px-2.5 sm:px-4 py-1 rounded-full flex items-center justify-center border text-xs sm:text-sm font-semibold transition shadow ${healthTypeFilter === t.value ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500' : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'}`}
                  >
                    <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {/* Liste des événements modernisée */}
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl sm:rounded-2xl shadow-xl p-2 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <span className="font-semibold text-base sm:text-xl text-emerald-700">{completedFilter === 'active' ? 'Événements actifs' : 'Événements terminés'}</span>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow flex items-center gap-2 text-sm sm:text-base transition-transform hover:scale-105"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
              Ajouter
            </button>
          </div>
          {loading && <LoadingSpinner overlay />}
          {items.length === 0 ? (
            <div className="text-center py-10 sm:py-16 flex flex-col items-center">
              <span className="text-4xl sm:text-6xl mb-2 sm:mb-4">🩺</span>
              <p className="text-gray-700 font-bold text-base sm:text-xl mb-1">Aucun événement</p>
              <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">Tous vos rappels sont à jour !</p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-1 sm:mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-semibold shadow hover:scale-105 transition-transform text-xs sm:text-base"
              >
                Ajouter un événement
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {items.map(event => {
                const IconComponent = getEventIcon(event.type);
                const isLate = new Date(event.date) < new Date();
                return (
                  <div
                    key={event.id}
                    className={`group border border-emerald-100 ${completedFilter === 'active' ? 'border-l-4 border-l-emerald-400' : 'border-l-4 border-l-gray-300 opacity-75'} bg-white/90 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5 sm:hover:-translate-y-1 duration-200 px-2 sm:px-4 py-3 sm:py-4`}
                    onClick={() => setEditEventId(event.id)}
                  >
                    <div className="flex items-center gap-3 sm:gap-5">
                      <div className={`flex-shrink-0 p-2 sm:p-3 rounded-lg ${getEventColor(event.type)} flex items-center justify-center transition-transform group-hover:scale-105 ${completedFilter === 'completed' ? 'opacity-75' : ''}`}>
                        <IconComponent className="h-6 w-6 sm:h-7 sm:w-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`font-semibold text-base sm:text-base text-gray-900 truncate`}>{event.title || getEventLabel(event.type)}</span>
                          {completedFilter === 'completed' && <span className="bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded font-medium border border-green-100">Terminé</span>}
                          {isLate && !event.completed && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-600 border border-orange-100">
                              <Clock className="h-3 w-3" />
                              En retard
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(event.date)}
                        </div>
                        {event.note && <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{event.note}</p>}
                      </div>
                      <div className="flex flex-col gap-2 items-end ml-2">
                        <button
                          onClick={e => { e.stopPropagation(); setEditEventId(event.id); }}
                          className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded p-1 text-xs flex items-center transition"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(event.id); }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 text-xs flex items-center transition"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Modale d'édition/ajout */}
        {showAdd && (
          <AddReminderForm
            petId={petId}
            onSave={() => { setShowAdd(false); reload(); }}
            onCancel={() => setShowAdd(false)}
          />
        )}
        <ReminderEdit
          open={!!editEventId && editEventId !== 'new'}
          id={editEventId}
          onSave={() => { setEditEventId(null); reload(); }}
          onCancel={() => setEditEventId(null)}
        />
        <ConfirmModal
          open={!!confirmDeleteId}
          title="Supprimer ce rappel ?"
          message="Cette action est irréversible. Voulez-vous vraiment supprimer ce rappel ?"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      </div>
    </div>
  );
} 