import { useState } from 'react';
import axios from '../../utils/axiosInstance';
import { useNavigate, useLocation } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export function CreatePetForm({ onSuccess, onCancel }) {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [gender, setGender] = useState('male');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState([]);
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
    setErrors([]);
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
      if (err.response?.data) {
        if (typeof err.response.data === 'string' && err.response.data.includes('Seuls les fichiers')) {
          setError('Seuls les fichiers jpg, jpeg, png, webp de moins de 5 Mo sont autorisés.');
        } else if (typeof err.response.data === 'string' && err.response.data.includes('File too large')) {
          setError('Le fichier est trop volumineux (max 10 Mo).');
        } else if (err.response.data?.errors) {
          setErrors(err.response.data.errors.map(e => e.msg));
        } else {
          setError(err.response?.data?.error || 'Erreur lors de la création du chien');
        }
      } else {
        setError('Erreur lors de la création du chien');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto bg-white rounded-2xl p-6 sm:p-10 flex flex-col items-center space-y-4 relative max-h-[90vh] overflow-y-auto">
      <div className="flex items-center gap-1 mb-1 sm:mb-2">
        <div className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
          <PawPrint className="h-5 w-5 sm:h-5 sm:w-5 text-white" />
        </div>
        <span className="text-2xl font-semibold m-2 font-ranille">Créer mon animal</span>
      </div>
      {errors.length > 0 && (
        <div className="text-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-2 text-xs text-center">
          <ul className="list-disc pl-5">
            {errors.map((errMsg, i) => <li key={i}>{errMsg}</li>)}
          </ul>
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-2 text-xs text-center">{error}</div>
      )}
      <input
        type="text"
        placeholder="Nom"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-400 text-base"
        required
      />
      <input
        type="date"
        value={birthdate}
        onChange={e => setBirthdate(e.target.value)}
        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-400 text-base"
        required
      />
      <select
        value={species}
        onChange={e => setSpecies(e.target.value)}
        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-400 text-base"
      >
        <option value="dog">Chien</option>
        <option value="cat">Chat</option>
        <option value="other">Autre</option>
      </select>
      <select
        value={gender}
        onChange={e => setGender(e.target.value)}
        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-400 text-base"
      >
        <option value="male">Mâle</option>
        <option value="female">Femelle</option>
        <option value="other">Autre</option>
      </select>
      <input
        type="text"
        placeholder="Race"
        value={breed}
        onChange={e => setBreed(e.target.value)}
        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-400 text-base"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-400 text-base"
      />
      {photoPreview && (
        <img src={photoPreview} alt="Aperçu" className="mt-2 rounded-lg max-h-40 mx-auto" />
      )}
      <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center justify-center gap-2 text-base">
        {loading ? 'Création...' : 'Créer mon animal'}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="w-full mt-2 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl border border-gray-300 hover:bg-gray-200 transition text-base"
        >
          Annuler
        </button>
      )}
      {loading && <LoadingSpinner overlay />}
    </form>
  );
}

export function CreatePetModal({ open, onClose, onSuccess }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-3">
      <div className="w-full max-w-xl h-[80vh] bg-white rounded-2xl flex flex-col justify-center items-center p-0 overflow-hidden">
        <div className="w-full h-full overflow-y-auto p-6 sm:p-10 flex flex-col items-center">
          <CreatePetForm onSuccess={onSuccess} onCancel={onClose} />
        </div>
      </div>
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