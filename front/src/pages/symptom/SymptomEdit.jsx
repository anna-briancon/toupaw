import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

export default function SymptomEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [symptom, setSymptom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`/symptoms/id/${id}`)
      .then(res => setSymptom(res.data))
      .catch(() => setSymptom(null))
      .finally(() => setLoading(false));
  }, [id]);

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
      navigate(-1);
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
    navigate(-1);
  };

  if (loading) return <div className="p-4">Chargement...</div>;
  if (!symptom) return <div className="p-4 text-red-500">Symptôme introuvable</div>;

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
              <AlertCircle className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 whitespace-pre-line font-ranille">Éditer le symptôme</h1>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow p-6">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
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
            </div>
          </form>
          <button
            onClick={handleDelete}
            className="w-full mt-6 bg-red-100 text-red-700 font-semibold py-2 rounded-xl border border-red-200 hover:bg-red-200 transition"
          >
            Supprimer le symptôme
          </button>
        </div>
      </div>
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