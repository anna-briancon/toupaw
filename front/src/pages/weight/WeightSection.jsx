import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { Weight, Plus, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function AddWeightForm({ petId, onSave, onCancel }) {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('12:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrors([]);
    try {
      const eventDate = new Date(`${date}T${time}`);
      await axios.post('/weights', {
        pet_id: petId,
        value: parseFloat(weight),
        date: eventDate.toISOString(),
      });
      onSave();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-96 max-w-full space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <Weight className="h-5 w-5 text-white" />
          </div>
          <span className="text-base font-semibold">Ajouter un poids</span>
        </div>
        <div>
          <label className="text-sm font-medium">Poids (kg)</label>
          <input type="number" min="0" step="0.01" value={weight} onChange={e => setWeight(e.target.value)} className="w-full border rounded p-2 mt-1" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border rounded p-2 mt-1" required />
          </div>
          <div>
            <label className="text-sm font-medium">Heure</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full border rounded p-2 mt-1" required />
          </div>
        </div>
        {errors.length > 0 && <div className="text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-200 mb-2"><ul className="list-disc pl-5">{errors.map((errMsg, i) => <li key={i}>{errMsg}</li>)}</ul></div>}
        {error && <div className="text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-2 rounded-xl shadow hover:from-emerald-600 hover:to-teal-600 transition">
            {loading ? "Enregistrement..." : "Ajouter"}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-xl border border-gray-300 hover:bg-gray-200 transition">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PoidsSection({ petId, onShowHistory }) {
  const [weights, setWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!petId) return;
    setLoading(true);
    axios.get(`/weights/${petId}`)
      .then(res => {
        // Trier par date décroissante
        const poidsEvents = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setWeights(poidsEvents);
      })
      .catch(() => setWeights([]))
      .finally(() => setLoading(false));
  }, [petId, showAdd]);

  const lastWeight = weights[0];

  return (
    <div className="max-w-4xl mx-auto mb-4">
      <section className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <Weight className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-ranille">Poids</h2>
          </div>
          <button
            onClick={onShowHistory}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 font-semibold flex items-center gap-1 px-3 py-2 rounded transition text-sm"
          >
            Historique
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          ) : lastWeight ? (
            <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
                    <Weight className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">{lastWeight.value} kg</span>
                      {/* Tendance */}
                      {weights[1] && (() => {
                        const diff = lastWeight.value - weights[1].value;
                        if (Math.abs(diff) < 0.1) {
                          return (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              <Minus className="h-3 w-3" />
                              Stable
                            </span>
                          );
                        }
                        if (diff > 0) {
                          return (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              <TrendingUp className="h-3 w-3" />
                              +{diff.toFixed(1)} kg
                            </span>
                          );
                        }
                        return (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <TrendingDown className="h-3 w-3" />
                            -{Math.abs(diff).toFixed(1)} kg
                          </span>
                        );
                      })()}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(lastWeight.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à {new Date(lastWeight.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
              {/* Mini graphique */}
              {weights.length > 1 && (
                <div className="mt-4">
                  <div className="text-xs text-gray-600 mb-2">Évolution récente</div>
                  <svg viewBox="0 0 230 40" width="100%" height="80" className="bg-emerald-50 rounded-lg">
                    {/* Grille de fond */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d1fae5" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="200" height="60" fill="url(#grid)" />
                    {/* Courbe */}
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={
                        (() => {
                          const chartWeights = weights.slice(0, 8).reverse();
                          const min = Math.min(...chartWeights.map(w => parseFloat(w.value)));
                          const max = Math.max(...chartWeights.map(w => parseFloat(w.value)));
                          const range = max - min || 1;
                          return chartWeights.map((w, i) => {
                            const x = (i / (chartWeights.length - 1 || 1)) * 190 + 5;
                            const y = 50 - ((parseFloat(w.value) - min) / range) * 40;
                            return `${x},${y}`;
                          }).join(' ');
                        })()
                      }
                    />
                    {/* Points */}
                    {weights.slice(0, 8).reverse().map((w, i, arr) => {
                      const min = Math.min(...arr.map(e => parseFloat(e.value)));
                      const max = Math.max(...arr.map(e => parseFloat(e.value)));
                      const range = max - min || 1;
                      const x = (i / (arr.length - 1 || 1)) * 190 + 5;
                      const y = 50 - ((parseFloat(w.value) - min) / range) * 40;
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="4" fill="#10b981" stroke="#fff" strokeWidth="2" />
                          {i === arr.length - 1 && (
                            <text x={x} y={y - 8} textAnchor="middle" className="text-xs fill-emerald-700 font-medium">
                              {w.value}kg
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>
          ) : (
            <div className="border-dashed border-2 border-gray-300 rounded-xl flex flex-col items-center justify-center py-8 text-center">
              <Weight className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">Aucune donnée de poids</p>
              <p className="text-sm text-gray-500 mt-1">Ajoutez le premier poids de votre animal</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="mr-2 h-5 w-5" />
          Ajouter un poids
        </button>
        {showAdd && (
          <AddWeightForm petId={petId} onSave={() => setShowAdd(false)} onCancel={() => setShowAdd(false)} />
        )}
      </section>
    </div>
  );
} 