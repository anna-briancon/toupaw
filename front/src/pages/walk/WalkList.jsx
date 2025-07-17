import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import {
  Footprints, ChartColumnDecreasing, Route, Clock, Plus, Edit, Trash2, Eye, EyeOff, Calendar, Navigation, ArrowLeft, ChevronLeft
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ConfirmModal from '../../components/ConfirmModal';
import WalkForm from './WalkForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function usePetId() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  return params.get('pet');
}

const pipiIcon = L.divIcon({
  className: '',
  html: '<div style="background:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:2px solid #3b82f6;font-size:1.5rem;box-shadow:0 2px 6px #0002;">💧</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});
const cacaIcon = L.divIcon({
  className: '',
  html: '<div style="background:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:2px solid #f59e42;font-size:1.5rem;box-shadow:0 2px 6px #0002;">💩</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export default function PromenadesList() {
  const navigate = useNavigate();
  const petId = usePetId();
  const [walks, setWalks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editWalk, setEditWalk] = useState(null);
  const [showMap, setShowMap] = useState(null);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const reload = () => {
    if (!petId) return;
    setLoading(true);
    axios.get(`/walks/${petId}`)
      .then(res => setWalks(res.data.sort((a, b) => new Date(b.start_time) - new Date(a.start_time))))
      .catch(() => setWalks([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line
  }, [petId]);

  const formatTime = s => `${Math.floor(s/60)}m${(s%60).toString().padStart(2,'0')}s`;

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };
  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    await axios.delete(`/walks/${confirmDeleteId}`);
    setConfirmDeleteId(null);
    reload();
  };

  const getPositions = (walk) => {
    if (Array.isArray(walk.positions) && walk.positions.length > 0 && Array.isArray(walk.positions[0]) && walk.positions[0].length === 2) {
      return walk.positions;
    }
    if (walk.geojson_path) {
      try {
        const parsed = JSON.parse(walk.geojson_path);
        if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0]) && parsed[0].length === 2) {
          return parsed;
        }
        if (parsed && parsed.type === 'LineString' && Array.isArray(parsed.coordinates)) {
          return parsed.coordinates;
        }
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].lat !== undefined && parsed[0].lng !== undefined) {
          return parsed.map(p => [p.lat, p.lng]);
        }
      } catch (e) {
        console.warn('Erreur parsing geojson_path', walk.geojson_path, e);
      }
    }
    return [];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return `Aujourd'hui • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Hier • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays <= 7) {
      return `Il y a ${diffDays} jours • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  // Stats globales
  const totalDistance = walks.reduce((sum, w) => sum + (w.distance_m || 0), 0);
  const totalDuration = walks.reduce((sum, w) => sum + Math.floor((new Date(w.end_time) - new Date(w.start_time))/1000), 0);

  // Stats du jour sélectionné
  const walksOfDay = walks.filter(w => {
    const d = new Date(w.start_time);
    return d.toISOString().slice(0, 10) === selectedDate;
  });
  const dayDistance = walksOfDay.reduce((sum, w) => sum + (w.distance_m || 0), 0);
  const dayDuration = walksOfDay.reduce((sum, w) => sum + Math.floor((new Date(w.end_time) - new Date(w.start_time))/1000), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 p-3 sm:p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header amélioré */}
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 mb-6 sm:mb-10 bg-gradient-to-r from-emerald-400/80 to-teal-400/80 rounded-xl sm:rounded-2xl shadow-lg px-3 sm:px-6 py-4 sm:py-8 border border-emerald-200 overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none select-none">
            <Footprints className="h-20 w-20 sm:h-32 sm:w-32 text-white" />
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
              <Footprints className="h-6 w-6 sm:h-10 sm:w-10 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-ranille drop-shadow leading-tight">Historique des promenades</h1>
              <p className="text-white/80 text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium">Suivez les balades de votre animal</p>
            </div>
          </div>
      
        </div>
        {/* Stats du jour sélectionné + Sélecteur de date regroupés */}
        <div className="bg-white/80 border border-emerald-200 rounded-xl shadow p-3 sm:p-5 mb-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="h-5 w-5 text-emerald-500" />
            <label htmlFor="date-select" className="text-sm font-semibold text-emerald-700">Stats du jour :</label>
            <input
              id="date-select"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border border-emerald-200 rounded px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-emerald-400 shadow-sm ml-2"
              max={todayStr}
            />
          </div>
          <div className="flex-1 w-full">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-gradient-to-br from-emerald-200/80 to-teal-100 border-0 rounded-lg sm:rounded-2xl shadow p-2 sm:p-4 text-center flex flex-col items-center">
                <div className="flex items-center justify-center gap-1 sm:gap-2 text-emerald-700 mb-1 sm:mb-2">
                  <Footprints className="h-4 w-4 sm:h-6 sm:w-6" />
                  <span className="text-[10px] sm:text-xs font-semibold">Balades du jour</span>
                </div>
                <div className="text-lg sm:text-2xl font-extrabold text-gray-900">{walksOfDay.length}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-200/80 to-cyan-100 border-0 rounded-lg sm:rounded-2xl shadow p-2 sm:p-4 text-center flex flex-col items-center">
                <div className="flex items-center justify-center gap-1 sm:gap-2 text-blue-700 mb-1 sm:mb-2">
                  <Route className="h-4 w-4 sm:h-6 sm:w-6" />
                  <span className="text-[10px] sm:text-xs font-semibold">Distance du jour</span>
                </div>
                <div className="text-lg sm:text-2xl font-extrabold text-gray-900">{(dayDistance/1000).toFixed(2)} km</div>
              </div>
              <div className="bg-gradient-to-br from-orange-200/80 to-amber-100 border-0 rounded-lg sm:rounded-2xl shadow p-2 sm:p-4 text-center flex flex-col items-center">
                <div className="flex items-center justify-center gap-1 sm:gap-2 text-orange-700 mb-1 sm:mb-2">
                  <Clock className="h-4 w-4 sm:h-6 sm:w-6" />
                  <span className="text-[10px] sm:text-xs font-semibold">Temps du jour</span>
                </div>
                <div className="text-lg sm:text-2xl font-extrabold text-gray-900">{formatTime(dayDuration)}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Stats globales harmonisées */}
        <div className="bg-white/80 border border-emerald-200 rounded-xl shadow p-3 sm:p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <ChartColumnDecreasing className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-700">Stats globales</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-gradient-to-br from-emerald-200/80 to-teal-100 border-0 rounded-lg sm:rounded-2xl shadow p-2 sm:p-4 text-center flex flex-col items-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-emerald-700 mb-1 sm:mb-2">
                <Footprints className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-[10px] sm:text-xs font-semibold">Total balades</span>
              </div>
              <div className="text-lg sm:text-2xl font-extrabold text-gray-900">{walks.length}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-200/80 to-cyan-100 border-0 rounded-lg sm:rounded-2xl shadow p-2 sm:p-4 text-center flex flex-col items-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-blue-700 mb-1 sm:mb-2">
                <Route className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-[10px] sm:text-xs font-semibold">Distance totale</span>
              </div>
              <div className="text-lg sm:text-2xl font-extrabold text-gray-900">{(totalDistance/1000).toFixed(1)} km</div>
            </div>
            <div className="bg-gradient-to-br from-orange-200/80 to-amber-100 border-0 rounded-lg sm:rounded-2xl shadow p-2 sm:p-4 text-center flex flex-col items-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-orange-700 mb-1 sm:mb-2">
                <Clock className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-[10px] sm:text-xs font-semibold">Temps total</span>
              </div>
              <div className="text-lg sm:text-2xl font-extrabold text-gray-900">{formatTime(totalDuration)}</div>
            </div>
          </div>
        </div>
        {/* Liste des balades modernisée */}
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl sm:rounded-2xl shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 sm:p-6 border-b border-emerald-100">
            <span className="font-semibold text-base sm:text-lg text-emerald-700">Balades récentes</span>
            <button
              onClick={() => setEditWalk({})}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow flex items-center gap-2 text-sm sm:text-base transition-transform hover:scale-105"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
              Ajouter
            </button>
          </div>
          <div className="p-2 sm:p-6 space-y-3 sm:space-y-4">
            {loading && <LoadingSpinner overlay />}
            {walks.length === 0 ? (
              <div className="text-center py-10 sm:py-16 flex flex-col items-center">
                <span className="text-4xl sm:text-6xl mb-2 sm:mb-4">🐾</span>
                <p className="text-gray-700 font-bold text-lg sm:text-xl mb-1">Aucune promenade enregistrée</p>
                <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">Commencez à enregistrer vos balades !</p>
                <button
                  onClick={() => setEditWalk({})}
                  className="mt-1 sm:mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-semibold shadow hover:scale-105 transition-transform text-xs sm:text-base"
                >
                  Ajouter une balade
                </button>
              </div>
            ) : (
              walks.map((walk) => {
                const duration = Math.floor((new Date(walk.end_time) - new Date(walk.start_time))/1000);
                const positions = getPositions(walk);
                const events = Array.isArray(walk.events) ? walk.events : [];
                const isMapVisible = showMap === walk.id;
                return (
                  <div key={walk.id} className="group border border-emerald-100 bg-white/90 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5 sm:hover:-translate-y-1 duration-200 px-2 sm:px-4 py-3 sm:py-4 mb-2 sm:mb-3">
                    <div className="flex items-center gap-3 sm:gap-5">
                      <div className="flex-shrink-0 p-2 sm:p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center transition-transform group-hover:scale-105">
                        <Footprints className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-base sm:text-lg text-gray-900 truncate">{formatDate(walk.start_time)}</span>
                          {positions.length > 0 && (
                            <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-0.5 rounded font-medium border border-emerald-100 flex items-center gap-1 ml-1 animate-pulse">
                              <Navigation className="h-3 w-3" />GPS
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 mb-1">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(duration)}</span>
                          <span className="flex items-center gap-1"><Route className="h-3 w-3" />{(walk.distance_m/1000).toFixed(2)} km</span>
                        </div>
                        {events.length > 0 && (
                          <div className="flex flex-wrap gap-1 sm:gap-2 mb-1">
                            {events.map((event, i) => {
                              const min = typeof event.elapsed === 'number' ? Math.floor(event.elapsed/60) : null;
                              return (
                                <span
                                  key={i}
                                  className={
                                    'px-2 py-1 rounded text-[10px] sm:text-xs font-semibold ' +
                                    (event.type === 'pipi'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-orange-100 text-orange-700')
                                  }
                                >
                                  <span className="mr-1">{event.type === 'pipi' ? '💧' : '💩'}</span>
                                  {event.type === 'pipi' ? 'Pipi' : 'Caca'}
                                  {min !== null && ` à ${min}min`}
                                  {event.position && positions.length > 0 && ' (sur carte)'}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {isMapVisible && (
                          <div className="my-2">
                            {positions.length > 0 ? (
                              <MapContainer center={positions[0]} zoom={16} style={{ height: 140, width: '100%' }} scrollWheelZoom={false} className="rounded-xl overflow-hidden">
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Polyline positions={positions} color="#0EBA8C" />
                                {positions.length > 0 && <Marker position={positions[positions.length-1]} />}
                                {events.map((evt, i) => (
                                  evt.position && (
                                    <Marker key={i} position={evt.position} icon={evt.type === 'pipi' ? pipiIcon : cacaIcon}>
                                      <Popup>
                                        <span style={{fontSize: '1.5rem'}}>{evt.type === 'pipi' ? '💧' : '💩'}</span>
                                        <div className="text-xs mt-1 text-gray-500">{evt.type === 'pipi' ? 'Pipi' : 'Caca'} à {typeof evt.elapsed === 'number' ? Math.floor(evt.elapsed/60)+'min' : ''}</div>
                                      </Popup>
                                    </Marker>
                                  )
                                ))}
                              </MapContainer>
                            ) : (
                              <div className="border-dashed border-2 border-gray-300 rounded-xl flex flex-col items-center justify-center py-8 text-center bg-white/80">
                                <Navigation className="h-12 w-12 text-gray-400 mb-3" />
                                <p className="text-gray-600 font-medium">Pas de tracé GPS</p>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">Cette balade n'a pas été enregistrée avec le GPS</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-end ml-2">
                        {positions.length > 0 && (
                          <button
                            onClick={e => { e.stopPropagation(); setShowMap(isMapVisible ? null : walk.id); }}
                            className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded p-1 text-xs flex items-center transition mb-1"
                            title={isMapVisible ? 'Masquer le tracé' : 'Voir le tracé'}
                          >
                            {isMapVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); setEditWalk(walk); }}
                          className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded p-1 text-xs flex items-center transition"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(walk.id); }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 text-xs flex items-center transition"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      {/* Dialog d'édition */}
      {editWalk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-xs sm:max-w-md">
            <WalkForm
              petId={petId}
              initial={editWalk.id ? editWalk : undefined}
              onSave={() => {
                setEditWalk(null);
                reload();
              }}
              onCancel={() => setEditWalk(null)}
            />
          </div>
        </div>
      )}
      <ConfirmModal
        open={!!confirmDeleteId}
        title="Supprimer cette promenade ?"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cette promenade ?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
} 