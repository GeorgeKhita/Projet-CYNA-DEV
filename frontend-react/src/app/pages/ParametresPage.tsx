import { useState, useEffect, FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { User, Mail, Building, Lock, Check, Download, Trash2, AlertTriangle } from 'lucide-react';
import { api, getToken } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DashboardSidebar } from '../components/DashboardSidebar';

export function ParametresPage() {
  const { user, isAuthenticated, loading: authLoading, login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: '', last_name: '', company: '', email: '' });
  const [pwd, setPwd] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  async function handleExportData() {
    const token = getToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/auth/me/export`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mes-donnees-cyna-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDeleteAccount() {
    if (!deleteConfirm) return;
    setDeleting(true); setError('');
    try {
      await api.delete('/auth/me', { password: deleteConfirm });
      logout();
      navigate('/');
    } catch (err: any) {
      setError(err.message ?? 'Mot de passe incorrect.');
      setDeleting(false);
    }
  }

  if (authLoading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1"><DashboardSidebar /></div>

          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-[#0A1628] mb-2">Paramètres</h1>
              <p className="text-[#69727F]">Gérez vos informations personnelles</p>
            </div>

            {success && (
              <div className="flex items-center gap-2 px-4 py-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-[#059669]">
                <Check className="w-5 h-5" /> {success}
              </div>
            )}
            {error && (
              <div className="px-4 py-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#DC2626]">{error}</div>
            )}

            {/* Profil */}
            <div className="cyna-card p-8">
              <h2 className="text-2xl font-bold text-[#0A1628] mb-6">Informations personnelles</h2>
              <form onSubmit={handleProfile} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#0A1628] mb-2">Prénom</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                      <input type="text" value={form.first_name} onChange={setField('first_name')} required className="field field-icon" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[#0A1628] mb-2">Nom</label>
                    <input type="text" value={form.last_name} onChange={setField('last_name')} required className="field" />
                  </div>
                </div>
                <div>
                  <label className="block text-[#0A1628] mb-2">Entreprise</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                    <input type="text" value={form.company} onChange={setField('company')} className="field field-icon" />
                  </div>
                </div>
                <div>
                  <label className="block text-[#0A1628] mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                    <input type="email" value={form.email} onChange={setField('email')} required className="field field-icon" />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </form>
            </div>

            {/* Mot de passe */}
            <div className="cyna-card p-8">
              <h2 className="text-2xl font-bold text-[#0A1628] mb-6">Changer le mot de passe</h2>
              <form onSubmit={handlePassword} className="space-y-5">
                <div>
                  <label className="block text-[#0A1628] mb-2">Mot de passe actuel</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                    <input type="password" value={pwd.current_password} onChange={setPwdField('current_password')} required placeholder="••••••••" className="field field-icon" />
                  </div>
                </div>
                <div>
                  <label className="block text-[#0A1628] mb-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                    <input type="password" value={pwd.password} onChange={setPwdField('password')} required placeholder="••••••••" minLength={8} className="field field-icon" />
                  </div>
                </div>
                <div>
                  <label className="block text-[#0A1628] mb-2">Confirmer le nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                    <input type="password" value={pwd.password_confirmation} onChange={setPwdField('password_confirmation')} required placeholder="••••••••" className="field field-icon" />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="btn btn-ghost">
                  {saving ? 'Modification...' : 'Changer le mot de passe'}
                </button>
              </form>
            </div>

            {/* RGPD */}
            <div className="cyna-card p-8">
              <h2 className="text-2xl font-bold text-[#0A1628] mb-2">Mes données (RGPD)</h2>
              <p className="text-[#69727F] mb-6">Conformément au RGPD, vous pouvez exporter ou supprimer définitivement vos données personnelles.</p>
              <button onClick={handleExportData} className="btn btn-ghost">
                <Download className="w-4 h-4 text-[#00B4D8]" />
                Exporter mes données (JSON)
              </button>
            </div>

            {/* Zone danger */}
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
                <h2 className="text-2xl font-bold text-[#DC2626]">Zone dangereuse</h2>
              </div>
              <p className="text-[#69727F] mb-6">
                La suppression de votre compte est <strong className="text-[#0A1628]">irréversible</strong>. Toutes vos données (commandes, abonnements, factures) seront définitivement supprimées.
              </p>
              <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger">
                <Trash2 className="w-4 h-4" />
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal confirmation suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#0A1628]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#FECACA] rounded-2xl p-8 max-w-md w-full shadow-[var(--shadow-lg)]">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-[#EF4444] flex-shrink-0" />
              <h3 className="text-xl font-bold text-[#0A1628]">Confirmer la suppression</h3>
            </div>
            <p className="text-[#3A4453] mb-6">
              Cette action est <strong className="text-[#DC2626]">irréversible</strong>. Entrez votre mot de passe pour confirmer.
            </p>
            {error && <div className="mb-4 px-4 py-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#DC2626] text-sm">{error}</div>}
            <input
              type="password"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="Votre mot de passe"
              className="field mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); setError(''); }} className="btn btn-ghost flex-1">
                Annuler
              </button>
              <button onClick={handleDeleteAccount} disabled={!deleteConfirm || deleting}
                className="btn flex-1 bg-[#EF4444] text-white hover:bg-[#DC2626]">
                {deleting ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
