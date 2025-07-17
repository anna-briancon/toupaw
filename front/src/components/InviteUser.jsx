import React, { useState } from 'react';
import axios from '../utils/axiosInstance';
import { MailPlus } from 'lucide-react';

const InviteUser = ({ petId, onInvite }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await axios.post(`/pets/${petId}/invite`, { email });
      setMessage("Invitation envoyée !");
      setEmail('');
      if (onInvite) onInvite();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm mt-2">
      <div className="flex items-center gap-2 mb-3">
        <MailPlus className="h-5 w-5 text-emerald-600" />
        <span className="font-semibold text-emerald-700 text-base">Inviter un utilisateur</span>
      </div>
      <form onSubmit={handleInvite} className="flex flex-col gap-2">
        <label htmlFor="invite-email" className="text-sm text-gray-700 font-medium">Email de l'utilisateur à inviter</label>
        <input
          id="invite-email"
          type="email"
          placeholder="exemple@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="border border-emerald-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-none text-gray-900"
        />
        <button
          type="submit"
          className="mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-2 rounded-lg shadow transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
          disabled={loading || !email}
        >
          {loading ? 'Envoi...' : 'Inviter'}
        </button>
        {message && <div className="text-green-600 text-sm mt-1">{message}</div>}
        {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
      </form>
    </div>
  );
};

export default InviteUser;
