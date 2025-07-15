import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const HEALTH_TYPES = [
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'vet_visit', label: 'Visite véto' },
  { value: 'medication', label: 'Traitement' },
  { value: 'deworming', label: 'Vermifuge' },
  { value: 'weight', label: 'Poids' },
  { value: 'soins', label: 'Soins' },
];
const RECURRENCE_OPTIONS = [
  { value: '', label: 'Aucune' },
  { value: '1y', label: 'Tous les ans' },
  { value: '6m', label: 'Tous les 6 mois' },
  { value: '3m', label: 'Tous les 3 mois' },
  { value: '1m', label: 'Tous les mois' },
];

export default function HealthEventEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`/health-events/id/${id}`)
      .then(res => setEvent(res.data))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = e => {
    setEvent(ev => ({ ...ev, [e.target.name]: e.target.value }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axios.put(`/health-events/${id}`, {
        type: event.type,
        date: event.date,
        note: event.note,
        recurrence: event.recurrence,
        completed: event.completed,
      });
      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setConfirmDeleteOpen(true);
  };
  const confirmDelete = async () => {
    await axios.delete(`/health-events/${id}`);
    setConfirmDeleteOpen(false);
    navigate(-1);
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

  if (loading) return <div className="p-4">Chargement...</div>;
  if (!event) return <div className="p-4 text-red-500">Événement introuvable</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 font-semibold flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-2 rounded transition text-base sm:text-lg"
          >
            <ArrowLeft className="w-6 h-6" />
            Retour
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 whitespace-pre-line font-ranille">Éditer l'événement santé</h1>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow p-6">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium">Type d'événement</label>
              <select name="type" value={event.type} onChange={handleChange} className="w-full border rounded p-2 mt-1">
                {HEALTH_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Date et heure</label>
              <input type="datetime-local" name="date" value={event.date ? event.date.slice(0,16) : ''} onChange={handleChange} className="w-full border rounded p-2 mt-1" required />
            </div>
            <div>
              <label className="text-sm font-medium">Note</label>
              <textarea name="note" value={event.note || ''} onChange={handleChange} className="w-full border rounded p-2 mt-1" rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium">Répétition</label>
              <select name="recurrence" value={event.recurrence || ''} onChange={handleChange} className="w-full border rounded p-2 mt-1">
                {RECURRENCE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="text-xs text-gray-500">Statut : {event.completed ? <span className="text-green-600 font-semibold">Terminé</span> : <span className="text-yellow-600 font-semibold">Actif</span>}</div>
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-2 rounded-xl shadow hover:from-emerald-600 hover:to-teal-600 transition">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              {!event.completed && (
                <button type="button" onClick={handleMarkCompleted} className="flex-1 bg-green-100 text-green-700 font-semibold py-2 rounded-xl border border-green-200 hover:bg-green-200 transition">
                  Marquer comme terminé
                </button>
              )}
            </div>
          </form>
          <button
            onClick={handleDelete}
            className="w-full mt-6 bg-red-100 text-red-700 font-semibold py-2 rounded-xl border border-red-200 hover:bg-red-200 transition"
          >
            Supprimer l'événement
          </button>
        </div>
      </div>
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