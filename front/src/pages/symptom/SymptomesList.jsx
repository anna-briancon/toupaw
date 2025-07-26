import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { AlertCircle, ChartColumnDecreasing, ArrowLeft, Calendar, Camera, Plus, Edit, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import SymptomSection from './SymptomSection';
import ConfirmModal from '../../components/ConfirmModal';
import SymptomEdit from './SymptomEdit';

function groupSymptomsByDate(symptoms) {
  return symptoms.reduce((acc, s) => {
    const dateKey = s.date?.slice(0, 10);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(s);
    return acc;
  }, {});
}

function formatDateFR(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function AddSymptomFormModal({ petId, onSave, onCancel, initial }) {
  const [form, setForm] = useState(() => initial ? {
    ...initial,
    date: initial.date ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    time: initial.date ? new Date(initial.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  } : { description: '', intensity: '', date: new Date().toISOString().slice(0, 10), time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), location: '', photo_url: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Créer la date en heure locale et la convertir correctement
      const [hours, minutes] = form.time.split(':');
      const localDate = new Date(form.date);
      localDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (initial && initial.id) {
        await axios.put(`/symptoms/${initial.id}`, { ...form, date: localDate.toISOString(), time: undefined, pet_id: petId });
      } else {
        await axios.post('/symptoms', { ...form, date: localDate.toISOString(), time: undefined, pet_id: petId });
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };
  const [showDelete, setShowDelete] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-96 max-w-full space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
          <span className="text-base font-semibold">{initial ? 'Modifier' : 'Ajouter'} un symptôme</span>
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <input name="description" value={form.description} onChange={handleChange} className="w-full border rounded p-2 mt-1" required />
        </div>
        <div>
          <label className="text-sm font-medium">Intensité (optionnel)</label>
          <input name="intensity" value={form.intensity} onChange={handleChange} className="w-full border rounded p-2 mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} className="w-full border rounded p-2 mt-1" required />
          </div>
          <div>
            <label className="text-sm font-medium">Heure</label>
            <input name="time" type="time" value={form.time} onChange={handleChange} className="w-full border rounded p-2 mt-1" required />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Localisation (optionnel)</label>
          <input name="location" value={form.location} onChange={handleChange} className="w-full border rounded p-2 mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">URL photo (optionnel)</label>
          <input name="photo_url" value={form.photo_url} onChange={handleChange} className="w-full border rounded p-2 mt-1" />
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
          title="Supprimer ce symptôme ?"
          message="Cette action est irréversible. Voulez-vous vraiment supprimer ce symptôme ?"
          onConfirm={async () => {
            await axios.delete(`/symptoms/${initial.id}`);
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

export default function SymptomesList() {
  const [searchParams] = useSearchParams();
  const petId = searchParams.get('pet');
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [editSymptom, setEditSymptom] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    if (!petId) return;
    setLoading(true);
    axios.get(`/symptoms/${petId}`)
      .then(res => setSymptoms(res.data.sort((a, b) => new Date(b.date) - new Date(a.date))))
      .catch(() => setSymptoms([]))
      .finally(() => setLoading(false));
  }, [petId, showAdd, editSymptom]);

  const grouped = groupSymptomsByDate(symptoms);
  const todayStr = new Date().toISOString().slice(0, 10);

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };
  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    await axios.delete(`/symptoms/${confirmDeleteId}`);
    setConfirmDeleteId(null);
    setEditSymptom(null);
    setShowAdd(false);
    axios.get(`/symptoms/${petId}`)
      .then(res => setSymptoms(res.data.sort((a, b) => new Date(b.date) - new Date(a.date))))
      .catch(() => setSymptoms([]));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 p-3 sm:p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header harmonisé */}
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 mb-6 sm:mb-10 bg-gradient-to-r from-emerald-400/80 to-teal-400/80 rounded-xl sm:rounded-2xl shadow-lg px-3 sm:px-6 py-4 sm:py-8 border border-emerald-200 overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none select-none">
            <AlertCircle className="h-20 w-20 sm:h-32 sm:w-32 text-white" />
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mb-2 sm:mb-4 flex items-center gap-2 text-white hover:text-emerald-100 font-semibold px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-emerald-500/30 transition z-10 text-sm sm:text-base"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            Retour
          </button>
          <div className="flex items-center gap-2 sm:gap-3 z-10">
            <div className="p-2 sm:p-3 bg-white/30 rounded-lg sm:rounded-xl shadow">
              <AlertCircle className="h-6 w-6 sm:h-10 sm:w-10 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-ranille drop-shadow leading-tight">Historique des symptômes</h1>
              <p className="text-white/80 text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium">Gardez un œil sur la santé de votre animal</p>
            </div>
          </div>
        </div>
        {/* Stats harmonisées */}
        <div className="bg-white/80 border border-emerald-200 rounded-xl shadow p-3 sm:p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <ChartColumnDecreasing className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-700">Stats symptômes</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="bg-gradient-to-br from-emerald-200/80 to-teal-100 border-0 rounded-lg sm:rounded-2xl shadow p-2 sm:p-4 text-center flex flex-col items-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-emerald-700 mb-1 sm:mb-2">
                <AlertCircle className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-[10px] sm:text-xs font-semibold">Total symptômes</span>
              </div>
              <div className="text-base sm:text-2xl font-extrabold text-gray-900">{symptoms.length}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-200/80 to-amber-100 border-0 rounded-lg sm:rounded-2xl shadow p-2 sm:p-4 text-center flex flex-col items-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-orange-700 mb-1 sm:mb-2">
                <Calendar className="h-4 w-4 sm:h-6 sm:w-6" />
                <span className="text-[10px] sm:text-xs font-semibold">Dernier symptôme</span>
              </div>
              <div className="text-base sm:text-2xl font-extrabold text-gray-900">{symptoms[0]?.date ? formatDateFR(symptoms[0].date) : '-'}</div>
            </div>
          </div>
        </div>
        {/* Liste groupée par date modernisée */}
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl sm:rounded-2xl shadow-xl p-2 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-2 sm:mb-4">
            <span className="font-semibold text-base sm:text-base text-emerald-700">Historique détaillé</span>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow flex items-center gap-2 text-sm sm:text-base transition-transform hover:scale-105"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1" /> Ajouter
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-7 w-7 sm:h-10 sm:w-10 border-b-2 border-emerald-500"></div>
              <span className="ml-2 sm:ml-4 text-gray-600 text-base sm:text-base font-semibold">Chargement...</span>
            </div>
          ) : symptoms.length === 0 ? (
            <div className="text-center py-10 sm:py-16 flex flex-col items-center">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 font-bold text-base sm:text-xl mb-1">Aucun symptôme enregistré</p>
              <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">Ajoutez le premier symptôme de votre animal !</p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-1 sm:mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-semibold shadow hover:scale-105 transition-transform text-xs sm:text-base"
              >
                Ajouter un symptôme
              </button>
            </div>
          ) : (
            Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0])).map(([dateKey, items]) => (
              <div key={dateKey} className="mb-6">
                <div className="font-semibold text-base mb-2 text-emerald-700 flex items-center gap-3">
                  {formatDateFR(dateKey)}
                </div>
                <div className="space-y-3">
                  {items.map((s) => (
                    <div
                      key={s.id}
                      className="group border border-emerald-100 border-l-4 border-l-emerald-400 bg-white/90 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5 sm:hover:-translate-y-1 duration-200 px-2 sm:px-4 py-3 sm:py-4"
                      onClick={() => setEditSymptom(s)}
                    >
                      <div className="flex items-center gap-3 sm:gap-5">
                        <div className="flex-shrink-0 p-2 sm:p-3 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center transition-transform group-hover:scale-105">
                          <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-sm sm:text-sm text-gray-900 truncate">{s.description}</span>
                            {s.intensity && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded ml-2">{s.intensity}</span>}
                          </div>
                          <div className="flex items-center gap-1 text-xs sm:text-xs text-gray-500 mb-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateFR(s.date)} {new Date(s.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            {s.location && <span>({s.location})</span>}
                          </div>
                          {s.photo_url && (
                            <div className="mt-2 flex items-center gap-2">
                              <Camera className="h-4 w-4 text-gray-500" />
                              <a href={s.photo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Photo</a>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 items-end ml-2">
                          <button
                            onClick={e => { e.stopPropagation(); setEditSymptom(s); }}
                            className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded p-1 text-xs flex items-center transition"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(s.id); }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 text-xs flex items-center transition"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        {/* AJOUTER LES MODALES EN DEHORS DE LA CARTE BLANCHE */}
        {showAdd && (
          <AddSymptomFormModal petId={petId} onSave={() => setShowAdd(false)} onCancel={() => setShowAdd(false)} />
        )}
        <SymptomEdit
          open={!!editSymptom}
          id={editSymptom?.id}
          onSave={() => { setEditSymptom(null); reload(); }}
          onCancel={() => setEditSymptom(null)}
        />
      </div>
      <ConfirmModal
        open={!!confirmDeleteId}
        title="Supprimer ce symptôme ?"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer ce symptôme ?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
} 