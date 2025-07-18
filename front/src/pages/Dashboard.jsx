import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon, Clock, Plus, ChevronRight, ChevronLeft, Stethoscope, Syringe, Pill, AlertCircle, Heart, Weight,
  Utensils, Footprints, Droplet, Bell, GlassWater, Sprout
} from 'lucide-react';
import PetSelector from '../components/PetSelector';
import SectionTitle from '../components/SectionTitle';
import React from "react";
import Header from "../components/Header";
import ReminderEdit from './reminder/ReminderEdit';

// Header avec nom et photo du pet principal
function DashboardHeader({ pet, user }) {
  return (
    <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-emerald-100 mb-4">
      <img
        src={pet?.photo_url || 'https://placekitten.com/100/100'}
        alt={pet?.name || 'Pet'}
        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-200"
      />
      <div>
        <div className="text-xl font-semibold text-gray-900">Bonjour {user?.name || "👋"}</div>
        {/* <div className="text-gray-500 text-sm">{pet?.species ? `Ton ${pet.species}` : ""}</div> */}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, unit, time, onClick }) {
  return (
    <div
      className={`flex flex-col items-center bg-white rounded-lg shadow p-3 min-w-[80px] border border-emerald-200 transition cursor-pointer ${onClick ? 'hover:bg-emerald-50 active:bg-emerald-100' : ''}`}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      style={onClick ? { outline: 'none' } : {}}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="font-medium text-sm mb-1">{label}</span>
      {value !== undefined && (
        <span className="text-emerald-600 font-bold text-base">{value}{unit}</span>
      )}
      {time && <span className="text-xs text-gray-400 mt-1">{time}</span>}
    </div>
  );
}

// Dictionnaire de traduction des types et labels d'événements
const EVENT_LABELS_FR = {
  walk: 'Promenade',
  meal: 'Repas',
  health: 'Santé',
  rappel: 'Rappel',
  sante: 'Santé',
  repas: 'Repas',
  balade: 'Promenade',
  quotidien: 'Quotidien',
  pee: 'Pipi',
  poo: 'Caca',
  drink: 'A bu',
  sleep: 'A dormi',
  weight: 'Poids',
  Deworming: 'Vermifuge',
  Vaccination: 'Vaccination',
  Consultation: 'Consultation',
  Surgery: 'Chirurgie',
  Grooming: 'Toilettage',
  Other: 'Autre',
  // Ajoute les types santé utilisés dans healthTypes
  vaccination: 'Vaccination',
  vet_visit: 'Visite véto',
  medication: 'Traitement',
  symptom: 'Symptôme',
  deworming: 'Vermifuge',
  soins: 'Soins',
};
// Pour l'icône, on veut que tous les types santé aient l'icône santé
const HEALTH_EVENT_TYPES = ['Deworming', 'Vaccination', 'Consultation', 'Surgery', 'Grooming', 'Other', 'weight'];
const EVENT_ICONS = {
  walk: '🐾',
  meal: '🍽️',
  health: '🩺',
  rappel: '🔔',
  sante: '🩺',
  repas: '🍽️',
  balade: '🐾',
  quotidien: '📅',
  pee: '💦',
  poo: '💩',
  drink: '💧',
  sleep: '😴',
  weight: '⚖️',
  Deworming: '��',
  Vaccination: '🩺',
  Consultation: '��',
  Surgery: '🩺',
  Grooming: '🩺',
  Other: '🩺',
};
function getEventLabelFr(typeOrLabel) {
  if (!typeOrLabel) return '';
  // Si le label est déjà en français ou inconnu, on retourne tel quel
  return EVENT_LABELS_FR[typeOrLabel] || typeOrLabel;
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

// Liste des types santé comme dans RappelSanteSection
const healthTypes = [
  { value: 'vaccination', label: 'Vaccination', icon: Syringe, color: 'bg-blue-100 text-blue-700' },
  { value: 'vet_visit', label: 'Visite véto', icon: Stethoscope, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'medication', label: 'Traitement', icon: Pill, color: 'bg-purple-100 text-purple-700' },
  { value: 'symptom', label: 'Symptôme', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
  { value: 'deworming', label: 'Vermifuge', icon: Heart, color: 'bg-orange-100 text-orange-700' },
  { value: 'soins', label: 'Soins', icon: Heart, color: 'bg-pink-100 text-pink-700' },
  { value: 'weight', label: 'Poids', icon: Weight, color: 'bg-gray-100 text-gray-700' },
];
const getEventIcon = (type) => {
  const eventType = healthTypes.find(t => t.value === type);
  return eventType ? eventType.icon : Stethoscope;
};
const getEventColor = (type) => {
  const eventType = healthTypes.find(t => t.value === type);
  return eventType ? eventType.color : 'bg-gray-100 text-gray-700';
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

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Ajout du composant EventCard pour harmoniser l'affichage avec RappelsList
function EventCard({ event, onClick }) {
  // Logique d'icône, couleur, emoji, label (repris de RappelsList)
  const HEALTH_TYPES = [
    { value: 'vaccination', label: 'Vaccination', icon: Syringe, color: 'bg-blue-100 text-blue-700', emoji: '💉' },
    { value: 'vet_visit', label: 'Visite véto', icon: Stethoscope, color: 'bg-emerald-100 text-emerald-700', emoji: '🏥' },
    { value: 'medication', label: 'Traitement', icon: Pill, color: 'bg-purple-100 text-purple-700', emoji: '💊' },
    { value: 'symptom', label: 'Symptôme', icon: AlertCircle, color: 'bg-red-100 text-red-700', emoji: '🤒' },
    { value: 'deworming', label: 'Vermifuge', icon: Heart, color: 'bg-orange-100 text-orange-700', emoji: '🪱' },
    { value: 'soins', label: 'Soins', icon: Heart, color: 'bg-pink-100 text-pink-700', emoji: '🩹' },
    { value: 'weight', label: 'Poids', icon: Weight, color: 'bg-gray-100 text-gray-700', emoji: '⚖️' },
  ];
  const HEALTH_LABELS = {
    vaccination: 'Vaccination', vet_visit: 'Visite véto', medication: 'Traitement', symptom: 'Symptôme', deworming: 'Vermifuge', soins: 'Soins', weight: 'Poids',
  };
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
    return HEALTH_LABELS[type] || getEventLabelFr(type);
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let timeText = date.toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
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
  const IconComponent = getEventIcon(event.type);
  const isLate = new Date(event.date) < new Date();
  // Label FR : si event.label existe, on tente la traduction, sinon on traduit le type
  const labelFr = getEventLabelFr(event.label) || getEventLabelFr(event.type);
  return (
    <div
      className={
        `border-l-4 border-l-emerald-500 bg-white rounded-xl shadow hover:shadow-md transition-shadow cursor-pointer`
      }
      onClick={onClick}
      tabIndex={0}
      role="button"
      style={{ outline: 'none' }}
    >
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">{labelFr}</span>
              {isLate && !event.completed && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 ml-2">
                  <Clock className="h-3 w-3" />
                  En retard
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs mt-1 text-gray-600">
              <Clock className="h-3 w-3" />
              {formatDate(event.date)}
            </div>
            {event.note && <p className="text-xs mt-2 text-gray-500">{event.note}</p>}
            {event.quantity && (
              <div className="text-gray-700 text-xs">{event.quantity} {event.unit}</div>
            )}
            {event.distance && <div className="text-gray-700 text-xs">{(event.distance / 1000).toFixed(2)} km</div>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ChevronRight className="h-5 w-5 text-emerald-500" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const user = useSelector(state => state.auth.user);
  const [pet, setPet] = useState(null);
  const [pets, setPets] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [futureEvents, setFutureEvents] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  // Ajout du calendrier dans le Dashboard
  const [calendarEvents, setCalendarEvents] = useState({});
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'week' | 'day'
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [selectedSummaryDate, setSelectedSummaryDate] = useState(new Date());

  const [editEvent, setEditEvent] = useState(null); // <-- Ajout état modale

  const navigate = useNavigate();

  // Charger la liste des animaux et les données du pet sélectionné
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

  useEffect(() => {
    async function fetchData() {
      if (!pet) return;
      setLoading(true);
      try {
        // Rappels santé à venir (7 prochains jours)
        const remindersRes = await axios.get(`/reminders/${pet.id}`);
        const now = new Date();
        const remindersFuture = remindersRes.data.filter(r => new Date(r.due_date) > now && !r.completed);
        setReminders(remindersFuture.slice(0, 7));
        // Événements à venir (santé, repas, balades, daily events)
        const [healthRes, mealsRes, walksRes, dailyRes, symptomsRes] = await Promise.all([
          axios.get(`/health-events/${pet.id}`),
          axios.get(`/meals/${pet.id}`),
          axios.get(`/walks/${pet.id}`),
          axios.get(`/daily-events/${pet.id}`),
          axios.get(`/symptoms/${pet.id}`),
        ]);
        // Filtrer pour ne garder que les événements futurs
        const healthFuture = healthRes.data.filter(e => new Date(e.date) > now).map(e => ({
          id: e.id, // <-- ajoute l'id ici !
          type: e.type, // Utilise le vrai type d'événement santé
          label: e.type, // OK si type est déjà une clé fr, sinon voir ci-dessous
          date: e.date,
          note: e.note,
        }));
        const mealsFuture = mealsRes.data.filter(m => new Date(m.datetime) > now).map(m => ({
          type: 'repas',
          label: m.food_type,
          date: m.datetime,
          note: m.note,
          quantity: m.quantity,
          unit: m.unit,
        }));
        const walksFuture = walksRes.data.filter(w => new Date(w.start_time) > now).map(w => ({
          type: 'balade',
          date: w.start_time,
          distance: w.distance_m,
        }));
        const dailyFuture = dailyRes.data.filter(d => new Date(d.datetime) > now).map(d => ({
          type: 'quotidien',
          label: d.type,
          date: d.datetime,
          note: d.note,
        }));
        // Rappels déjà formatés
        const remindersFormatted = remindersFuture.map(r => ({
          type: 'rappel',
          label: r.title,
          date: r.due_date,
          note: r.description,
          id: r.id, // <-- ajoute l'id si ce n'est pas déjà fait
        }));
        // Fusionner et trier par date
        const allFuture = [...remindersFormatted, ...healthFuture, ...mealsFuture, ...walksFuture, ...dailyFuture]
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setFutureEvents(allFuture);
        // Résumé du jour : stocker tous les events pour filtrer par jour dans le rendu
        setSummary({
          meals: mealsRes.data,
          walks: walksRes.data,
          daily: dailyRes.data,
          health: healthRes.data,
          symptoms: symptomsRes.data,
        });
      } catch {}
      setLoading(false);
    }
    fetchData();
  }, [pet]);

  useEffect(() => {
    async function fetchCalendarEvents() {
      if (!pet) return;
      try {
        const [walksRes, mealsRes, healthRes, symptomsRes] = await Promise.all([
          axios.get(`/walks/${pet.id}`),
          axios.get(`/meals/${pet.id}`),
          axios.get(`/health-events/${pet.id}`),
          axios.get(`/symptoms/${pet.id}`),
        ]);
        const evts = {};
        function localKey(date) {
          const d = new Date(date);
          return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        }
        walksRes.data.forEach(w => {
          const key = localKey(w.start_time);
          if (!evts[key]) evts[key] = [];
          evts[key].push({ type: 'walk', ...w });
        });
        mealsRes.data.forEach(m => {
          const key = localKey(m.datetime);
          if (!evts[key]) evts[key] = [];
          evts[key].push({ type: 'meal', ...m });
        });
        healthRes.data.forEach(h => {
          const key = localKey(h.date);
          if (!evts[key]) evts[key] = [];
          evts[key].push({ type: 'health', ...h });
        });
        symptomsRes.data.forEach(s => {
          const key = localKey(s.date);
          if (!evts[key]) evts[key] = [];
          evts[key].push({ type: 'symptom', ...s });
        });
        setCalendarEvents(evts);
      } catch {
        setCalendarEvents({});
      }
    }
    fetchCalendarEvents();
  }, [pet, calendarMonth, calendarYear]);

  const calendarDays = getMonthDays(calendarYear, calendarMonth);
  const calendarFirstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();

  // Helpers pour semaine/jour
  function getWeekDays(date) {
    // Retourne les 7 jours de la semaine du lundi au dimanche pour la date donnée
    const d = new Date(date);
    const day = d.getDay() === 0 ? 7 : d.getDay(); // 1=lundi, 7=dimanche
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day - 1));
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      return day;
    });
  }
  function getDayHours() {
    return Array.from({ length: 24 }, (_, i) => i);
  }

  // Mapping pour les icônes lucide-react dans le calendrier
  const CALENDAR_LUCIDE_ICONS = {
    walk: <Footprints className="w-5 h-5 text-orange-500" />,
    meal: <Utensils className="w-5 h-5 text-orange-500" />,
    health: <Stethoscope className="w-5 h-5 text-orange-500" />,
    rappel: <Bell className="w-5 h-5 text-orange-500" />,
    sante: <Stethoscope className="w-5 h-5 text-orange-500" />,
    repas: <Utensils className="w-5 h-5 text-orange-500" />,
    balade: <Footprints className="w-5 h-5 text-orange-500" />,
    quotidien: <CalendarIcon className="w-5 h-5 text-orange-500" />,
    pee: <Droplet className="w-5 h-5 text-orange-500" />,
    poo: <Sprout className="w-5 h-5 text-orange-500" />,
    drink: <GlassWater className="w-5 h-5 text-orange-500" />,
    sleep: <Clock className="w-5 h-5 text-orange-500" />,
    weight: <Weight className="w-5 h-5 text-orange-500" />,
    Deworming: <Stethoscope className="w-5 h-5 text-orange-500" />,
    Vaccination: <Syringe className="w-5 h-5 text-orange-500" />,
    Consultation: <Stethoscope className="w-5 h-5 text-orange-500" />,
    Surgery: <Stethoscope className="w-5 h-5 text-orange-500" />,
    Grooming: <Stethoscope className="w-5 h-5 text-orange-500" />,
    Other: <Stethoscope className="w-5 h-5 text-orange-500" />,
    symptom: <AlertCircle className="w-5 h-5 text-orange-500" />,
  };

  return (
    <div className="min-h-screen bg-couleur-fond p-6 pb-24 pt-24">
      <Header pets={pets} selectedPet={pet} onSelectPet={p => {
        setPet(p);
        localStorage.setItem('selectedPetId', p.id);
      }} />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <SectionTitle>Tableau de bord</SectionTitle>
        </div>

        {/* Sélecteur de pet */}
        {/* {pets.length > 0 && (
          <div className=" flex justify-start sm:justify-start">
            <PetSelector
              pets={pets}
              selectedPet={pet}
              onSelectPet={p => {
                setPet(p);
                localStorage.setItem('selectedPetId', p.id);
              }}
            />
          </div>
        )} */}

        {/* {pet && <DashboardHeader pet={pet} user={user} />} */}

        {/* À venir */}
        <div className="mb-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow">
          <div className="p-4 sm:p-4">
            <h2 className="font-semibold text-base mb-2 text-gray-900">À venir</h2>
            <div className="space-y-2">
              {(() => {
                // Séparer événements en retard et à venir
                const now = new Date();
                const lateEvents = futureEvents.filter(evt => new Date(evt.date) < now && !evt.completed);
                const upcomingEvents = futureEvents.filter(evt => new Date(evt.date) >= now);
                let displayEvents = [];
                let isLate = false;
                if (lateEvents.length > 0) {
                  displayEvents = lateEvents.slice(0, 3);
                  isLate = true;
                } else {
                  displayEvents = upcomingEvents.slice(0, 3);
                }
                if (futureEvents.length === 0) {
                  return <span className="text-gray-400">Aucun événement à venir</span>;
                }
                return (
                  <>
                    {displayEvents.map((evt, idx) => {
                      // Détermine la route d'édition selon le type
                      return (
                        <EventCard key={idx} event={evt} onClick={() => setEditEvent(evt)} />
                      );
                    })}
                    {(isLate ? lateEvents.length : upcomingEvents.length) > 3 && (
                      <div className="flex justify-center">
                        <button
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-3 sm:px-2 py-1.5 sm:py-1 rounded-lg sm:rounded-xl shadow flex items-center gap-2 text-sm sm:text-base transition-transform hover:scale-105"
                          onClick={() => navigate(`/suivi/rappels${pet ? `?pet=${pet.id}` : ''}`)}
                        >
                          Voir plus
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Résumé du jour */}
        <div className="mb-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-semibold text-base text-gray-900">Résumé du jour</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedSummaryDate(d => {
                    const prev = new Date(d);
                    prev.setDate(prev.getDate() - 1);
                    return prev;
                  })}
                  className="text-emerald-600 text-xs px-1 py-0.5 rounded hover:bg-emerald-100"
                  style={{ minWidth: 28 }}
                  aria-label="Jour précédent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <input
                  type="date"
                  value={selectedSummaryDate.toISOString().slice(0, 10)}
                  onChange={e => setSelectedSummaryDate(new Date(e.target.value))}
                  className="border border-emerald-200 rounded px-1 py-0.5 text-xs w-[110px] focus:outline-emerald-400"
                  style={{ height: 28 }}
                  aria-label="Choisir la date du résumé"
                />
                <button
                  onClick={() => setSelectedSummaryDate(d => {
                    const next = new Date(d);
                    next.setDate(next.getDate() + 1);
                    return next;
                  })}
                  className="text-emerald-600 text-xs px-1 py-0.5 rounded hover:bg-emerald-100"
                  style={{ minWidth: 28 }}
                  aria-label="Jour suivant"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto">
              {(() => {
                const today = selectedSummaryDate;
                const mealsToday = summary.meals?.filter(m => {
                  const d = new Date(m.datetime);
                  return d.toDateString() === today.toDateString();
                }) || [];
                const lastMeal = mealsToday[0];
                return (
                  <SummaryCard
                    icon={<Utensils className="w-6 h-6 text-orange-500" />}
                    label="Repas"
                    value={lastMeal?.quantity}
                    unit={lastMeal?.unit}
                    time={
                      mealsToday.length === 0
                        ? "Aucun"
                        : new Date(lastMeal.datetime).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                    }
                    onClick={pet ? () => navigate(`/suivi/alimentation?pet=${pet.id}`) : undefined}
                  />
                );
              })()}
              {(() => {
                const today = selectedSummaryDate;
                const walksToday = summary.walks?.filter(w => {
                  const d = new Date(w.start_time);
                  return isSameDay(d, today);
                }) || [];
                // Additionner la distance totale
                const totalDistance = walksToday.reduce((sum, w) => sum + (w.distance_m || 0), 0);
                // Additionner la durée totale (en secondes)
                const totalDurationSec = walksToday.reduce((sum, w) => {
                  const start = new Date(w.start_time);
                  const end = w.end_time ? new Date(w.end_time) : start;
                  return sum + Math.max(0, (end - start) / 1000);
                }, 0);
                // Format durée XmYYs
                const min = Math.floor(totalDurationSec / 60);
                const sec = Math.round(totalDurationSec % 60);
                const durationStr = `${min}m${sec < 10 ? '0' : ''}${sec}s`;

                return (
                  <SummaryCard
                    icon={<Footprints className="w-6 h-6 text-orange-500" />}
                    label="Promenade"
                    value={Number((totalDistance / 1000).toFixed(2))}
                    unit="km"
                    time={`${durationStr}`}
                    onClick={pet ? () => navigate(`/suivi/promenade?pet=${pet.id}`) : undefined}
                  />
                );
              })()}
              {(() => {
                const today = selectedSummaryDate;
                // Daily events pipi
                const peesToday = summary.daily?.filter(e => e.type === 'pee' && new Date(e.datetime).toDateString() === today.toDateString()) || [];
                // Pipi dans les balades du jour
                const walksToday = summary.walks?.filter(w => {
                  const d = new Date(w.start_time);
                  return d.toDateString() === today.toDateString();
                }) || [];
                let walkPipiCount = 0;
                walksToday.forEach(w => {
                  if (Array.isArray(w.events)) {
                    walkPipiCount += w.events.filter(evt => evt.type === 'pipi').length;
                  }
                });
                const totalPipi = peesToday.length + walkPipiCount;
                const lastPee = peesToday[0];
                return (
                  <SummaryCard
                    icon={<Droplet className="w-6 h-6 text-orange-500" />}
                    label="Pipi"
                    value={totalPipi > 0 ? totalPipi : undefined}
                    unit=""
                    time={totalPipi === 0 ? "Aucun" : undefined}
                    onClick={pet ? () => navigate(`/suivi/promenade?pet=${pet.id}`) : undefined}
                  />
                );
              })()}
              {(() => {
                const today = selectedSummaryDate;
                // Daily events caca
                const poosToday = summary.daily?.filter(e => e.type === 'poo' && new Date(e.datetime).toDateString() === today.toDateString()) || [];
                // Caca dans les balades du jour
                const walksToday = summary.walks?.filter(w => {
                  const d = new Date(w.start_time);
                  return d.toDateString() === today.toDateString();
                }) || [];
                let walkCacaCount = 0;
                walksToday.forEach(w => {
                  if (Array.isArray(w.events)) {
                    walkCacaCount += w.events.filter(evt => evt.type === 'caca').length;
                  }
                });
                const totalCaca = poosToday.length + walkCacaCount;
                const lastPoo = poosToday[0];
                return (
                  <SummaryCard
                    icon={<Sprout className="w-6 h-6 text-orange-500" />}
                    label="Caca"
                    value={totalCaca > 0 ? totalCaca : undefined}
                    unit=""
                    time={totalCaca === 0 ? "Aucun" : undefined}
                    onClick={pet ? () => navigate(`/suivi/promenade?pet=${pet.id}`) : undefined}
                  />
                );
              })()}
              {(() => {
                const today = selectedSummaryDate;
                const drinksToday = summary.daily?.filter(e => e.type === 'drink' && new Date(e.datetime).toDateString() === today.toDateString()) || [];
                return (
                  <SummaryCard
                    icon={<GlassWater className="w-6 h-6 text-orange-500" />}
                    label="Eau"
                    value={drinksToday.length > 0 ? drinksToday.length : undefined}
                    unit=""
                    time={drinksToday.length === 0 ? "Aucun" : undefined}
                    onClick={pet ? () => navigate(`/suivi/alimentation?pet=${pet.id}`) : undefined}
                  />
                );
              })()}
              {(() => {
                const today = selectedSummaryDate;
                const symptomsToday = summary.symptoms?.filter(s => {
                  const d = new Date(s.date);
                  return d.toDateString() === today.toDateString();
                }) || [];
                return (
                  <SummaryCard
                    icon={<AlertCircle className="w-6 h-6 text-orange-500" />}
                    label="Symptômes"
                    value={symptomsToday.length > 0 ? symptomsToday.length : undefined}
                    unit=""
                    time={symptomsToday.length === 0 ? "Aucun" : undefined}
                    onClick={pet ? () => navigate(`/suivi/symptomes?pet=${pet.id}`) : undefined}
                  />
                );
              })()}
            </div>
          </div>
        </div>

        {/* Calendrier */}
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow">
          <div className="p-4 sm:p-6">
            {/* Header calendrier : titre à gauche, chevrons à droite */}
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h2 className="font-semibold text-base text-gray-900">Calendrier</h2>
              <div className="flex gap-2 items-center">
                {calendarView === 'month' && (
                  <>
                    <button
                      onClick={() => {
                        if (calendarMonth === 0) {
                          setCalendarMonth(11);
                          setCalendarYear(y => y - 1);
                        } else {
                          setCalendarMonth(m => m - 1);
                        }
                      }}
                      className="text-emerald-600 text-xl"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-semibold text-base min-w-[120px] text-center">
                      {new Date(calendarYear, calendarMonth).toLocaleString('fr-FR', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <button
                      onClick={() => {
                        if (calendarMonth === 11) {
                          setCalendarMonth(0);
                          setCalendarYear(y => y + 1);
                        } else {
                          setCalendarMonth(m => m + 1);
                        }
                      }}
                      className="text-emerald-600 text-xl"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
                {calendarView === 'week' && (
                  <>
                    <button
                      onClick={() => setSelectedDate(d => {
                        const prev = new Date(d);
                        prev.setDate(prev.getDate() - 7);
                        return prev;
                      })}
                      className="text-emerald-600 text-xl"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-semibold text-base min-w-[120px] text-center">
                      {(() => {
                        const weekDays = getWeekDays(selectedDate);
                        const first = weekDays[0];
                        const last = weekDays[6];
                        return `${first.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - ${last.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
                      })()}
                    </span>
                    <button
                      onClick={() => setSelectedDate(d => {
                        const next = new Date(d);
                        next.setDate(next.getDate() + 7);
                        return next;
                      })}
                      className="text-emerald-600 text-xl"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
                {calendarView === 'day' && (
                  <>
                    <button
                      onClick={() => setSelectedDate(d => {
                        const prev = new Date(d);
                        prev.setDate(prev.getDate() - 1);
                        return prev;
                      })}
                      className="text-emerald-600 text-xl"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-semibold text-base min-w-[120px] text-center">
                      {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setSelectedDate(d => {
                        const next = new Date(d);
                        next.setDate(next.getDate() + 1);
                        return next;
                      })}
                      className="text-emerald-600 text-xl"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* Filtres sous le header */}
            <div className="flex justify-center gap-2 mb-4 text-sm">
              <button
                onClick={() => setCalendarView('month')}
                className={`px-2 py-1 rounded ${calendarView === 'month' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}
              >
                Mois
              </button>
              <button
                onClick={() => setCalendarView('week')}
                className={`px-2 py-1 rounded ${calendarView === 'week' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}
              >
                Semaine
              </button>
              <button
                onClick={() => setCalendarView('day')}
                className={`px-2 py-1 rounded ${calendarView === 'day' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}
              >
                Jour
              </button>
            </div>
            {/* Calendrier grille */}
            {calendarView === 'month' && (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-2 min-w-[560px]">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                    <div key={d} className="text-center font-semibold text-emerald-700 p-2 text-xs">{d}</div>
                  ))}
                  {/* Décalage du premier jour */}
                  {Array((calendarFirstDayOfWeek + 6) % 7)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i}></div>
                    ))}
                  {calendarDays.map(day => {
                    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                    const evts = calendarEvents[key] || [];
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={key}
                        className={`rounded-lg p-2 min-h-[60px] flex flex-col items-center border transition-colors cursor-pointer ${
                          isToday ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedDate(day);
                          setCalendarView('day');
                        }}
                      >
                        <div className={`font-bold text-sm mb-1 ${isToday ? 'text-emerald-700' : 'text-gray-900'}`}>{day.getDate()}</div>
                        <div className="flex flex-wrap gap-1 justify-center items-center">
                          {evts.length <= 2 && evts.map((e, i) => (
                            <span key={i} title={e.type} className="text-base">
                              {CALENDAR_LUCIDE_ICONS[e.type] || <CalendarIcon className="w-5 h-5 text-orange-500" />}
                            </span>
                          ))}
                          {evts.length > 2 && (
                            <>
                              <span title={evts[0].type} className="text-base">
                                {CALENDAR_LUCIDE_ICONS[evts[0].type] || <CalendarIcon className="w-5 h-5 text-orange-500" />}
                              </span>
                              <span title={evts[1].type} className="text-base">
                                {CALENDAR_LUCIDE_ICONS[evts[1].type] || <CalendarIcon className="w-5 h-5 text-orange-500" />}
                              </span>
                              <span className="text-base text-orange-500">•</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {calendarView === 'week' && (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-2 min-w-[560px]">
                  {getWeekDays(selectedDate).map(day => {
                    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                    const evts = calendarEvents[key] || [];
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={key}
                        className={`rounded-lg p-2 min-h-[60px] flex flex-col items-center border transition-colors cursor-pointer ${
                          isToday ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedDate(day);
                          setCalendarView('day');
                        }}
                      >
                        <div className={`font-bold text-sm mb-1 ${isToday ? 'text-emerald-700' : 'text-gray-900'}`}>{day.getDate()}</div>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {evts.map((e, i) => (
                            <span key={i} title={e.type} className="text-base">
                              {CALENDAR_LUCIDE_ICONS[e.type] || <CalendarIcon className="w-5 h-5 text-orange-500" />}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {calendarView === 'day' && (
              <div className="py-4">
                <div className="font-semibold text-emerald-700 mb-2">
                  {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                <div className="space-y-2">
                  {(() => {
                    const key = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
                    const evts = calendarEvents[key] || [];
                    if (evts.length === 0) return <div className="text-gray-400">Aucun événement ce jour</div>;
                    return evts.map((e, i) => (
                      <div key={i} className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                        <span className="text-2xl">{CALENDAR_LUCIDE_ICONS[e.type] || <CalendarIcon className="w-6 h-6 text-orange-500" />}</span>
                        <div className="flex-1">
                          <div className="font-medium text-emerald-800 capitalize">{getEventLabelFr(e.label) || getEventLabelFr(e.type)}</div>
                          <div className="text-emerald-600 text-sm">
                            {e.datetime ? new Date(e.datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                            {e.start_time ? new Date(e.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                            {e.date ? new Date(e.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                          {e.note && <div className="text-gray-500 text-sm mt-1">{e.note}</div>}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modale d'édition d'événement */}
        {editEvent && (
          <>
            {/* Rappel (reminder) */}
            {editEvent.type === 'rappel' && (
              <ReminderEdit
                open={true}
                id={editEvent.id}
                onSave={() => { setEditEvent(null); /* refresh data */ setLoading(true); setTimeout(() => setLoading(false), 500); }}
                onCancel={() => setEditEvent(null)}
              />
            )}
            {/* Health event */}
            {[
              'vaccination', 'vet_visit', 'medication', 'symptom', 'deworming', 'soins', 'weight'
            ].includes(editEvent.type) && (
              <ReminderEdit
                open={true}
                id={editEvent.id || editEvent.event_id}
                onSave={() => { setEditEvent(null); setLoading(true); setTimeout(() => setLoading(false), 500); }}
                onCancel={() => setEditEvent(null)}
              />
            )}
            {/* Repas */}
          
            {/* Daily event (à adapter si tu as une modale) */}
            {/* ... */}
          </>
        )}

        {loading && (
          <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        )}
      </div>
    </div>
  );
} 