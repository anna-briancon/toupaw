import { useState } from 'react';
import axios from '../../utils/axiosInstance';
import { useNavigate, useLocation } from 'react-router-dom';
import { PawPrint } from 'lucide-react';

export function CreatePetForm({ onSuccess, onCancel }) {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [gender, setGender] = useState('male');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      }
      await axios.post('/pets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création du chien');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-96 max-w-full space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
          <PawPrint className="h-6 w-6 text-white" />
        </div>
        <h2 className="font-ranille text-2xl sm:text-3xl font-bold text-gray-900">Créer mon animal</h2>
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
        {photoPreview && (
          <img src={photoPreview} alt="Aperçu" className="mt-2 rounded-lg max-h-40 mx-auto" />
        )}
      </div>
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-2 rounded-xl shadow hover:from-emerald-600 hover:to-teal-600 transition">
          {loading ? 'Création...' : 'Créer mon animal'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-xl border border-gray-300 hover:bg-gray-200 transition">
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
  );
}

export function CreatePetModal({ open, onClose, onSuccess }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <CreatePetForm onSuccess={onSuccess} onCancel={onClose} />
    </div>
  );
}

export default function CreatePetPage() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="min-h-screen bg-couleur-fond p-6 pb-24 flex items-center justify-center">
      <CreatePetForm onSuccess={() => {
        if (location.state && location.state.fromMultiPets) {
          navigate('/multi-pets', { replace: true });
        } else {
          navigate('/');
        }
      }} />
    </div>
  );
} 