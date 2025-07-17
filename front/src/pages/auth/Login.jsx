import { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useSelector, useDispatch } from "react-redux";
import { getUser } from '../../store/features/auth/authActions';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (auth.user) {
      navigate("/");
    }
  }, [auth.user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      await dispatch(getUser()); // Récupère l'utilisateur connecté et le stocke dans Redux
      // La redirection sera déclenchée par le useEffect
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-couleur-fond p-6 pb-24 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl shadow p-6 sm:p-8 w-full max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-ranille text-2xl sm:text-3xl font-bold text-gray-900">Connexion</h2>
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}
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
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        <div className="mt-4 text-sm text-center">
          Pas de compte ? <a href="/register" className="text-emerald-600 hover:underline">Créer un compte</a>
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