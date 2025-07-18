import { useState } from 'react';
import axios from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AnimalOnboarding({ onSkip, onSuccess }) {
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
  const navigate = useNavigate();

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
      else navigate('/');
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-white/90 rounded-2xl shadow-xl p-6 sm:p-10 flex flex-col items-center">
        <img src="/assets/logo2.png" alt="Toupaw" className="w-auto h-20 mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-1 flex items-center gap-2 font-ranille"><PawPrint className="inline h-7 w-7 text-emerald-400" />Ajoute ton animal</h1>
        <p className="text-gray-600 text-center mb-6">Pour profiter pleinement de Toupaw, commence par ajouter ton premier compagnon 🐶🐱<br/>Tu pourras en ajouter d'autres plus tard !</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
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
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center justify-center gap-2 text-lg">
            {loading ? 'Création...' : 'Ajouter mon animal'}
          </button>
        </form>
        <button
          onClick={onSkip ? onSkip : () => navigate('/')}
          className="w-full mt-6 text-emerald-700 hover:underline text-base font-semibold px-4 py-2"
        >
          Passer cette étape
        </button>
      </div>
    </div>
  );
} 