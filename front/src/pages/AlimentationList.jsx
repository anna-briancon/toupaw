import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import { Plus, Edit, Trash2, Utensils, ArrowLeft, BarChart3, Calendar, GlassWater, ChevronRight } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

function usePetId() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  return params.get('pet');
}

function EditMealForm({ petId, initial, onSave, onCancel }) {
  const [foodType, setFoodType] = useState(initial?.food_type || '');
  const [quantity, setQuantity] = useState(initial?.quantity?.toString() || '');
  const [unit, setUnit] = useState(initial?.unit || 'g');
  const [datetime, setDatetime] = useState(initial?.datetime ? new Date(initial.datetime).toISOString().slice(0,16) : new Date().toISOString().slice(0,16));
  const [note, setNote] = useState(initial?.note || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (initial?.id) {
        await axios.put(`/meals/${initial.id}`, {
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
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xs sm:max-w-md space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <Utensils className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold">{initial ? 'Modifier' : 'Ajouter'} un repas</span>
        </div>
        <div>
          <label className="text-sm font-medium">Type d'aliment</label>
          <input type="text" value={foodType} onChange={e => setFoodType(e.target.value)} className="w-full border rounded p-2 mt-1" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Quantité</label>
            <input type="number" min="0" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border rounded p-2 mt-1" required />
          </div>
          <div>
            <label className="text-sm font-medium">Unité</label>
            <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full border rounded p-2 mt-1">
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Date et heure</label>
          <input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} className="w-full border rounded p-2 mt-1" required />
        </div>
        <div>
          <label className="text-sm font-medium">Note</label>
          <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full border rounded p-2 mt-1" />
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
        {initial?.id && (
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="w-full mt-4 bg-red-100 text-red-700 font-semibold py-2 rounded-xl border border-red-200 hover:bg-red-200 transition"
          >
            Supprimer
          </button>
        )}
      </form>
      {showDelete && (
        <ConfirmModal
          open={showDelete}
          title="Supprimer ce repas ?"
          message="Cette action est irréversible. Voulez-vous vraiment supprimer ce repas ?"
          onConfirm={async () => {
            await axios.delete(`/meals/${initial.id}`);
            setShowDelete(false);
            onCancel();
            if (onSave) onSave();
          }}
          onCancel={() => setShowDelete(false)}
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      )}
    </div>
  );
}

function AddDrinkForm({ petId, onSave, onCancel }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const promises = [];
      for (let i = 0; i < count; i++) {
        promises.push(
          axios.post('/daily-events', {
            pet_id: petId,
            type: 'drink',
            datetime: new Date(date + 'T12:00').toISOString(),
          })
        );
      }
      await Promise.all(promises);
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xs sm:max-w-md space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
            <GlassWater className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold">Ajouter consommation d'eau</span>
        </div>
        <div>
          <label className="text-sm font-medium">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border rounded p-2 mt-1" required />
        </div>
        <div>
          <label className="text-sm font-medium">Nombre de verres</label>
          <input type="number" min="1" max="20" value={count} onChange={e => setCount(Number(e.target.value))} className="w-full border rounded p-2 mt-1" required />
        </div>
        {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-2 rounded-xl shadow hover:from-blue-600 hover:to-cyan-600 transition">
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

export default function AlimentationList() {
  const navigate = useNavigate();
  const petId = usePetId();
  const [meals, setMeals] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMeal, setEditMeal] = useState(null);
  const [showAddDrink, setShowAddDrink] = useState(false);
  // Ajout de l'état pour la date sélectionnée (par défaut aujourd'hui)
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const reload = () => {
    if (!petId) return;
    setLoading(true);
    Promise.all([
      axios.get(`/meals/${petId}`),
      axios.get(`/daily-events/${petId}`)
    ])
      .then(([mealsRes, dailyRes]) => {
        setMeals(mealsRes.data.sort((a, b) => new Date(b.datetime) - new Date(a.datetime)));
        setDrinks(dailyRes.data.filter(e => e.type === 'drink'));
      })
      .catch(() => {
        setMeals([]);
        setDrinks([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line
  }, [petId]);

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };
  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    await axios.delete(`/meals/${confirmDeleteId}`);
    setConfirmDeleteId(null);
    reload();
  };

  // Calculs statistiques
  const totalMeals = meals.length;
  const totalQuantity = meals.reduce((sum, meal) => {
    // Convertir tout en grammes pour le calcul
    let quantityInGrams = meal.quantity;
    if (meal.unit === "kg") quantityInGrams *= 1000;
    else if (meal.unit === "l") quantityInGrams *= 1000; // approximation
    else if (meal.unit === "ml") quantityInGrams *= 1; // approximation
    return sum + quantityInGrams;
  }, 0);

  const averageQuantity = totalMeals > 0 ? totalQuantity / totalMeals : 0;

  // Stats du jour sélectionné
  const mealsOfDay = meals.filter(meal => new Date(meal.datetime).toISOString().slice(0, 10) === selectedDate);
  const drinksOfDay = drinks.filter(drink => new Date(drink.datetime).toISOString().slice(0, 10) === selectedDate);
  const totalMealsOfDay = mealsOfDay.length;
  const totalQuantityOfDay = mealsOfDay.reduce((sum, meal) => {
    let quantityInGrams = meal.quantity;
    if (meal.unit === "kg") quantityInGrams *= 1000;
    else if (meal.unit === "l") quantityInGrams *= 1000;
    else if (meal.unit === "ml") quantityInGrams *= 1;
    return sum + quantityInGrams;
  }, 0);
  const averageQuantityOfDay = totalMealsOfDay > 0 ? totalQuantityOfDay / totalMealsOfDay : 0;
  const totalDrinksOfDay = drinksOfDay.length;
  // Nouvelle stat : moyenne sur tous les repas
  const averageQuantityAll = totalMeals > 0 ? totalQuantity / totalMeals : 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return diffMinutes < 1 ? "À l'instant" : `Il y a ${diffMinutes}min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h • ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays === 1) {
      return `Hier • ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays <= 7) {
      return `Il y a ${diffDays} jours • ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // Ajoute une fonction utilitaire pour grouper les repas par date
  function groupMealsByDate(meals) {
    return meals.reduce((groups, meal) => {
      const date = new Date(meal.datetime);
      // Format YYYY-MM-DD
      const dateKey = date.toISOString().slice(0, 10);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(meal);
      return groups;
    }, {});
  }

  // Grouper les drinks par date
  function groupDrinksByDate(drinks) {
    return drinks.reduce((groups, drink) => {
      const date = new Date(drink.datetime);
      const dateKey = date.toISOString().slice(0, 10);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(drink);
      return groups;
    }, {});
  }

  // Fonction pour obtenir le label de la date
  function getDateLabel(dateKey) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const [year, month, day] = dateKey.split('-');
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    ) {
      return "Aujourd'hui";
    } else if (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    ) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 font-semibold flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-2 rounded transition text-base sm:text-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 whitespace-pre-line font-ranille">Historique des repas</h1>
          </div>
          {/* Sélecteur de date aligné à droite */}
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
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
          <div className="flex-1 min-w-[110px] bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-700 mb-1">
              <Utensils className="h-4 w-4" />
              <span className="text-xs font-medium">Repas du jour</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{totalMealsOfDay}</div>
          </div>
          <div className="flex-1 min-w-[110px] bg-gradient-to-br from-violet-100 to-violet-50 border border-violet-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-violet-700 mb-1">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-medium">Quantité du jour</span>
            </div>
            <div className="text-lg font-bold text-violet-800">{totalQuantityOfDay.toFixed(0)} g</div>
          </div>
          <div className="flex-1 min-w-[110px] bg-gradient-to-br from-blue-100 to-cyan-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-700 mb-1">
              <GlassWater className="h-6 w-6" />
              <span className="text-xs font-medium">Verres du jour</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{totalDrinksOfDay}</div>
          </div>
          <div className="flex-1 min-w-[110px] bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-700 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium">Moyenne/repas</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{averageQuantityAll.toFixed(0)} g</div>
          </div>
        </div>

        {/* Liste des repas */}
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow p-3 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex justify-end mb-4 gap-2">
            <button
              onClick={() => setEditMeal({})}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-3 py-2 rounded-xl shadow flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </button>
            <button
              onClick={() => setShowAddDrink(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-3 py-2 rounded-xl shadow flex items-center gap-2 text-sm sm:text-base"
            >
              <GlassWater className="h-4 w-4 mr-2" />
              Ajouter un verre
            </button>
          </div>
          {/* Grouper les repas par date et afficher chaque groupe */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          ) : meals.length === 0 && drinks.length === 0 ? (
            <div className="text-center py-12">
              <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium text-lg">Aucun repas ou verre enregistré</p>
              <p className="text-sm text-gray-500 mt-2">Ajoutez le premier repas ou verre de votre animal !</p>
            </div>
          ) : (
            // Grouper les repas et drinks par date et afficher chaque groupe
            Object.entries(groupMealsByDate(meals)).concat(
              Object.entries(groupDrinksByDate(drinks)).filter(([dateKey]) => !meals.some(m => new Date(m.datetime).toISOString().slice(0,10) === dateKey))
            )
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([dateKey, items]) => {
              const mealsForDate = groupMealsByDate(meals)[dateKey] || [];
              const drinksForDate = groupDrinksByDate(drinks)[dateKey] || [];
              return (
                <div key={dateKey} className="mb-6">
                  <div className="font-semibold text-lg mb-2 text-emerald-700 flex items-center gap-3">
                    {getDateLabel(dateKey)}
                    {drinksForDate.length > 0 && (
                      <span className="flex items-center gap-1 text-blue-600 text-base ml-2">
                        <GlassWater className="h-5 w-5" />
                        {drinksForDate.length} verre{drinksForDate.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {/* Ajout : total g du jour */}
                    {mealsForDate.length > 0 && (
                      <span className="flex items-center gap-1 text-violet-700 text-base ml-2">
                        <BarChart3 className="h-5 w-5" />
                        {mealsForDate.reduce((sum, meal) => {
                          let q = meal.quantity;
                          if (meal.unit === 'kg') q *= 1000;
                          else if (meal.unit === 'l') q *= 1000;
                          else if (meal.unit === 'ml') q *= 1;
                          return sum + q;
                        }, 0)} g
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {mealsForDate.map((meal) => (
                      <div
                        key={meal.id}
                        className="border-l-4 border-l-emerald-500 bg-white rounded-xl shadow hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/suivi/repas/${meal.id}`)}
                      >
                        <div className="p-3 sm:p-6 flex items-center justify-between">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 rounded-lg bg-orange-100 text-orange-700">
                              <Utensils className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">{meal.food_type}</span>
                                <span className="text-lg">🍽️</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                <Calendar className="h-3 w-3" />
                                {meal.quantity} {meal.unit} • {formatDate(meal.datetime)}
                              </div>
                              {meal.note && <p className="text-sm mt-2 text-gray-500">{meal.note}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={e => { e.stopPropagation(); setEditMeal(meal); }}
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded px-2 py-1 text-xs sm:text-sm flex items-center gap-1"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); handleDelete(meal.id); }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded px-2 py-1 text-xs sm:text-sm flex items-center gap-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <ChevronRight className="h-5 w-5 text-emerald-400 ml-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Modale d'édition/ajout repas */}
        {editMeal && navigate(`/suivi/repas/${editMeal.id}`)}
        {/* Modale d'ajout de verre */}
        {showAddDrink && (
          <AddDrinkForm
            petId={petId}
            onSave={() => { setShowAddDrink(false); reload(); }}
            onCancel={() => setShowAddDrink(false)}
          />
        )}
        <ConfirmModal
          open={!!confirmDeleteId}
          title="Supprimer ce repas ?"
          message="Cette action est irréversible. Voulez-vous vraiment supprimer ce repas ?"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      </div>
    </div>
  );
} 