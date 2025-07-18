import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { Stethoscope, Syringe, Pill, Heart } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const HEALTH_TYPES = [
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

export default function ReminderEdit({ open, id, onSave, onCancel }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editSeries, setEditSeries] = useState(false);

  useEffect(() => {
    if (!open || !id) return;
    setLoading(true);
    axios.get(`/health-events/id/${id}`)
      .then(res => setEvent(res.data))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [id, open]);

  const handleChange = e => {
    setEvent(ev => ({ ...ev, [e.target.name]: e.target.value }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = {};
      if (event.type !== undefined) data.type = event.type;
      if (!editSeries && event.date !== undefined) data.date = event.date;
      if (event.note !== undefined) data.note = event.note;
      if (event.recurrence !== undefined) data.recurrence = event.recurrence;
      if (event.completed !== undefined) data.completed = event.completed;
      if (editSeries && event.group_id) {
        await axios.put(`/health-events/group/${event.group_id}`, data);
      } else {
        await axios.put(`/health-events/${id}`, data);
      }
      if (onSave) onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    setConfirmDeleteOpen(true);
  };
  const confirmDelete = async () => {
    await axios.delete(`/health-events/${id}`);
    setConfirmDeleteOpen(false);
    if (onSave) onSave();
  };

  const handleMarkCompleted = async () => {
    setSaving(true);
    try {
      await axios.put(`/health-events/${id}`, { ...event, completed: true });
      setEvent(ev => ({ ...ev, completed: true }));
    } finally {
      setSaving(false);
    }
  };

  const handleMarkActive = async () => {
    setSaving(true);
    try {
      await axios.put(`/health-events/${id}`, { ...event, completed: false });
      setEvent(ev => ({ ...ev, completed: false }));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const selectedType = HEALTH_TYPES.find(t => t.value === event?.type);
  const IconComponent = selectedType?.icon || Stethoscope;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-xl p-8 w-96 max-w-full space-y-4 relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <IconComponent className="h-5 w-5 text-white" />
          </div>
          <span className="text-base font-semibold">Modifier un événement santé</span>
        </div>
        {loading && <LoadingSpinner overlay />}
        {!event ? (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">Événement introuvable</div>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium">Type d'événement</label>
            
              <div className="flex flex-wrap gap-2 mt-2">
                {HEALTH_TYPES.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-semibold transition ${event.type === t.value ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500' : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'}`}
                      onClick={() => setEvent(ev => ({ ...ev, type: t.value }))}
                    >
                      <Icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Note</label>
              <textarea name="note" value={event.note || ''} onChange={handleChange} className="w-full border rounded p-2 mt-1" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <input type="date" name="date" value={event.date ? event.date.slice(0, 10) : ''} onChange={e => setEvent(ev => ({ ...ev, date: e.target.value + (event.date ? event.date.slice(10) : 'T12:00') }))} className="w-full border rounded p-2 mt-1" required />
              </div>
              <div>
                <label className="text-sm font-medium">Heure</label>
                <input type="time" name="time" value={event.date ? new Date(event.date).toISOString().slice(11, 16) : '12:00'} onChange={e => {
                  setEvent(ev => {
                    const date = ev.date ? ev.date.slice(0, 10) : '';
                    return { ...ev, date: date + 'T' + e.target.value };
                  });
                }} className="w-full border rounded p-2 mt-1" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Répétition</label>
              <select name="recurrence" value={event.recurrence || ''} onChange={handleChange} className="w-full border rounded p-2 mt-1">
                {RECURRENCE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="text-xs text-gray-500">Statut : {event.completed ? <span className="text-green-600 font-semibold">Terminé</span> : <span className="text-yellow-600 font-semibold">Actif</span>}</div>
            {event.group_id && (
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="editSeries" checked={editSeries} onChange={e => setEditSeries(e.target.checked)} />
                <label htmlFor="editSeries" className="text-xs text-gray-700 cursor-pointer">Modifier toute la série</label>
              </div>
            )}
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-2 rounded-xl shadow hover:from-emerald-600 hover:to-teal-600 transition">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-xl border border-gray-300 hover:bg-gray-200 transition">
                Annuler
              </button>
            </div>
            <div className="flex gap-3 pt-2">
              {!event.completed && (
                <button type="button" onClick={handleMarkCompleted} className="flex-1 bg-green-100 text-green-700 font-semibold py-2 rounded-xl border border-green-200 hover:bg-green-200 transition">
                  Marquer comme terminé
                </button>
              )}
              {event.completed && (
                <button type="button" onClick={handleMarkActive} className="flex-1 bg-yellow-50 text-yellow-700 font-semibold py-2 rounded-xl border border-yellow-200 hover:bg-yellow-100 transition">
                  Repasser en actif
                </button>
              )}
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 bg-red-100 text-red-700 font-semibold py-2 rounded-xl border border-red-200 hover:bg-red-200 transition"
              >
                Supprimer l'événement
              </button>
            </div>
          </>
        )}
      </form>
      <ConfirmModal
        open={confirmDeleteOpen}
        title="Supprimer cet événement ?"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cet événement santé ?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
} 