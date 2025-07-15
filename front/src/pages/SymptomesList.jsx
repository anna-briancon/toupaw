import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import { AlertCircle, ArrowLeft, Calendar, Camera, Plus, Edit, Trash2, ChevronRight } from 'lucide-react';
import SymptomSection from '../components/SymptomSection';
import ConfirmModal from '../components/ConfirmModal';

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
    date: initial.date ? initial.date.slice(0,10) : new Date().toISOString().slice(0,10),
    time: initial.date ? new Date(initial.date).toISOString().slice(11,16) : '12:00',
  } : { description: '', intensity: '', date: new Date().toISOString().slice(0, 10), time: '12:00', location: '', photo_url: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const eventDate = new Date(`${form.date}T${form.time}`);
      if (initial && initial.id) {
        await axios.put(`/symptoms/${initial.id}`, { ...form, date: eventDate.toISOString(), time: undefined, pet_id: petId });
      } else {
        await axios.post('/symptoms', { ...form, date: eventDate.toISOString(), time: undefined, pet_id: petId });
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
          <span className="text-lg font-semibold">{initial ? 'Modifier' : 'Ajouter'} un symptôme</span>
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
    // Rafraîchir la liste
    axios.get(`/symptoms/${petId}`)
      .then(res => setSymptoms(res.data.sort((a, b) => new Date(b.date) - new Date(a.date))))
      .catch(() => setSymptoms([]));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 font-semibold flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-2 rounded transition text-base sm:text-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 whitespace-pre-line font-ranille">Historique des symptômes</h1>
          </div>
        </div>
        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <div className="bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-200 rounded-lg shadow p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-700 mb-1">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Total symptômes</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{symptoms.length}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-200 rounded-lg shadow p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-700 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium">Dernier symptôme</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{symptoms[0]?.date ? formatDateFR(symptoms[0].date) : '-'}</div>
          </div>
        </div>
        {/* Liste groupée par date */}
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow p-3 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center mb-4 gap-2">
            <span className="font-semibold text-lg">Historique détaillé</span>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-3 py-2 rounded-xl shadow flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 mr-2" /> Ajouter
            </button>
          </div>
          {showAdd && (
            <AddSymptomFormModal petId={petId} onSave={() => setShowAdd(false)} onCancel={() => setShowAdd(false)} />
          )}
          {/* Remplacer la modale d'édition par une navigation */}
          {editSymptom && navigate(`/suivi/symptome/${editSymptom.id}`)}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          ) : symptoms.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium text-lg">Aucun symptôme enregistré</p>
              <p className="text-sm text-gray-500 mt-2">Ajoutez le premier symptôme de votre animal !</p>
            </div>
          ) : (
            Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0])).map(([dateKey, items]) => (
              <div key={dateKey} className="mb-6">
                <div className="font-semibold text-lg mb-2 text-emerald-700 flex items-center gap-3">
                  {formatDateFR(dateKey)}
                </div>
                <div className="space-y-3">
                  {items.map((s) => (
                    <div
                      key={s.id}
                      className="border-l-4 border-l-emerald-500 bg-white rounded-xl shadow hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/suivi/symptome/${s.id}`)}
                    >
                      <div className="p-3 sm:p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-3 rounded-lg bg-pink-100 text-pink-700">
                            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 text-base sm:text-lg">{s.description}</span>
                              {s.intensity && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded ml-2">{s.intensity}</span>}
                            </div>
                            <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
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
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); setEditSymptom(s); }}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded px-2 py-1 text-xs sm:text-sm flex items-center gap-1"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(s.id); }}
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
            ))
          )}
        </div>
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