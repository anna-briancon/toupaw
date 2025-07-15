import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Plus, ChevronRight, Stethoscope, Syringe, Pill, AlertCircle, Heart, Weight
} from 'lucide-react';
import AddReminderForm from './AddReminderForm';

const healthTypes = [
  { value: 'vaccination', label: 'Vaccination', icon: Syringe, color: 'bg-blue-100 text-blue-700' },
  { value: 'vet_visit', label: 'Visite véto', icon: Stethoscope, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'medication', label: 'Traitement', icon: Pill, color: 'bg-purple-100 text-purple-700' },
  { value: 'deworming', label: 'Vermifuge', icon: Heart, color: 'bg-orange-100 text-orange-700' },
  { value: 'soins', label: 'Soins', icon: Heart, color: 'bg-pink-100 text-pink-700' },
];

const RECURRENCE_OPTIONS = [
  { value: '', label: 'Aucune' },
  { value: '1y', label: 'Tous les ans' },
  { value: '6m', label: 'Tous les 6 mois' },
  { value: '3m', label: 'Tous les 3 mois' },
  { value: '1m', label: 'Tous les mois' },
];

export default function RappelSanteSection({ petId, onShowAll, refreshKey }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!petId) return;
    setLoading(true);
    axios.get(`/health-events/${petId}`)
      .then(res => {
        // Afficher tous les événements non complétés, même passés
        const actifs = res.data.filter(e => !e.completed);
        setEvents(actifs.sort((a, b) => new Date(a.date) - new Date(b.date)));
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [petId, showAdd]);

  const getEventIcon = (type) => {
    const eventType = healthTypes.find(t => t.value === type);
    return eventType ? eventType.icon : Stethoscope;
  };

  const getEventColor = (type) => {
    const eventType = healthTypes.find(t => t.value === type);
    return eventType ? eventType.color : "bg-gray-100 text-gray-700";
  };

  const getEventLabel = (type) => {
    const eventType = healthTypes.find(t => t.value === type);
    return eventType ? eventType.label : type;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let timeText = date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    if (diffDays === 0) {
      timeText = `Aujourd'hui • ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays === 1) {
      timeText = `Demain • ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays <= 7) {
      timeText = `Dans ${diffDays} jours • ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    }
    return timeText;
  };

  return (
    <div className="max-w-4xl mx-auto mb-4">
      <section className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-ranille">Rappels santé</h2>
          </div>
          <button
            onClick={onShowAll}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 font-semibold flex items-center gap-1 px-3 py-2 rounded transition"
          >
            Voir tout
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="border-dashed border-2 border-gray-300 rounded-xl flex flex-col items-center justify-center py-8 text-center bg-white/80">
              <Calendar className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">Aucun événement à venir</p>
              <p className="text-sm text-gray-500 mt-1">Créez votre premier rappel santé</p>
            </div>
          ) : (
            events.slice(0, 3).map((event) => {
              const IconComponent = getEventIcon(event.type);
              const isLate = new Date(event.date) < new Date();
              return (
                <div
                  key={event.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-emerald-500 bg-white/80 backdrop-blur-sm rounded-xl"
                  onClick={() => navigate(`/suivi/health-event/${event.id}`)}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{getEventLabel(event.type)}</span>
                          {event.recurrence && (
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded ml-2">Récurrent</span>
                          )}
                          {isLate && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 ml-2">
                              <Clock className="h-3 w-3" />
                              En retard
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(event.date)}
                        </div>
                        {event.note && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{event.note}</p>}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="mr-2 h-5 w-5" />
          Créer un rappel
        </button>
        {showAdd && (
          <AddReminderForm
            petId={petId}
            onSave={() => setShowAdd(false)}
            onCancel={() => setShowAdd(false)}
          />
        )}
      </section>
    </div>
  );
} 