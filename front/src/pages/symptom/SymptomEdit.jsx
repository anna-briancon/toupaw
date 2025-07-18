import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { AlertCircle } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

export default function SymptomEdit({ open, id, onSave, onCancel }) {
  const [symptom, setSymptom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (!open || !id) return;
    setLoading(true);
    axios.get(`/symptoms/id/${id}`)
      .then(res => setSymptom(res.data))
      .catch(() => setSymptom(null))
      .finally(() => setLoading(false));
  }, [id, open]);

  const handleChange = e => {
    setSymptom(s => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axios.put(`/symptoms/${id}`, {
        description: symptom.description,
        intensity: symptom.intensity,
        date: symptom.date,
        location: symptom.location,
        photo_url: symptom.photo_url,
      });
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
    await axios.delete(`/symptoms/${id}`);
    setConfirmDeleteOpen(false);
    if (onSave) onSave();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-xl p-8 w-96 max-w-full space-y-4 relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
          <span className="text-base font-semibold">Éditer le symptôme</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
        ) : !symptom ? (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">Symptôme introuvable</div>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium">Description</label>
              <input name="description" value={symptom.description || ''} onChange={handleChange} className="w-full border rounded p-2 mt-1" required />
            </div>
            <div>
              <label className="text-sm font-medium">Intensité (optionnel)</label>
              <input name="intensity" value={symptom.intensity || ''} onChange={handleChange} className="w-full border rounded p-2 mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <input name="date" type="date" value={symptom.date ? symptom.date.slice(0,10) : ''} onChange={handleChange} className="w-full border rounded p-2 mt-1" required />
              </div>
              {/* Heure non modifiable ici pour simplifier, peut être ajouté si besoin */}
            </div>
            <div>
              <label className="text-sm font-medium">Localisation (optionnel)</label>
              <input name="location" value={symptom.location || ''} onChange={handleChange} className="w-full border rounded p-2 mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">URL photo (optionnel)</label>
              <input name="photo_url" value={symptom.photo_url || ''} onChange={handleChange} className="w-full border rounded p-2 mt-1" />
            </div>
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-2 rounded-xl shadow hover:from-emerald-600 hover:to-teal-600 transition">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-xl border border-gray-300 hover:bg-gray-200 transition">
                Annuler
              </button>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              className="w-full mt-4 bg-red-100 text-red-700 font-semibold py-2 rounded-xl border border-red-200 hover:bg-red-200 transition"
            >
              Supprimer le symptôme
            </button>
          </>
        )}
      </form>
      <ConfirmModal
        open={confirmDeleteOpen}
        title="Supprimer ce symptôme ?"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer ce symptôme ?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
} 