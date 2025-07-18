import React, { useEffect, useState, useRef } from 'react';
import axios from '../../utils/axiosInstance';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Footprints, Clock, MapPin, Plus, ChevronRight, Play, Square, Route, Navigation
} from 'lucide-react';
import WalkForm from './WalkForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

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

function haversineDistance(lat1, lon1, lat2, lon2) {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }
  const R = 6371e3;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function MapAutoCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && map) map.setView(position, 16);
  }, [position, map]);
  return null;
}

export default function PromenadeSection({ petId, onShowHistory }) {
  // Ajout d'une clé unique pour le localStorage par utilisateur/animal
  const walkStorageKey = petId ? `walk_in_progress_${petId}` : 'walk_in_progress';

  const [lastWalk, setLastWalk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [positions, setPositions] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPipi, setConfirmPipi] = useState(false);
  const [confirmCaca, setConfirmCaca] = useState(false);
  const watchId = useRef(null);

  // Restaure l'état de la balade en cours au montage
  useEffect(() => {
    if (!petId) return;
    const saved = localStorage.getItem(walkStorageKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setIsTracking(data.isTracking || false);
        setPositions(data.positions || []);
        setStartTime(data.startTime || null);
        setElapsed(data.elapsed || 0);
        setDistance(data.distance || 0);
        setEvents(data.events || []);
      } catch (e) {
        // Si erreur, on ignore
      }
    }
  }, [petId]);

  // Sauvegarde l'état de la balade en cours à chaque changement
  useEffect(() => {
    if (!petId) return;
    if (isTracking) {
      localStorage.setItem(walkStorageKey, JSON.stringify({
        isTracking,
        positions,
        startTime,
        elapsed,
        distance,
        events,
      }));
    } else {
      localStorage.removeItem(walkStorageKey);
    }
  }, [isTracking, positions, startTime, elapsed, distance, events, petId]);

  useEffect(() => {
    if (!petId) return;
    setLoading(true);
    axios.get(`/walks/${petId}`)
      .then(res => {
        const sorted = res.data.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
        setLastWalk(sorted[0] || null);
      })
      .catch(() => setLastWalk(null))
      .finally(() => setLoading(false));
  }, [petId]);

  // Chrono
  useEffect(() => {
    if (!isTracking || !startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  // Start tracking
  const startTracking = () => {
    setPositions([]);
    setDistance(0);
    setElapsed(0);
    setStartTime(Date.now());
    setIsTracking(true);
    setEvents([]);
    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        pos => {
          setPositions(prev => {
            if (!prev.length) return [[pos.coords.latitude, pos.coords.longitude]];
            const last = prev[prev.length - 1];
            const d = haversineDistance(last[0], last[1], pos.coords.latitude, pos.coords.longitude);
            if (d > 2) {
              setDistance(dist => dist + d);
              return [...prev, [pos.coords.latitude, pos.coords.longitude]];
            }
            return prev;
          });
        },
        err => alert('Erreur GPS: ' + err.message),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
    } else {
      alert('Géolocalisation non supportée');
    }
  };

  // Stop and save
  const stopAndSave = () => {
    setShowConfirm(true);
    setConfirmPipi(false);
    setConfirmCaca(false);
  };

  // Fonction qui fait vraiment l'enregistrement après confirmation
  const doSaveWalk = async () => {
    setShowConfirm(false);
    setIsTracking(false);
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setSaving(true);
    try {
      let newEvents = [...events];
      // Ajout pipi/caca si coché dans la popup
      const hasPipi = newEvents.some(e => e.type === 'pipi');
      const hasCaca = newEvents.some(e => e.type === 'caca');
      if (!hasPipi && confirmPipi) {
        newEvents.push({
          type: 'pipi',
          position: null,
          elapsed: elapsed,
          timestamp: new Date().toISOString(),
        });
      }
      if (!hasCaca && confirmCaca) {
        newEvents.push({
          type: 'caca',
          position: null,
          elapsed: elapsed,
          timestamp: new Date().toISOString(),
        });
      }
      await axios.post('/walks', {
        pet_id: petId,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date().toISOString(),
        distance_m: Math.round(distance),
        geojson_path: JSON.stringify(positions),
        positions,
        events: newEvents,
      });
      setPositions([]);
      setDistance(0);
      setElapsed(0);
      setStartTime(null);
      setEvents([]);
      // Nettoie le localStorage après enregistrement
      localStorage.removeItem(walkStorageKey);
      await axios.get(`/walks/${petId}`).then(res => {
        const sorted = res.data.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
        setLastWalk(sorted[0] || null);
      });
    } catch (e) {
      alert('Erreur lors de l\'enregistrement');
    }
    setSaving(false);
  };

  // Ajout pipi/caca pendant le tracking
  const addEvent = (type) => {
    if (!isTracking || !positions.length) return;
    setEvents(evts => ([
      ...evts,
      {
        type,
        position: positions[positions.length - 1],
        elapsed: elapsed,
        timestamp: new Date().toISOString(),
      }
    ]));
  };

  const formatTime = s => {
    const m = Math.floor(s/60);
    const sec = s%60;
    return `${m}m${sec < 10 ? '0' : ''}${sec}s`;
  };

  return (
    <div className="max-w-4xl mx-auto mb-4">
      <section className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <Footprints className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-ranille">Promenades</h2>
          </div>
          <button
            onClick={onShowHistory}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 font-semibold flex items-center gap-1 px-3 py-2 rounded transition text-sm"
          >
            Historique
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        {!isTracking && (
          <>
            <button
              onClick={() => setShowAdd(true)}
              className="w-full border-2 border-emerald-500 text-emerald-600 bg-transparent px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-emerald-50 transition mb-2 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="h-5 w-5" />
              Ajouter une balade manuellement
            </button>
            <button
              onClick={startTracking}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-3 rounded-xl font-bold shadow hover:from-emerald-600 hover:to-teal-600 transition mb-4 flex items-center justify-center gap-2 text-sm"
            >
              <Footprints className="h-5 w-5" />
              Démarrer une balade
            </button>
          </>
        )}
        {isTracking && (
          <>
            <button onClick={stopAndSave} className="w-full bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold shadow hover:bg-emerald-600 transition mb-2" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Arrêter et enregistrer'}
            </button>
            {showConfirm && (
              <>
                <div className="fixed inset-0 bg-black bg-opacity-40 z-[2000]"></div>
                <div className="fixed inset-0 flex items-center justify-center z-[3000]">
                  <div className="bg-white rounded-2xl shadow-lg p-6 w-80 max-w-full animate-fade-in">
                    <div className="text-base font-bold mb-2 text-center text-gray-900">Enregistrer la balade</div>
                    <div className="mb-4 text-gray-500 text-sm text-center">Voulez-vous enregistrer cette balade&nbsp;?</div>
                    {(!events.some(e => e.type === 'pipi') || !events.some(e => e.type === 'caca')) && (
                      <div className="mb-4">
                        {!events.some(e => e.type === 'pipi') && (
                          <label className="flex items-center gap-2 mb-2 text-gray-500">
                            <input type="checkbox" checked={confirmPipi} onChange={e => setConfirmPipi(e.target.checked)} />
                            <span>Votre chien a-t-il fait pipi&nbsp;?</span>
                          </label>
                        )}
                        {!events.some(e => e.type === 'caca') && (
                          <label className="flex items-center gap-2 text-gray-500">
                            <input type="checkbox" checked={confirmCaca} onChange={e => setConfirmCaca(e.target.checked)} />
                            <span>Votre chien a-t-il fait caca&nbsp;?</span>
                          </label>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button onClick={doSaveWalk} className="flex-1 bg-emerald-500/10 border border-emerald-500 text-gray-500 py-2 rounded-xl font-bold hover:bg-emerald-500/30 transition">Enregistrer la balade</button>
                      <button onClick={() => setShowConfirm(false)} className="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-bold hover:bg-emerald-600 transition">Annuler</button>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="flex gap-2 mb-2">
              <button onClick={() => addEvent('pipi')} className="flex-1 bg-emerald-500/10 border border-emerald-500 text-gray-500 px-3 py-2 rounded-xl font-bold shadow hover:bg-emerald-500/30 transition">💧 Ajouter pipi</button>
              <button onClick={() => addEvent('caca')} className="flex-1 bg-emerald-500/10 border border-emerald-500 text-gray-500 px-3 py-2 rounded-xl font-bold shadow hover:bg-emerald-500/30 transition">💩 Ajouter caca</button>
            </div>
          </>
        )}
        {isTracking && positions.length > 0 && (
          <div className="mb-2">
            <MapContainer center={positions[0]} zoom={16} style={{ height: 250, width: '100%' }} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {positions.length > 0 && <MapAutoCenter position={positions[positions.length-1]} />}
              <Polyline positions={positions} color="#0EBA8C" />
              {positions.length > 0 && <Marker position={positions[positions.length-1]} />}
              {events.map((evt, i) => (
                evt.position && (
                  <Marker key={i} position={evt.position} icon={evt.type === 'pipi' ? pipiIcon : cacaIcon}>
                    <Popup>
                      <span style={{fontSize: '1.5rem'}}>{evt.type === 'pipi' ? '💧' : '💩'}</span>
                      <div className="text-xs mt-1 text-gray-500">{evt.type === 'pipi' ? 'Pipi' : 'Caca'} à {formatTime(evt.elapsed)}</div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        )}
        {isTracking && (
          <div className="flex gap-4 text-base justify-center mb-2 text-gray-500">
            <div>⏱ {formatTime(elapsed)}</div>
            <div>📏 {(distance/1000).toFixed(2)} km</div>
          </div>
        )}
        {!isTracking && (
          <div className="flex gap-6 text-base justify-center">
            {loading && <LoadingSpinner overlay />}
            {loading ? (
              <div className="text-gray-500 text-sm">Chargement...</div>
            ) : lastWalk ? (
              <div className="bg-white/80 rounded-xl p-4 shadow border border-emerald-100">
                <span className="block text-center font-semibold mb-2 text-sm">Dernière balade</span>
                <div className="flex items-center gap-4 justify-center">
                  <Clock className="h-5 w-5 text-emerald-500" />
                  <span className="font-semibold text-gray-900 text-sm">
                    {formatTime(Math.floor((new Date(lastWalk.end_time) - new Date(lastWalk.start_time))/1000))}
                  </span>
                  <MapPin className="h-5 w-5 text-emerald-500" />
                  <span className="font-semibold text-gray-900 text-sm">
                    {((lastWalk.distance_m || 0)/1000).toFixed(2)} km
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">Aucune balade</div>
            )}
          </div>
        )}
        {showAdd && (
          <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="w-full max-w-xs sm:max-w-md">
                <WalkForm
                  petId={petId}
                  onSave={() => { setShowAdd(false); window.location.reload(); }}
                  onCancel={() => setShowAdd(false)}
                />
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
} 