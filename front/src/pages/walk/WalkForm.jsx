import React, { useState } from 'react';
import axios from '../../utils/axiosInstance';
import { Footprints } from 'lucide-react';

export default function WalkForm({ petId, initial, onSave, onCancel }) {
  const isEdit = !!initial;
  const [distanceKm, setDistanceKm] = useState(
    isEdit ? ((initial.distance_m || 0) / 1000).toString() : ''
  );
  const [durationMin, setDurationMin] = useState(
    isEdit
      ? (
          Math.floor(
            (new Date(initial.end_time) - new Date(initial.start_time)) / 60000
          ).toString()
        )
      : ''
  );
  const [date, setDate] = useState(
    isEdit
      ? new Date(initial.start_time).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [time, setTime] = useState(
    isEdit
      ? new Date(initial.start_time).toISOString().slice(11, 16)
      : '12:00'
  );
  const [pipi, setPipi] = useState(
    isEdit ? initial?.events?.some((e) => e.type === 'pipi') : false
  );
  const [caca, setCaca] = useState(
    isEdit ? initial?.events?.some((e) => e.type === 'caca') : false
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrors([]);
    try {
      const start = new Date(`${date}T${time}`);
      const durationSec = parseInt(durationMin, 10) * 60;
      const end = new Date(start.getTime() + durationSec * 1000);
      const events = [];
      if (pipi)
        events.push({
          type: 'pipi',
          position: null,
          elapsed: Math.floor(durationSec / 2),
          timestamp: new Date(start.getTime() + (durationSec / 2) * 1000).toISOString(),
        });
      if (caca)
        events.push({
          type: 'caca',
          position: null,
          elapsed: Math.floor(durationSec / 2),
          timestamp: new Date(start.getTime() + (durationSec / 2) * 1000).toISOString(),
        });
      if (isEdit) {
        await axios.put(`/walks/${initial.id}`, {
          pet_id: petId,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          distance_m: Math.round(parseFloat(distanceKm) * 1000),
          geojson_path: null,
          positions: [],
          events,
        });
      } else {
        await axios.post('/walks', {
          pet_id: petId,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          distance_m: Math.round(parseFloat(distanceKm) * 1000),
          geojson_path: null,
          positions: [],
          events,
        });
      }
      onSave && onSave();
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors.map(e => e.msg));
      } else {
        setError(err.response?.data?.error || "Erreur lors de l'enregistrement");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xs sm:max-w-md">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-8 w-96 max-w-full space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <Footprints className="h-5 w-5 text-white" />
          </div>
          <span className="text-base font-semibold">
            {isEdit ? 'Modifier' : 'Ajouter'} une balade
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Distance (km)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              className="w-full border rounded p-2 mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Durée (minutes)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              className="w-full border rounded p-2 mt-1"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded p-2 mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Heure</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border rounded p-2 mt-1"
              required
            />
          </div>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={pipi}
              onChange={(e) => setPipi(e.target.checked)}
            />
            <span className="text-base">💧</span> Pipi
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={caca}
              onChange={(e) => setCaca(e.target.checked)}
            />
            <span className="text-base">💩</span> Caca
          </label>
        </div>
        {errors.length > 0 && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200 mb-2 text-xs">
            <ul className="list-disc pl-5">
              {errors.map((errMsg, i) => <li key={i}>{errMsg}</li>)}
            </ul>
          </div>
        )}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-2 rounded-xl shadow hover:from-emerald-600 hover:to-teal-600 transition"
          >
            {loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Ajouter'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-xl border border-gray-300 hover:bg-gray-200 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
} 