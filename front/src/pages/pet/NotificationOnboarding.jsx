import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { Bell, Dog, Utensils, Syringe } from 'lucide-react';

const DEFAULT_REMINDERS = [
  { key: 'walk', label: 'Promener mon animal', emoji: <Dog className="inline h-5 w-5 text-emerald-400 mr-1" />, enabled: false, times: ['08:00', '18:00'] },
  { key: 'meal', label: 'Donner à manger', emoji: <Utensils className="inline h-5 w-5 text-emerald-400 mr-1" />, enabled: false, times: ['07:30', '19:00'] },
  { key: 'health', label: 'Rappels santé (vaccins, vermifuge...)', emoji: <Syringe className="inline h-5 w-5 text-emerald-400 mr-1" />, enabled: false, times: ['10:00'] },
];

export default function NotificationOnboarding({ onSkip, onSuccess }) {
  const [reminders, setReminders] = useState(DEFAULT_REMINDERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get('/notification-settings')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setReminders(DEFAULT_REMINDERS.map(def => {
            const found = res.data.find(r => r.type === def.key);
            return found ? {
              ...def,
              enabled: found.enabled,
              times: Array.isArray(found.times) ? found.times : def.times
            } : def;
          }));
        }
      })
      .catch(() => setError("Impossible de charger les préférences de notifications."))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (idx) => {
    setReminders(reminders => reminders.map((r, i) => i === idx ? { ...r, enabled: !r.enabled } : r));
  };

  const handleTimeChange = (idx, tIdx, value) => {
    setReminders(reminders => reminders.map((r, i) => i === idx ? {
      ...r,
      times: r.times.map((t, j) => j === tIdx ? value : t)
    } : r));
  };

  const handleAddTime = (idx) => {
    setReminders(reminders => reminders.map((r, i) => i === idx ? {
      ...r,
      times: [...r.times, '12:00']
    } : r));
  };

  const handleRemoveTime = (idx, tIdx) => {
    setReminders(reminders => reminders.map((r, i) => i === idx ? {
      ...r,
      times: r.times.filter((_, j) => j !== tIdx)
    } : r));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const settings = reminders.map(r => ({ type: r.key, enabled: r.enabled, times: r.times }));
      await axios.post('/notification-settings', { settings });
      setSuccess('Préférences enregistrées !');
      setTimeout(() => onSuccess ? onSuccess() : navigate('/'), 1000);
    } catch (err) {
      setError("Erreur lors de l'enregistrement des préférences.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-white/90 rounded-2xl shadow-xl p-6 sm:p-10 flex flex-col items-center">
        <img src="/assets/logo2.png" alt="Toupaw" className="w-auto h-20 mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-1 flex items-center gap-2 font-ranille"><Bell className="inline h-7 w-7 text-emerald-400" />Notifications de rappel</h1>
        <p className="text-gray-600 text-center mb-6">Active les rappels pour ne rien oublier !<br/>Tu recevras un e-mail à l’heure choisie pour chaque type de rappel 🐾</p>
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-2 text-xs text-center">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 mb-2 text-xs text-center">{success}</div>}
          <div className="space-y-6">
            {reminders.map((reminder, idx) => (
              <div key={reminder.key} className="border rounded-lg p-4 bg-gray-50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={reminder.enabled} onChange={() => handleToggle(idx)} className="accent-emerald-500 w-5 h-5" />
                  <span className="text-lg font-semibold flex items-center gap-1">{reminder.emoji}{reminder.label}</span>
                </label>
                {reminder.enabled && (
                  <div className="mt-3 space-y-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      {reminder.times.map((time, tIdx) => (
                        <div key={tIdx} className="flex items-center gap-1">
                          <input type="time" value={time} onChange={e => handleTimeChange(idx, tIdx, e.target.value)} className="border rounded px-2 py-1 text-sm" />
                          {reminder.times.length > 1 && (
                            <button type="button" onClick={() => handleRemoveTime(idx, tIdx)} className="text-red-500 text-xs">✕</button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddTime(idx)} className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">+ Ajouter une heure</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 text-lg">
            {loading ? 'Enregistrement...' : 'Enregistrer mes préférences'}
          </button>
          <button
            type="button"
            onClick={onSkip ? onSkip : () => navigate('/')}
            className="w-full mt-2 text-emerald-700 hover:underline text-base font-semibold px-4 py-2"
          >
            Passer cette étape
          </button>
        </form>
      </div>
    </div>
  );
} 