import { useState, useEffect, FormEvent } from 'react';
import { Navigate } from 'react-router';
import { User, Mail, Building, Lock, Check } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DashboardSidebar } from '../components/DashboardSidebar';

export function ParametresPage() {
  const { user, isAuthenticated, loading: authLoading, login, getToken } = useAuth() as any;
  const [form, setForm] = useState({ first_name: '', last_name: '', company: '', email: '' });
  const [pwd, setPwd] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setForm({ first_name: user.first_name ?? '', last_name: user.last_name ?? '', company: user.company ?? '', email: user.email ?? '' });
  }, [user]);

  function setField(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }));
  }
  function setPwdField(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setPwd(p => ({ ...p, [field]: e.target.value }));
  }

  async function handleProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const updated = await api.put<any>('/auth/me', form);
      login(localStorage.getItem('cyna_token')!, updated);
      setSuccess('Profil mis à jour avec succès.');
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handlePassword(e: FormEvent) {
    e.preventDefault();
    if (pwd.password !== pwd.password_confirmation) { setError('Les mots de passe ne correspondent pas.'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.put('/auth/me', pwd);
      setPwd({ current_password: '', password: '', password_confirmation: '' });
      setSuccess('Mot de passe modifié avec succès.');
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  if (authLoading) return <div className="min-h-screen bg-[#0A1628] flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1"><DashboardSidebar /></div>

          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Paramètres</h1>
              <p className="text-gray-400">Gérez vos informations personnelles</p>
            </div>

            {success && (
              <div className="flex items-center gap-2 px-4 py-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg text-[#10B981]">
                <Check className="w-5 h-5" /> {success}
              </div>
            )}
            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">{error}</div>
            )}

            {/* Profil */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Informations personnelles</h2>
              <form onSubmit={handleProfile} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Prénom</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" value={form.first_name} onChange={setField('first_name')} required
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Nom</label>
                    <input type="text" value={form.last_name} onChange={setField('last_name')} required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                  </div>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Entreprise</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={form.company} onChange={setField('company')}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                  </div>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" value={form.email} onChange={setField('email')} required
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                  </div>
                </div>
                <button type="submit" disabled={saving}
                  className="px-8 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors disabled:opacity-60">
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </form>
            </div>

            {/* Mot de passe */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Changer le mot de passe</h2>
              <form onSubmit={handlePassword} className="space-y-5">
                <div>
                  <label className="block text-white font-medium mb-2">Mot de passe actuel</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" value={pwd.current_password} onChange={setPwdField('current_password')} required placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                  </div>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" value={pwd.password} onChange={setPwdField('password')} required placeholder="••••••••" minLength={8}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                  </div>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Confirmer le nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" value={pwd.password_confirmation} onChange={setPwdField('password_confirmation')} required placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]" />
                  </div>
                </div>
                <button type="submit" disabled={saving}
                  className="px-8 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors disabled:opacity-60">
                  {saving ? 'Modification...' : 'Changer le mot de passe'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
