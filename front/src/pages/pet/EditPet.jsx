import { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { PawPrint } from 'lucide-react';

export default function EditPetModal({ open, onClose, petId, onSuccess }) {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [photo_url, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [gender, setGender] = useState('male');

  useEffect(() => {
    if (!open || !petId) return;
    async function fetchPet() {
      setFetching(true);
      try {
        const res = await axios.get(`/pets/${petId}`);
        setName(res.data.name || '');
        setBirthdate(res.data.birthdate || '');
        setSpecies(res.data.species || 'dog');
        setBreed(res.data.breed || '');
        setPhotoUrl(res.data.photo_url || '');
        setGender(res.data.gender || 'male');
        setPhotoFile(null);
        setPhotoPreview(null);
      } catch (e) {
        setError("Erreur lors du chargement de l'animal");
      } finally {
        setFetching(false);
      }
    }
    fetchPet();
  }, [open, petId]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('birthdate', birthdate);
      formData.append('species', species);
      formData.append('breed', breed);
      formData.append('gender', gender);
      if (photoFile) {
        formData.append('photo', photoFile);
      } else if (photo_url) {
        formData.append('photo_url', photo_url);
      }
      await axios.put(`/pets/${petId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  if (fetching) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <svg className="animate-spin h-12 w-12 text-emerald-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-96 max-w-full space-y-4 relative">
        <button type="button" onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <PawPrint className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-ranille text-2xl sm:text-3xl font-bold text-gray-900">Modifier mon animal</h2>
        </div>
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200 mb-2">{error}</div>
        )}
        <div>
          <label className="text-sm font-medium">Nom</label>
          <input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Date de naissance</label>
          <input
            type="date"
            value={birthdate}
            onChange={e => setBirthdate(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Espèce</label>
          <select
            value={species}
            onChange={e => setSpecies(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          >
            <option value="dog">Chien</option>
            <option value="cat">Chat</option>
            <option value="other">Autre</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Sexe</label>
          <select
            value={gender}
            onChange={e => setGender(e.target.value)}
            className="w-full border rounded p-2 mt-1"
          >
            <option value="male">Mâle</option>
            <option value="female">Femelle</option>
            <option value="other">Autre</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Race</label>
          <input
            type="text"
            placeholder="Race"
            value={breed}
            onChange={e => setBreed(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full border rounded p-2 mt-1"
          />
          {(photoPreview || photo_url) && (
            <img src={photoPreview || (photo_url && photo_url.startsWith('/uploads') ? `${window.location.origin}${photo_url}`: photo_url)} alt="Aperçu" className="mt-2 rounded-lg max-h-40 mx-auto" />
          )}
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-2 rounded-xl shadow hover:from-emerald-600 hover:to-teal-600 transition">
            {loading ? 'Modification...' : 'Enregistrer'}
          </button>
          {onClose && (
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-xl border border-gray-300 hover:bg-gray-200 transition">
              Annuler
            </button>
          )}
        </div>
        {loading && (
          <div className="fixed inset-0 bg-couleur-fond bg-opacity-70 flex items-center justify-center z-50">
            <svg className="animate-spin h-12 w-12 text-couleur-principale" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
        )}
      </form>
    </div>
  );
} 