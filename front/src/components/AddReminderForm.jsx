import React, { useState } from 'react';
import axios from '../utils/axiosInstance';
import { Stethoscope, Syringe, Pill, AlertCircle, Heart } from 'lucide-react';

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

export default function AddReminderForm({ petId, onSave, onCancel, initial }) {
  const [healthType, setHealthType] = useState(initial?.type || 'vaccination');
  const [healthDate, setHealthDate] = useState(initial?.date ? initial.date.slice(0, 10) : '');
  const [healthTime, setHealthTime] = useState(initial?.date ? new Date(initial.date).toISOString().slice(11, 16) : '12:00');
  const [healthNote, setHealthNote] = useState(initial?.note || '');
  const [recurrence, setRecurrence] = useState(initial?.recurrence || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const date = new Date(`${healthDate}T${healthTime}`);
      if (initial?.id) {
        await axios.put(`/health-events/${initial.id}`, {
          pet_id: petId,
          type: healthType,
          date: date.toISOString(),
          note: healthNote,
          recurrence: recurrence || null,
        });
      } else {
        await axios.post('/health-events', {
          pet_id: petId,
          type: healthType,
          date: date.toISOString(),
          note: healthNote,
          recurrence: recurrence || null,
        });
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const selectedType = healthTypes.find(t => t.value === healthType);
  const IconComponent = selectedType?.icon || Stethoscope;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-96 max-w-full space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <IconComponent className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold">{initial ? 'Modifier' : 'Créer'} un événement santé</span>
        </div>
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          Un événement santé sera {initial ? 'modifié' : 'ajouté'} à l'historique (ex : vaccination, vermifuge, etc). Vous pourrez le retrouver dans l'onglet santé.
        </div>
        <div>
          <label className="text-sm font-medium">Type d'événement</label>
          <select value={healthType} onChange={e => setHealthType(e.target.value)} className="w-full border rounded p-2 mt-1">
            {healthTypes.map(t => (
              <option key={t.value} value={t.value}>
                {initial ? '🔹 ' : ''}{t.label}
              </option>
            ))}
          </select>
          {initial && (
            <div className="flex flex-wrap gap-2 mt-2">
              {healthTypes.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-semibold transition ${healthType === t.value ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500' : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'}`}
                    onClick={() => setHealthType(t.value)}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Note</label>
          <textarea value={healthNote} onChange={e => setHealthNote(e.target.value)} className="w-full border rounded p-2 mt-1" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Date</label>
            <input type="date" value={healthDate} onChange={e => setHealthDate(e.target.value)} className="w-full border rounded p-2 mt-1" required />
          </div>
          <div>
            <label className="text-sm font-medium">Heure</label>
            <input type="time" value={healthTime} onChange={e => setHealthTime(e.target.value)} className="w-full border rounded p-2 mt-1" required />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Répétition</label>
          <select value={recurrence} onChange={e => setRecurrence(e.target.value)} className="w-full border rounded p-2 mt-1">
            {RECURRENCE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-2 rounded-xl shadow hover:from-emerald-600 hover:to-teal-600 transition">
            {loading ? 'Enregistrement...' : (initial ? 'Modifier' : 'Ajouter')}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-xl border border-gray-300 hover:bg-gray-200 transition">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
} 