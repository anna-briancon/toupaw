import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import SectionTitle from '../../components/SectionTitle';
import { ArrowLeft } from 'lucide-react';

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

    return (
        <div className="min-h-screen bg-couleur-fond p-6 pb-24">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-semibold px-3 py-2 rounded-lg hover:bg-emerald-50 transition"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    Retour
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-couleur-titre font-ranille mb-6">Paramètres du compte</h1>
                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <svg className="animate-spin h-8 w-8 text-emerald-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                        <span className="ml-3 text-gray-600">Chargement...</span>
                    </div>
                )}
                <div className="bg-white rounded-2xl shadow p-6 mb-4 border border-emerald-100">
                    {/* Profil */}
                    <form onSubmit={handleProfileSubmit} className="mb-8">
                        <h2 className="font-semibold text-lg mb-2">Profil</h2>
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
                <div className="bg-white rounded-2xl shadow p-6 mb-4 border border-emerald-100">
                    {/* Mot de passe */}
                    <form onSubmit={handlePasswordSubmit} className="mb-8">
                        <h2 className="font-semibold text-lg mb-2">Changer le mot de passe</h2>
                        <div className="mb-4">
                            <label className="block mb-1">Mot de passe actuel</label>
                            <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">Nouveau mot de passe</label>
                            <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        {passwordMsg && <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 mb-2">{passwordMsg}</div>}
                        {passwordError && <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-2">{passwordError}</div>}
                        <button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-4 py-2 rounded-xl shadow" disabled={loading}>Changer</button>
                    </form>
                </div>
                <div className="bg-white rounded-2xl shadow p-6 border border-emerald-100">
                    {/* Suppression du compte */}
                    <div className="mb-4">
                        <h2 className="font-semibold text-lg mb-2 text-red-700">Supprimer le compte</h2>
                        {deleteError && <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-2">{deleteError}</div>}
                        <button onClick={handleDeleteAccount} className="bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 px-4 py-2 rounded-xl font-bold" disabled={loading}>Supprimer mon compte</button>
                    </div>
                </div>
            </div>
        </div>

    );
} 