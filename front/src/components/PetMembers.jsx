import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { Users, Trash2 } from 'lucide-react';

const getInitials = (name, email) => {
  if (name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  return email ? email[0].toUpperCase() : '?';
};

const PetMembers = ({ petId, currentUserId }) => {
  const [members, setMembers] = useState([]);
  const [showConfirm, setShowConfirm] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`/pets/${petId}/members`);
      setMembers(res.data);
      const owner = res.data.find(m => m.role === 'owner');
      setOwnerId(owner ? owner.id : null);
      const me = res.data.find(m => m.id === currentUserId);
      setCurrentUserRole(me ? me.role : null);
    } catch (err) {
      setMembers([]);
      setOwnerId(null);
      setCurrentUserRole(null);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line
  }, [petId]);

  const handleRemove = async (userId) => {
    setRemoving(true);
    try {
      await axios.delete(`/pets/${petId}/members/${userId}`);
      setShowConfirm(null);
      fetchMembers();
    } catch (err) {
      setShowConfirm(null);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm mt-2">
      <h4 className="font-semibold text-emerald-700 mb-3 text-base flex items-center gap-2">
        <Users className="h-5 w-5" /> Membres du compte
      </h4>
      {members.length === 0 ? (
        <div className="text-gray-400 text-sm">Aucun membre pour cet animal.</div>
      ) : (
        <ul className="divide-y divide-emerald-50">
          {members.map(member => (
            <li key={member.id} className="flex items-center gap-3 py-2">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-lg">
                {getInitials(member.name, member.email)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 flex items-center gap-1">
                  {member.name || <span className="italic text-gray-400">(sans nom)</span>}
                  {member.id === currentUserId && <span className="text-xs text-emerald-700 font-bold ml-1">(vous)</span>}
                </div>
                <div className="text-xs text-gray-500">{member.email}</div>
              </div>
              {member.role && (
                <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold mr-2">
                  {member.role === 'owner' ? 'Propriétaire' : member.role === 'member' ? 'Membre' : member.role}
                </span>
              )}
              {/* Bouton supprimer : visible seulement si user courant est owner, membre n'est pas owner ni soi-même */}
              {currentUserRole === 'owner' && member.role !== 'owner' && member.id !== currentUserId && (
                <button
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                  title="Supprimer ce membre"
                  onClick={() => setShowConfirm(member.id)}
                  disabled={removing}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {/* Popup de confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full border border-emerald-100">
            <h2 className="text-lg font-bold mb-4">Retirer ce membre ?</h2>
            <p className="mb-6 text-gray-600">Cette action est irréversible. Le membre n'aura plus accès à cet animal.</p>
            <div className="flex gap-4 justify-end">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-semibold"
                onClick={() => setShowConfirm(null)}
                disabled={removing}
              >Annuler</button>
              <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
                onClick={() => handleRemove(showConfirm)}
                disabled={removing}
              >{removing ? 'Suppression...' : 'Supprimer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetMembers;
