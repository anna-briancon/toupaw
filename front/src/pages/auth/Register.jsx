import { useState } from 'react';
import axios from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors([]);
    setLoading(true);
    try {
      const res = await axios.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/create-pet');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors.map(e => e.msg));
      } else {
        setError(err.response?.data?.error || 'Erreur lors de la création du compte');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-couleur-fond p-6 pb-24 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow p-6 sm:p-8 w-full max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-ranille text-2xl sm:text-3xl font-bold text-gray-900">Créer un compte</h2>
        </div>
        {errors.length > 0 && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-4 text-xs">
            <ul className="list-disc pl-5">
              {errors.map((errMsg, i) => <li key={i}>{errMsg}</li>)}
            </ul>
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
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border rounded-xl focus:ring-2 focus:ring-emerald-400"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 p-3 border rounded-xl focus:ring-2 focus:ring-emerald-400"
          required
        />
        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2">
          {loading ? 'Création...' : 'Créer un compte'}
        </button>
        <div className="mt-4 text-sm text-center">
          Déjà inscrit ? <a href="/login" className="text-emerald-600 hover:underline">Se connecter</a>
        </div>
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