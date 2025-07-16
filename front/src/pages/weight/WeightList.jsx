import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { Weight, Plus, Edit, Trash2, ArrowLeft, TrendingUp, TrendingDown, Minus, ChevronLeft } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

function usePetId() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  return params.get('pet');
}

function EditWeightForm({ petId, initial, onSave, onCancel }) {
  const [value, setValue] = useState(initial?.value?.toString() || '');
  const [date, setDate] = useState(initial?.date ? new Date(initial.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(initial?.date ? new Date(initial.date).toISOString().slice(11, 16) : '12:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const eventDate = new Date(`${date}T${time}`);
      if (initial?.id) {
        await axios.put(`/weights/${initial.id}`, {
          value: parseFloat(value),
          date: eventDate.toISOString(),
        });
      } else {
        await axios.post('/weights', {
          pet_id: petId,
          value: parseFloat(value),
          date: eventDate.toISOString(),
        });
      }
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
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <Weight className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold">{initial ? 'Modifier' : 'Ajouter'} un poids</span>
        </div>
        <div>
          <label className="text-sm font-medium">Poids (kg)</label>
          <input type="number" min="0" step="0.01" value={value} onChange={e => setValue(e.target.value)} className="w-full border rounded p-2 mt-1" required />
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
          title="Supprimer ce poids ?"
          message="Cette action est irréversible. Voulez-vous vraiment supprimer cette entrée de poids ?"
          onConfirm={async () => {
            await axios.delete(`/weights/${initial.id}`);
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

export default function PoidsList() {
  const navigate = useNavigate();
  const petId = usePetId();
  const [weights, setWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editWeight, setEditWeight] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const reload = () => {
    if (!petId) return;
    setLoading(true);
    axios.get(`/weights/${petId}`)
      .then(res => setWeights(res.data.sort((a, b) => new Date(b.date) - new Date(a.date))))
      .catch(() => setWeights([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line
  }, [petId]);

  const handleDelete = async (id) => {
    setConfirmDeleteId(id);
  };
  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    await axios.delete(`/weights/${confirmDeleteId}`);
    setConfirmDeleteId(null);
    reload();
  };

  return (
    <div className="min-h-screen p-6 sm:p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-semibold px-3 py-2 rounded-lg hover:bg-emerald-50 transition"
        >
          <ChevronLeft className="h-5 w-5" />
          Retour
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <Weight className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 whitespace-pre-line font-ranille">Historique des poids</h1>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
              <Weight className="h-4 w-4" />
              <span className="text-xs font-medium">Poids actuel</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{weights[0]?.value?.toFixed(1) || "--"} kg</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3v18h18"></path></svg>
              <span className="text-xs font-medium">Moyenne</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {weights.length > 0 ? (weights.reduce((sum, w) => sum + w.value, 0) / weights.length).toFixed(1) : "--"} kg
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Maximum</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {weights.length > 0 ? Math.max(...weights.map(w => w.value)).toFixed(1) : "--"} kg
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs font-medium">Minimum</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {weights.length > 0 ? Math.min(...weights.map(w => w.value)).toFixed(1) : "--"} kg
            </div>
          </div>
        </div>

        {/* Graphique complet */}
        {weights.length > 1 && (
          <div className="mb-8 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3v18h18"></path></svg>
                <span className="font-semibold">Évolution du poids</span>
                {/* Tendance globale */}
                {(() => {
                  const totalChange = weights[0].value - weights[weights.length - 1].value;
                  if (Math.abs(totalChange) < 0.1) {
                    return (
                      <span className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                        <Minus className="h-3 w-3" />
                        Stable
                      </span>
                    );
                  }
                  if (totalChange > 0) {
                    return (
                      <span className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                        <TrendingUp className="h-3 w-3" />
                        +{totalChange.toFixed(1)} kg
                      </span>
                    );
                  }
                  return (
                    <span className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      <TrendingDown className="h-3 w-3" />
                      {totalChange.toFixed(1)} kg
                    </span>
                  );
                })()}
              </div>
              <svg viewBox="0 0 400 160" width="100%" height="160" className="bg-emerald-50 rounded-lg">
                {/* Grille de fond */}
                <defs>
                  <pattern id="fullGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d1fae5" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="400" height="160" fill="url(#fullGrid)" />
                {/* Ligne de moyenne */}
                {weights.length > 0 && (
                  <line
                    x1="10"
                    y1={(() => {
                      const min = Math.min(...weights.map(w => w.value));
                      const max = Math.max(...weights.map(w => w.value));
                      const avg = weights.reduce((sum, w) => sum + w.value, 0) / weights.length;
                      return 140 - ((avg - min) / (max - min || 1)) * 120;
                    })()}
                    x2="390"
                    y2={(() => {
                      const min = Math.min(...weights.map(w => w.value));
                      const max = Math.max(...weights.map(w => w.value));
                      const avg = weights.reduce((sum, w) => sum + w.value, 0) / weights.length;
                      return 140 - ((avg - min) / (max - min || 1)) * 120;
                    })()}
                    stroke="#6b7280"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.5"
                  />
                )}
                {/* Courbe */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={
                    (() => {
                      const chartWeights = weights.slice().reverse();
                      const min = Math.min(...chartWeights.map(w => w.value));
                      const max = Math.max(...chartWeights.map(w => w.value));
                      const range = max - min || 1;
                      return chartWeights.map((w, i) => {
                        const x = (i / (chartWeights.length - 1 || 1)) * 380 + 10;
                        const y = 140 - ((w.value - min) / range) * 120;
                        return `${x},${y}`;
                      }).join(' ');
                    })()
                  }
                />
                {/* Points */}
                {weights.slice().reverse().map((w, i, arr) => {
                  const min = Math.min(...arr.map(e => e.value));
                  const max = Math.max(...arr.map(e => e.value));
                  const range = max - min || 1;
                  const x = (i / (arr.length - 1 || 1)) * 380 + 10;
                  const y = 140 - ((w.value - min) / range) * 120;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="4" fill="#10b981" stroke="#fff" strokeWidth="2" />
                      {(i === 0 || i === arr.length - 1) && (
                        <text x={x} y={y - 8} textAnchor="middle" className="text-xs fill-emerald-700 font-medium">
                          {w.value}kg
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Liste détaillée */}
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow p-3 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-lg">Historique détaillé</span>
            <button
              onClick={() => setEditWeight({})}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-3 py-2 rounded-xl shadow flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          ) : weights.length === 0 ? (
            <div className="text-center py-12">
              <Weight className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium text-lg">Aucune donnée de poids</p>
              <p className="text-sm text-gray-500 mt-2">Ajoutez le premier poids de votre animal !</p>
            </div>
          ) : (
            weights.map((weight, index) => {
              // Tendance par rapport au précédent
              let trend = null;
              if (index < weights.length - 1) {
                const diff = weight.value - weights[index + 1].value;
                if (Math.abs(diff) < 0.1) {
                  trend = (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      <Minus className="h-3 w-3" />
                      Stable
                    </span>
                  );
                } else if (diff > 0) {
                  trend = (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                      <TrendingUp className="h-3 w-3" />
                      +{diff.toFixed(1)} kg
                    </span>
                  );
                } else {
                  trend = (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      <TrendingDown className="h-3 w-3" />
                      {diff.toFixed(1)} kg
                    </span>
                  );
                }
              }
              return (
                <div
                  key={weight.id}
                  className="border-l-4 border-l-emerald-500 bg-white rounded-xl shadow hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setEditWeight(weight)}
                >
                  <div className="p-3 sm:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 rounded-lg bg-teal-100 text-teal-700">
                        <Weight className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900 text-lg sm:text-xl">{weight.value} kg</span>
                          {trend}
                        </div>
                        <div className="flex items-center gap-1 text-sm mt-1 text-gray-600">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3M16 7V3M3 11h18M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"></path></svg>
                          {(() => {
                            const date = new Date(weight.date);
                            const now = new Date();
                            const diffTime = now.getTime() - date.getTime();
                            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays === 0) {
                              return `Aujourd'hui • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
                            } else if (diffDays === 1) {
                              return `Hier • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
                            } else if (diffDays <= 7) {
                              return `Il y a ${diffDays} jours • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
                            } else {
                              return date.toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              });
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); setEditWeight(weight); }}
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded px-2 py-1 text-xs sm:text-sm flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(weight.id); }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded px-2 py-1 text-xs sm:text-sm flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modale d'édition/ajout */}
        {editWeight && (
          <EditWeightForm
            petId={petId}
            initial={editWeight.id ? editWeight : undefined}
            onSave={() => {
              setEditWeight(null);
              reload();
            }}
            onCancel={() => setEditWeight(null)}
          />
        )}
        <ConfirmModal
          open={!!confirmDeleteId}
          title="Supprimer ce poids ?"
          message="Cette action est irréversible. Voulez-vous vraiment supprimer cette entrée de poids ?"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      </div>
    </div>
  );
} 