import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import {
  UtensilsCrossed, Plus, ChevronRight, GlassWater, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AddMealForm({ petId, onSave, onCancel, initial }) {
  const [foodType, setFoodType] = useState(initial?.food_type || '');
  const [quantity, setQuantity] = useState(initial?.quantity || '');
  const [unit, setUnit] = useState(initial?.unit || 'g');
  const [datetime, setDatetime] = useState(initial ? new Date(initial.datetime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
  const [note, setNote] = useState(initial?.note || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (initial && initial.id) {
        await axios.put(`/meals/${initial.id}`, {
          pet_id: petId,
          food_type: foodType,
          quantity: parseFloat(quantity),
          unit,
          datetime: new Date(datetime).toISOString(),
          note: note.trim() || undefined,
        });
      } else {
        await axios.post('/meals', {
          pet_id: petId,
          food_type: foodType,
          quantity: parseFloat(quantity),
          unit,
          datetime: new Date(datetime).toISOString(),
          note: note.trim() || undefined,
        });
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-96 max-w-full space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold">Ajouter un repas</span>
        </div>
        <div>
          <label className="text-sm font-medium">Type d'aliment</label>
          <input type="text" value={foodType} onChange={e => setFoodType(e.target.value)} className="w-full border rounded p-2 mt-1" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Quantité</label>
            <input type="number" min="0" step="0.1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border rounded p-2 mt-1" required />
          </div>
          <div>
            <label className="text-sm font-medium">Unité</label>
            <input type="text" value={unit} onChange={e => setUnit(e.target.value)} className="w-full border rounded p-2 mt-1" required />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Date et heure</label>
          <input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} className="w-full border rounded p-2 mt-1" required />
        </div>
        <div>
          <label className="text-sm font-medium">Note (optionnel)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full border rounded p-2 mt-1" rows={2} />
        </div>
        {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-2 rounded-xl shadow hover:from-emerald-600 hover:to-teal-600 transition">
            {loading ? 'Enregistrement...' : 'Ajouter'}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-xl border border-gray-300 hover:bg-gray-200 transition">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AlimentationSection({ petId, onShowHistory, onAddDrink, onRemoveDrink }) {
  const [meals, setMeals] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editMeal, setEditMeal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!petId) return;
    setLoading(true);
    Promise.all([
      axios.get(`/meals/${petId}`),
      axios.get(`/daily-events/${petId}`)
    ]).then(([mealsRes, dailyRes]) => {
      setMeals(mealsRes.data.sort((a, b) => new Date(b.datetime) - new Date(a.datetime)));
      const today = new Date();
      const drinksToday = dailyRes.data.filter(e => e.type === 'drink' && new Date(e.datetime).toDateString() === today.toDateString());
      setDrinks(drinksToday);
    }).catch(() => {
      setMeals([]);
      setDrinks([]);
    }).finally(() => setLoading(false));
  }, [petId, showAdd, editMeal]);

  const handleAddDrink = async () => {
    if (!petId) return;
    await axios.post('/daily-events', {
      pet_id: petId,
      type: 'drink',
      datetime: new Date().toISOString(),
    });
    // Refresh drinks
    const dailyRes = await axios.get(`/daily-events/${petId}`);
    const today = new Date();
    const drinksToday = dailyRes.data.filter(e => e.type === 'drink' && new Date(e.datetime).toDateString() === today.toDateString());
    setDrinks(drinksToday);
    if (onAddDrink) onAddDrink();
  };
  const handleRemoveDrink = async () => {
    if (!petId || drinks.length === 0) return;
    await axios.delete(`/daily-events/${drinks[drinks.length - 1].id}`);
    // Refresh drinks
    const dailyRes = await axios.get(`/daily-events/${petId}`);
    const today = new Date();
    const drinksToday = dailyRes.data.filter(e => e.type === 'drink' && new Date(e.datetime).toDateString() === today.toDateString());
    setDrinks(drinksToday);
    if (onRemoveDrink) onRemoveDrink();
  };

  const formatTime = (datetimeString) => {
    const date = new Date(datetimeString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' });
  };

  const lastMeal = meals.length > 0 ? meals[0] : null;

  return (
    <div className="max-w-4xl mx-auto mb-4">
      <section className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <UtensilsCrossed className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-ranille">Alimentation</h2>
          </div>
          <button
            onClick={onShowHistory}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 font-semibold flex items-center gap-1 px-3 py-2 rounded transition"
          >
            Historique
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        {/* Compteur de boissons */}
        <div className="mb-6 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow p-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <GlassWater className="h-6 w-6 text-blue-500" />
              <span className="font-bold text-gray-900 text-xl">{drinks.length}</span>
              <span className="text-sm text-gray-600">verre{drinks.length > 1 ? "s" : ""} aujourd'hui</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddDrink}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl"
              >
                +
              </button>
              <button
                onClick={handleRemoveDrink}
                disabled={drinks.length === 0}
                className="border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-full w-8 h-8 flex items-center justify-center text-xl bg-transparent"
              >
                -
              </button>
            </div>
          </div>
        </div>

        {/* Dernier repas */}
        <div className="space-y-4 mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          ) : lastMeal ? (
            <div
              className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow p-6 flex items-center justify-between cursor-pointer hover:shadow-md"
              onClick={() => navigate(`/suivi/repas/${lastMeal.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-100 text-orange-700">
                  <UtensilsCrossed className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{lastMeal.food_type}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(lastMeal.datetime).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} {formatTime(lastMeal.datetime)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {lastMeal.quantity} {lastMeal.unit}
                  </div>
                  {lastMeal.note && <p className="text-sm text-gray-500 mt-1">{lastMeal.note}</p>}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-emerald-500" />
            </div>
          ) : (
            <div className="border-dashed border-2 border-gray-300 rounded-xl flex flex-col items-center justify-center py-8 text-center">
              <UtensilsCrossed className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">Aucun repas enregistré</p>
              <p className="text-sm text-gray-500 mt-1">Ajoutez le premier repas de votre animal</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="mr-2 h-5 w-5" />
          Ajouter un repas
        </button>

        {showAdd && (
          <AddMealForm petId={petId} onSave={() => setShowAdd(false)} onCancel={() => setShowAdd(false)} />
        )}
        {editMeal && (
          <AddMealForm petId={petId} onSave={() => setEditMeal(null)} onCancel={() => setEditMeal(null)} initial={editMeal} />
        )}
      </section>
    </div>
  );
} 