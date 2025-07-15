import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import {
  Footprints, Route, Clock, Plus, Edit, Trash2, Eye, EyeOff, Calendar, Navigation, ArrowLeft
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ConfirmModal from '../components/ConfirmModal';
import WalkForm from '../components/WalkForm';

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
  // Ajout de l'état pour la date sélectionnée (par défaut aujourd'hui)
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 font-semibold flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-2 rounded transition text-base sm:text-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <Footprints className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 whitespace-pre-line font-ranille">Historique des promenades</h1>
          </div>
          {/* Sélecteur de date */}
          <div className="ml-auto flex items-center gap-2 mt-2 sm:mt-0">
            <label htmlFor="date-select" className="text-sm font-medium text-gray-700">Jour :</label>
            <input
              id="date-select"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              max={todayStr}
            />
          </div>
        </div>
        {/* Stats du jour sélectionné */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <div className="bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-200 rounded-xl shadow p-2 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-700 mb-1">
              <Footprints className="h-4 w-4" />
              <span className="text-xs font-medium">Balades du jour</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-gray-900">{walksOfDay.length}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-cyan-50 border border-blue-200 rounded-xl shadow p-2 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-700 mb-1">
              <Route className="h-4 w-4" />
              <span className="text-xs font-medium">Distance du jour</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-gray-900">{(dayDistance/1000).toFixed(2)} km</div>
          </div>
          <div className="bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-200 rounded-xl shadow p-2 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-700 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Temps du jour</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-gray-900">{formatTime(dayDuration)}</div>
          </div>
        </div>
        {/* Stats rapides globales */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow p-2 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
              <Footprints className="h-4 w-4" />
              <span className="text-xs font-medium">Total balades</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-gray-900">{walks.length}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl shadow p-2 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Route className="h-4 w-4" />
              <span className="text-xs font-medium">Distance totale</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-gray-900">{(totalDistance/1000).toFixed(1)} km</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl shadow p-2 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Temps total</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-gray-900">{formatTime(totalDuration)}</div>
          </div>
        </div>
        {/* Liste des balades */}
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-4 sm:p-6 border-b border-emerald-100">
            <span className="font-semibold text-base sm:text-lg">Balades récentes</span>
            <button
              onClick={() => setEditWalk({})}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-3 py-2 rounded-xl shadow flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </button>
          </div>
          <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                <span className="ml-3 text-gray-600">Chargement...</span>
              </div>
            ) : walks.length === 0 ? (
              <div className="text-center py-12">
                <Footprints className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium text-lg">Aucune promenade enregistrée</p>
                <p className="text-sm text-gray-500 mt-2">Commencez à enregistrer vos balades !</p>
              </div>
            ) : (
              walks.map((walk) => {
                const duration = Math.floor((new Date(walk.end_time) - new Date(walk.start_time))/1000);
                const positions = getPositions(walk);
                const events = Array.isArray(walk.events) ? walk.events : [];
                const isMapVisible = showMap === walk.id;
                return (
                  <div key={walk.id} className="border-l-4 border-l-emerald-500 bg-white rounded-xl shadow hover:shadow-md transition-shadow">
                    <div className="p-3 sm:p-6">
                      {/* Header de la balade */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-emerald-600" />
                            <span className="font-semibold text-gray-900">{formatDate(walk.start_time)}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(duration)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Route className="h-3 w-3" />
                              {(walk.distance_m/1000).toFixed(2)} km
                            </div>
                            {positions.length > 0 && (
                              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded flex items-center gap-1">
                                <Navigation className="h-3 w-3 mr-1" />GPS
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowMap(isMapVisible ? null : walk.id)}
                            className="text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded px-2 py-1 text-xs sm:text-sm flex items-center gap-1"
                          >
                            {isMapVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {isMapVisible ? 'Masquer' : 'Voir tracé'}
                          </button>
                        </div>
                      </div>
                      {/* Événements */}
                      {events.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-700">Événements :</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {events.map((event, i) => {
                              const min = typeof event.elapsed === 'number' ? Math.floor(event.elapsed/60) : null;
                              return (
                                <span
                                  key={i}
                                  className={
                                    'px-2 py-1 rounded text-xs font-semibold ' +
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
                        </div>
                      )}
                      {/* Carte */}
                      {isMapVisible && (
                        <div className="mb-4">
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
                              <p className="text-sm text-gray-500 mt-1">Cette balade n'a pas été enregistrée avec le GPS</p>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="border-t border-gray-200 my-4" />
                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditWalk(walk)}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded px-2 py-1 text-xs sm:text-sm flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(walk.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded px-2 py-1 text-xs sm:text-sm flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
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