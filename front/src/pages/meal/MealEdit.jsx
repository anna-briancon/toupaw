import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { ArrowLeft, Utensils } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

export default function MealEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`/meals/id/${id}`)
      .then(res => setMeal(res.data))
      .catch(() => setMeal(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = e => {
    setMeal(m => ({ ...m, [e.target.name]: e.target.value }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axios.put(`/meals/${id}`, {
        food_type: meal.food_type,
        quantity: parseFloat(meal.quantity),
        unit: meal.unit,
        datetime: meal.datetime,
        note: meal.note,
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
    await axios.delete(`/meals/${id}`);
    setConfirmDeleteOpen(false);
    navigate(-1);
  };

  if (loading) return <div className="p-4">Chargement...</div>;
  if (!meal) return <div className="p-4 text-red-500">Repas introuvable</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 font-semibold flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-2 rounded transition text-base sm:text-base"
          >
            <ArrowLeft className="w-6 h-6" />
            Retour
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <Utensils className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 whitespace-pre-line font-ranille">Éditer le repas</h1>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow p-6">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium">Type d'aliment</label>
              <input name="food_type" value={meal.food_type || ''} onChange={handleChange} className="w-full border rounded p-2 mt-1" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Quantité</label>
                <input name="quantity" type="number" min="0" step="0.01" value={meal.quantity || ''} onChange={handleChange} className="w-full border rounded p-2 mt-1" required />
              </div>
              <div>
                <label className="text-sm font-medium">Unité</label>
                <input name="unit" value={meal.unit || ''} onChange={handleChange} className="w-full border rounded p-2 mt-1" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Date et heure</label>
              <input 
                name="datetime" 
                type="datetime-local" 
                value={meal.datetime ? (() => {
                  // Convertir la date UTC en heure locale pour datetime-local
                  const date = new Date(meal.datetime);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  return `${year}-${month}-${day}T${hours}:${minutes}`;
                })() : ''} 
                onChange={handleChange} 
                className="w-full border rounded p-2 mt-1" 
                required 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Note</label>
              <input name="note" value={meal.note || ''} onChange={handleChange} className="w-full border rounded p-2 mt-1" />
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
            Supprimer le repas
          </button>
        </div>
      </div>
      <ConfirmModal
        open={confirmDeleteOpen}
        title="Supprimer ce repas ?"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer ce repas ?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
} 