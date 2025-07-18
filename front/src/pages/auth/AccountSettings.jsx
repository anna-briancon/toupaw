import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import SectionTitle from '../../components/SectionTitle';
import { ArrowLeft, User, Mail as MailIcon, Lock, Sun, Moon, Bell, Trash2, ChevronDown, ChevronUp, Info, HelpCircle, LogOut } from 'lucide-react';
import { useDispatch } from "react-redux";
import { logout } from "../../store/features/auth/authSlice";

const FAQ = [
  {
    q: "Comment changer mon email ?",
    a: "Modifie ton adresse dans la section Profil puis clique sur Enregistrer. Un email de confirmation peut être envoyé.",
  },
  {
    q: "Comment activer ou désactiver les notifications ?",
    a: "La gestion fine des notifications arrive bientôt. Pour l’instant, elles sont activées par défaut pour les rappels importants.",
  },
  {
    q: "Comment activer le mode sombre ?",
    a: "Le mode sombre sera bientôt disponible dans les préférences.",
  },
  {
    q: "Comment supprimer mon compte ?",
    a: "Clique sur 'Supprimer mon compte' en bas de page. Attention, cette action est irréversible.",
  },
];

function Accordion({ title, icon, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-emerald-100 shadow-sm mb-4">
      <button
        className="w-full flex items-center justify-between px-5 py-4 focus:outline-none"
        onClick={() => setOpen(o => !o)}
      >
        <span className="flex items-center gap-3 font-semibold text-base text-gray-900">{icon}{title}</span>
        {open ? <ChevronUp className="h-5 w-5 text-emerald-500" /> : <ChevronDown className="h-5 w-5 text-emerald-500" />}
      </button>
      {open && (
        <div className="px-6 pb-5">{children}</div>
      )}
    </div>
  );
}

function PasswordStrength({ password }) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { label: 'Faible', color: 'bg-red-400' },
    { label: 'Moyen', color: 'bg-yellow-400' },
    { label: 'Bon', color: 'bg-emerald-400' },
    { label: 'Excellent', color: 'bg-teal-500' },
  ];
  return password ? (
    <div className="flex items-center gap-2 mt-1">
      <div className={`h-2 w-20 rounded-full ${levels[score-1]?.color || 'bg-gray-200'}`}></div>
      <span className={`text-xs font-semibold ${levels[score-1]?.color ? levels[score-1].color.replace('bg-', 'text-') : 'text-gray-400'}`}>{levels[score-1]?.label || 'Trop court'}</span>
    </div>
  ) : null;
}

export default function AccountSettings() {
    const [profile, setProfile] = useState({ name: '', email: '' });
    const [profileMsg, setProfileMsg] = useState('');
    const [profileError, setProfileError] = useState('');
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
    const [passwordMsg, setPasswordMsg] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        setLoading(true);
        axios.get('/auth/me')
            .then(res => setProfile({ name: res.data.name, email: res.data.email }))
            .catch(() => setProfileError("Impossible de charger le profil."))
            .finally(() => setLoading(false));
    }, []);

    const handleProfileChange = e => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async e => {
        e.preventDefault();
        setProfileMsg(''); setProfileError('');
        try {
            setLoading(true);
            const res = await axios.patch('/auth/me', profile);
            setProfileMsg('Profil mis à jour !');
            setProfile({ name: res.data.name, email: res.data.email });
        } catch (err) {
            setProfileError(err.response?.data?.error || 'Erreur lors de la mise à jour.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = e => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async e => {
        e.preventDefault();
        setPasswordMsg(''); setPasswordError('');
        if (!passwords.currentPassword || !passwords.newPassword) {
            setPasswordError('Tous les champs sont requis.');
            return;
        }
        try {
            setLoading(true);
            await axios.patch('/auth/me/password', passwords);
            setPasswordMsg('Mot de passe changé !');
            setPasswords({ currentPassword: '', newPassword: '' });
        } catch (err) {
            setPasswordError(err.response?.data?.error || 'Erreur lors du changement de mot de passe.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Supprimer définitivement votre compte ? Cette action est irréversible.')) return;
        setDeleteError('');
        try {
            setLoading(true);
            await axios.delete('/auth/me');
            navigate('/login');
        } catch (err) {
            setDeleteError(err.response?.data?.error || 'Erreur lors de la suppression du compte.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
      dispatch(logout());
      navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 p-6 pb-24">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-semibold px-3 py-2 rounded-lg hover:bg-emerald-50 transition"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    Retour
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 px-5 py-2 rounded-xl text-base font-bold flex items-center gap-2 shadow-none"
                  >
                    <LogOut className="h-5 w-5 mr-2 text-red-800" />
                    Déconnexion
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <User className="h-8 w-8 text-emerald-500" />
                  <h1 className="text-2xl sm:text-3xl font-bold text-couleur-titre font-ranille">Paramètres du compte</h1>
                </div>
                {/* Profil */}
                <div className="bg-white rounded-2xl shadow p-6 mb-6 border border-emerald-100 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 text-4xl font-bold border-2 border-emerald-200">
                      {profile.name ? profile.name[0].toUpperCase() : <User className="h-10 w-10" />}
                    </div>
                    <span className="text-gray-700 font-semibold">Avatar</span>
                  </div>
                  <form onSubmit={handleProfileSubmit} className="flex-1 w-full">
                    <h2 className="font-semibold text-base mb-2 flex items-center gap-2"><MailIcon className="h-5 w-5 text-emerald-400" />Profil</h2>
                    <div className="mb-4">
                      <label className="block mb-1">Nom</label>
                      <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Email</label>
                      <input type="email" name="email" value={profile.email} onChange={handleProfileChange} className="w-full border rounded px-3 py-2" />
                    </div>
                    {profileMsg && <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 mb-2">{profileMsg}</div>}
                    {profileError && <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-2">{profileError}</div>}
                    <button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-4 py-2 rounded-xl shadow" disabled={loading}>Enregistrer</button>
                  </form>
                </div>
                {/* Mot de passe */}
                <div className="bg-white rounded-2xl shadow p-6 mb-6 border border-emerald-100">
                  <form onSubmit={handlePasswordSubmit} className="mb-8">
                    <h2 className="font-semibold text-base mb-2 flex items-center gap-2"><Lock className="h-5 w-5 text-emerald-400" />Changer le mot de passe</h2>
                    <div className="mb-4">
                      <label className="block mb-1">Mot de passe actuel</label>
                      <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Nouveau mot de passe</label>
                      <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} className="w-full border rounded px-3 py-2" />
                      <PasswordStrength password={passwords.newPassword} />
                      <div className="text-xs text-gray-500 mt-1">Utilise au moins 8 caractères, une majuscule, un chiffre et un symbole pour un mot de passe fort.</div>
                    </div>
                    {passwordMsg && <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 mb-2">{passwordMsg}</div>}
                    {passwordError && <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-2">{passwordError}</div>}
                    <button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-4 py-2 rounded-xl shadow" disabled={loading}>Changer</button>
                  </form>
                </div>
                {/* Préférences (placeholders) */}
                <div className="bg-white rounded-2xl shadow p-6 mb-6 border border-emerald-100">
                  <h2 className="font-semibold text-base mb-2 flex items-center gap-2"><Sun className="h-5 w-5 text-yellow-400" />Préférences</h2>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex items-center gap-2">
                      <Moon className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">Mode sombre (bientôt)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-emerald-400" />
                      <span className="text-gray-700">Notifications (bientôt)</span>
                    </div>
                  </div>
                </div>
                {/* Suppression du compte */}
                <div className="bg-white rounded-2xl shadow p-6 mb-6 border border-emerald-100">
                  <div className="mb-4">
                    <h2 className="font-semibold text-base mb-2 flex items-center gap-2 text-red-700"><Trash2 className="h-5 w-5" />Supprimer le compte</h2>
                    <div className="text-sm text-gray-500 mb-2">Cette action est <span className="font-bold text-red-700">irréversible</span>. Toutes tes données seront supprimées définitivement.</div>
                    {deleteError && <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-2">{deleteError}</div>}
                    <button onClick={handleDeleteAccount} className="bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 px-4 py-2 rounded-xl font-bold" disabled={loading}>Supprimer mon compte</button>
                  </div>
                </div>
                {/* FAQ compte */}
                <div className="mb-10">
                  <Accordion title="FAQ Paramètres du compte" icon={<HelpCircle className="h-6 w-6 text-emerald-400" />}>
                    <div className="space-y-3">
                      {FAQ.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-lg border border-emerald-100 p-4 shadow-sm">
                          <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                            <span className="text-emerald-600">Q.</span> {item.q}
                          </div>
                          <div className="text-gray-700 pl-6">{item.a}</div>
                        </div>
                      ))}
                    </div>
                  </Accordion>
                </div>
            </div>
        </div>
    );
} 