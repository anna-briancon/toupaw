import { useState } from 'react';
import axios from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/features/auth/authSlice';
import { User } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      dispatch(setUser(res.data.user || { email }));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-white/90 rounded-2xl shadow-xl p-6 sm:p-10 flex flex-col items-center">
        <img src="/assets/logo2.png" alt="Toupaw" className="w-auto h-20 mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-1 flex items-center gap-2 font-ranille"><User className="inline h-7 w-7 text-emerald-400" />Connexion</h1>
        <p className="text-gray-600 text-center mb-6">Ravi de te revoir sur <b>Toupaw</b> !<br/>Connecte-toi pour retrouver tes animaux et tous tes rappels 🐾</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-2 text-xs text-center">{error}</div>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-400 text-base"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-400 text-base"
            required
          />
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-lg">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <div className="mt-6 text-sm text-center">
          Pas encore de compte ? <a href="/register" className="text-emerald-600 hover:underline font-semibold">Créer un compte</a>
        </div>
      </div>
    </div>
  );
} 