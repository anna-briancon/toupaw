import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import {
  Stethoscope, Syringe, Pill, AlertCircle, Heart, Weight, Plus, Edit, Trash2, ChevronRight, Calendar, Clock, ArrowLeft
} from 'lucide-react';
import AddReminderForm from './ReminderAdd';
import ConfirmModal from '../../components/ConfirmModal';

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
  const [editEvent, setEditEvent] = useState(null);
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

  // Déterminer les types présents dans la vue courante
  const activeTypes = Array.from(new Set(healthEvents.filter(e => !e.completed).map(e => e.type)));
  const completedTypes = Array.from(new Set(healthEvents.filter(e => !!e.completed).map(e => e.type)));
  const currentTypes = completedFilter === 'active' ? activeTypes : completedTypes;
  const orderedTypes = HEALTH_TYPES.filter(t => currentTypes.includes(t.value));

  // Filtrage par type
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
    <div className="min-h-screen bg-gradient-to-br p-6 sm:p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-semibold px-3 py-2 rounded-lg hover:bg-emerald-50 transition"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Retour
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 whitespace-pre-line font-ranille">Événements santé</h1>
          </div>
        </div>
        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200 rounded-lg shadow p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Événements actifs</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{activeEvents.length}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg shadow p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Stethoscope className="h-4 w-4" />
              <span className="text-xs font-medium">Total événements</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{healthEvents.length}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium">Terminés</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{completedEvents.length}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg shadow p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">En retard</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{lateEvents.length}</div>
          </div>
        </div>
        {/* Tabs et filtres */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-2 mb-4">
          <div className="flex w-full sm:w-auto">
            <button onClick={() => setCompletedFilter('active')} className={`flex-1 px-4 py-2 font-semibold text-sm border-b-2 transition ${completedFilter === 'active' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400'}`}>Actifs</button>
            <button onClick={() => setCompletedFilter('completed')} className={`flex-1 px-4 py-2 font-semibold text-sm border-b-2 transition ${completedFilter === 'completed' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400'}`}>Terminés</button>
          </div>
          {currentTypes.length > 1 && (
            <div className="flex gap-2 flex-wrap w-full sm:w-auto justify-center sm:justify-start">
              <button
                onClick={() => setHealthTypeFilter('all')}
                className={`px-3 py-1 rounded-full flex items-center justify-center border text-xs sm:text-sm font-semibold transition ${healthTypeFilter === 'all' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500' : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'}`}
              >
                Tous
              </button>
              {orderedTypes.map(t => {
                const IconComponent = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => setHealthTypeFilter(t.value)}
                    className={`px-3 py-1 rounded-full flex items-center justify-center border text-xs sm:text-sm font-semibold transition ${healthTypeFilter === t.value ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500' : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'}`}
                  >
                    <IconComponent className="h-4 w-4 mr-1" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {/* Liste des événements */}
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow p-3 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-base sm:text-lg">{completedFilter === 'active' ? 'Événements actifs' : 'Événements terminés'}</span>
            <button
              onClick={() => setEditEvent({})}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-3 py-2 rounded-xl shadow flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium text-lg">Aucun événement</p>
              <p className="text-sm text-gray-500 mt-2">Tous vos rappels sont à jour !</p>
            </div>
          ) : (
            items.map(event => {
              const IconComponent = getEventIcon(event.type);
              const isLate = new Date(event.date) < new Date();
              return (
                <div
                  key={event.id}
                  className={`border-l-4 ${completedFilter === 'active' ? 'border-l-emerald-500' : 'border-l-gray-300 opacity-75'} bg-white rounded-xl shadow hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => navigate(`/suivi/health-event/${event.id}`)}
                >
                  <div className="p-3 sm:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`p-2 sm:p-3 rounded-lg ${getEventColor(event.type)} ${completedFilter === 'completed' ? 'opacity-75' : ''}`}>
                        <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${completedFilter === 'completed' ? 'text-gray-700' : 'text-gray-900'}`}>{event.title || getEventLabel(event.type)}</span>
                          <span className={`text-lg ${completedFilter === 'completed' ? 'opacity-75' : ''}`}>{getEventEmoji(event.type)}</span>
                          {completedFilter === 'completed' && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded ml-2">Terminé</span>}
                          {isLate && !event.completed && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 ml-2">
                              <Clock className="h-3 w-3" />
                              En retard
                            </span>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 text-sm mt-1 ${completedFilter === 'completed' ? 'text-gray-500' : 'text-gray-600'}`}>
                          <Clock className="h-3 w-3" />
                          {formatDate(event.date)}
                        </div>
                        {event.note && <p className={`text-sm mt-2 ${completedFilter === 'completed' ? 'text-gray-400' : 'text-gray-500'}`}>{event.note}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/suivi/health-event/${event.id}`); }}
                        className={`text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded px-2 py-1 text-xs sm:text-sm flex items-center gap-1`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(event.id); }}
                        className={`text-red-600 hover:text-red-700 hover:bg-red-50 rounded px-2 py-1 text-xs sm:text-sm flex items-center gap-1`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <ChevronRight className={`h-5 w-5 ${completedFilter === 'completed' ? 'text-gray-400' : 'text-emerald-500'}`} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Modale d'édition/ajout */}
        {editEvent && (
          <AddReminderForm
            petId={petId}
            onSave={() => {
              setEditEvent(null);
              reload();
            }}
            onCancel={() => setEditEvent(null)}
          />
        )}
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