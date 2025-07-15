import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { PawPrint } from 'lucide-react';

export default function CreatePet() {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [photo_url, setPhotoUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/pets', {
        name,
        birthdate,
        species,
        breed,
        photo_url,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création du chien');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-couleur-fond p-6 pb-24 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow p-6 sm:p-8 w-full max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <PawPrint className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-ranille text-2xl sm:text-3xl font-bold text-gray-900">Créer mon animal</h2>
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}
        <input
          type="text"
          placeholder="Nom"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full mb-4 p-3 border rounded-xl focus:ring-2 focus:ring-emerald-400"
          required
        />
        <input
          type="date"
          placeholder="Date de naissance"
          value={birthdate}
          onChange={e => setBirthdate(e.target.value)}
          className="w-full mb-4 p-3 border rounded-xl focus:ring-2 focus:ring-emerald-400"
          required
        />
        <select
          value={species}
          onChange={e => setSpecies(e.target.value)}
          className="w-full mb-4 p-3 border rounded-xl focus:ring-2 focus:ring-emerald-400"
        >
          <option value="dog">Chien</option>
          <option value="cat">Chat</option>
          <option value="other">Autre</option>
        </select>
        <input
          type="text"
          placeholder="Race"
          value={breed}
          onChange={e => setBreed(e.target.value)}
          className="w-full mb-4 p-3 border rounded-xl focus:ring-2 focus:ring-emerald-400"
          required
        />
        <input
          type="url"
          placeholder="Photo (URL)"
          value={photo_url}
          onChange={e => setPhotoUrl(e.target.value)}
          className="w-full mb-4 p-3 border rounded-xl focus:ring-2 focus:ring-emerald-400"
        />
        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2">
          {loading ? 'Création...' : 'Créer mon animal'}
        </button>
      </form>
      {loading && (
        <div className="fixed inset-0 bg-couleur-fond bg-opacity-70 flex items-center justify-center z-50">
          <svg className="animate-spin h-12 w-12 text-couleur-principale" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      )}
    </div>
  );
} 