import { useState } from 'react';
import axios from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/features/auth/authSlice';
import AnimalOnboarding from '../pet/AnimalOnboarding';
import NotificationOnboarding from '../pet/NotificationOnboarding';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('register'); // 'register' | 'animal' | 'notif'
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors([]);
    setLoading(true);
    try {
      const res = await axios.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      dispatch(setUser(null));
      setStep('animal');
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

  if (step === 'animal') {
    return <AnimalOnboarding onSkip={() => setStep('notif')} onSuccess={() => setStep('notif')} />;
  }
  if (step === 'notif') {
    return <NotificationOnboarding onSkip={() => navigate('/')} onSuccess={() => navigate('/')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-white/90 rounded-2xl shadow-xl p-6 sm:p-10 flex flex-col items-center">
        <img src="/assets/logo2.png" alt="Toupaw" className="w-auto h-20 mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-1 flex items-center gap-2 font-ranille"><UserPlus className="inline h-7 w-7 text-emerald-400" />Créer un compte</h1>
        <p className="text-gray-600 text-center mb-6">Bienvenue sur <b>Toupaw</b> !<br/>Inscris-toi pour gérer tes animaux, recevoir des rappels et profiter de toutes les fonctionnalités 🐾</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {errors.length > 0 && (
            <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-2 text-xs text-center">
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
            {loading ? 'Création...' : 'Créer un compte'}
          </button>
        </form>
        <div className="mt-6 text-sm text-center">
          Déjà inscrit ? <a href="/login" className="text-emerald-600 hover:underline font-semibold">Se connecter</a>
        </div>
      </div>
    </div>
  );
} 