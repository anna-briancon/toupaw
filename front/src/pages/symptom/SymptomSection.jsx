import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { Plus, ChevronRight, AlertCircle, Calendar, Camera } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import { useNavigate } from 'react-router-dom';
import SymptomEdit from './SymptomEdit';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function AddSymptomForm({ petId, onSave, onCancel, initial }) {
  const [form, setForm] = useState(() => {
    if (initial) {
      const dateObj = new Date(initial.date);
      return {
        description: initial.description || '',
        intensity: initial.intensity || '',
        date: dateObj.toISOString().slice(0, 10),
        time: dateObj.toTimeString().slice(0, 5),
        location: initial.location || '',
        photo_url: initial.photo_url || '',
      };
    }
    return { description: '', intensity: '', date: new Date().toISOString().slice(0, 10), time: '12:00', location: '', photo_url: '' };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-96 max-w-full space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
          <span className="text-base font-semibold">Ajouter un symptôme</span>
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

export default function SymptomSection({ petId, onShowHistory }) {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editSymptom, setEditSymptom] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!petId) return;
    setLoading(true);
    axios.get(`/symptoms/${petId}`)
      .then(res => {
        const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setSymptoms(sorted);
      })
      .catch(() => setSymptoms([]))
      .finally(() => setLoading(false));
  }, [petId, showAdd]);

  const lastSymptom = symptoms[0];

  return (
    <div className="max-w-4xl mx-auto mb-4">
      <section className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-ranille">Symptômes</h2>
          </div>
          <button
            onClick={onShowHistory}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 font-semibold flex items-center gap-1 px-3 py-2 rounded transition"
          >
            Historique
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 mb-6">
          {loading && <LoadingSpinner overlay />}
          {lastSymptom ? (
            <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow p-6 flex items-center justify-between cursor-pointer hover:shadow-md"
              onClick={() => setEditSymptom(lastSymptom)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-pink-100 text-pink-700">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{lastSymptom.description}</span>
                    {lastSymptom.intensity && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded ml-2">{lastSymptom.intensity}</span>}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(lastSymptom.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    <span>{new Date(lastSymptom.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                    {lastSymptom.location && <span>({lastSymptom.location})</span>}
                  </div>
                  {lastSymptom.photo_url && (
                    <div className="mt-2 flex items-center gap-2">
                      <Camera className="h-4 w-4 text-gray-500" />
                      <a href={lastSymptom.photo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Photo</a>
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-emerald-500" />
            </div>
          ) : (
            <div className="border-dashed border-2 border-gray-300 rounded-xl flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">Aucun symptôme enregistré</p>
              <p className="text-sm text-gray-500 mt-1">Ajoutez le premier symptôme de votre animal</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="mr-2 h-5 w-5" />
          Ajouter un symptôme
        </button>
        {showAdd && (
          <AddSymptomForm petId={petId} onSave={() => setShowAdd(false)} onCancel={() => setShowAdd(false)} />
        )}
        <SymptomEdit
          open={!!editSymptom}
          id={editSymptom?.id}
          onSave={() => {
            setEditSymptom(null);
            if (petId) {
              setLoading(true);
              axios.get(`/symptoms/${petId}`)
                .then(res => {
                  const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                  setSymptoms(sorted);
                })
                .catch(() => setSymptoms([]))
                .finally(() => setLoading(false));
            }
          }}
          onCancel={() => setEditSymptom(null)}
        />
      </section>
    </div>
  );
} 