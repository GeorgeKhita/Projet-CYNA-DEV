import { useState, useEffect, FormEvent } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router';
import { User, Mail, Building, Lock, Check, Download, Trash2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, getToken } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { DashboardSidebar } from '../components/DashboardSidebar';

export function ParametresPage() {
  const { user, isAuthenticated, loading: authLoading, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
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
      if (updated.pending_email_sent) {
        setSuccess(t('settings.success_profile_email', { email: updated.pending_email }));
      } else {
        setSuccess(t('settings.success_profile'));
      }
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handlePassword(e: FormEvent) {
    e.preventDefault();
    if (pwd.password !== pwd.password_confirmation) { setError(t('settings.error_passwords')); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.put('/auth/me', pwd);
      setPwd({ current_password: '', password: '', password_confirmation: '' });
      setSuccess(t('settings.success_password'));
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

  if (authLoading) return <div className="min-h-screen bg-card flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to={`/connexion?redirect=${encodeURIComponent(location.pathname)}`} replace />;

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1"><DashboardSidebar /></div>

          <div className="lg:col-span-3 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-ink mb-2">{t('settings.title')}</h1>
              <p className="text-muted-foreground">{t('settings.subtitle')}</p>
            </div>

            {success && (
              <div className="flex items-center gap-2 px-4 py-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-success">
                <Check className="w-5 h-5" /> {success}
              </div>
            )}
            {error && (
              <div role="alert" className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive">{error}</div>
            )}

            <div className="cyna-card p-8">
              <h2 className="text-2xl font-bold text-ink mb-6">{t('settings.personal_info')}</h2>
              <form onSubmit={handleProfile} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="settings-first-name" className="block text-ink mb-2">{t('settings.first_name')}</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input id="settings-first-name" type="text" value={form.first_name} onChange={setField('first_name')} required className="field field-icon" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="settings-last-name" className="block text-ink mb-2">{t('settings.last_name')}</label>
                    <input id="settings-last-name" type="text" value={form.last_name} onChange={setField('last_name')} required className="field" />
                  </div>
                </div>
                <div>
                  <label htmlFor="settings-company" className="block text-ink mb-2">{t('settings.company')}</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input id="settings-company" type="text" value={form.company} onChange={setField('company')} className="field field-icon" />
                  </div>
                </div>
                <div>
                  <label htmlFor="settings-email" className="block text-ink mb-2">{t('settings.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input id="settings-email" type="email" value={form.email} onChange={setField('email')} required className="field field-icon" />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? t('settings.saving') : t('settings.save')}
                </button>
              </form>
            </div>

            <div className="cyna-card p-8">
              <h2 className="text-2xl font-bold text-ink mb-6">{t('settings.change_password')}</h2>
              <form onSubmit={handlePassword} className="space-y-5">
                <div>
                  <label htmlFor="settings-current-password" className="block text-ink mb-2">{t('settings.current_password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input id="settings-current-password" type="password" value={pwd.current_password} onChange={setPwdField('current_password')} required placeholder="••••••••" className="field field-icon" />
                  </div>
                </div>
                <div>
                  <label htmlFor="settings-new-password" className="block text-ink mb-2">{t('settings.new_password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input id="settings-new-password" type="password" value={pwd.password} onChange={setPwdField('password')} required placeholder="••••••••" minLength={8} className="field field-icon" />
                  </div>
                </div>
                <div>
                  <label htmlFor="settings-confirm-password" className="block text-ink mb-2">{t('settings.confirm_password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input id="settings-confirm-password" type="password" value={pwd.password_confirmation} onChange={setPwdField('password_confirmation')} required placeholder="••••••••" className="field field-icon" />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="btn btn-ghost">
                  {saving ? t('settings.changing') : t('settings.change_pwd_btn')}
                </button>
              </form>
            </div>

            <div className="cyna-card p-8">
              <h2 className="text-2xl font-bold text-ink mb-2">{t('settings.rgpd_title')}</h2>
              <p className="text-muted-foreground mb-6">{t('settings.rgpd_desc')}</p>
              <button onClick={handleExportData} className="btn btn-ghost">
                <Download className="w-4 h-4 text-[#00B4D8]" />
                {t('settings.export_data')}
              </button>
            </div>

            <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <h2 className="text-2xl font-bold text-destructive">{t('settings.danger_zone')}</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                {t('settings.danger_desc').split('irréversible').map((part, i) =>
                  i === 0 ? <span key={i}>{part}<strong className="text-ink">irréversible</strong></span> : <span key={i}>{part}</span>
                )}
              </p>
              <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger">
                <Trash2 className="w-4 h-4" />
                {t('settings.delete_account')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#0A1628]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-destructive/30 rounded-2xl p-8 max-w-md w-full shadow-[var(--shadow-lg)]">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive flex-shrink-0" />
              <h3 className="text-xl font-bold text-ink">{t('settings.confirm_delete_title')}</h3>
            </div>
            <p className="text-ink-soft mb-6">{t('settings.confirm_delete_desc')}</p>
            {error && <div role="alert" className="mb-4 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>}
            <input
              type="password"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder={t('settings.delete_confirm_placeholder')}
              aria-label={t('settings.delete_confirm_placeholder')}
              className="field mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); setError(''); }} className="btn btn-ghost flex-1">
                {t('settings.cancel')}
              </button>
              <button onClick={handleDeleteAccount} disabled={!deleteConfirm || deleting}
                className="btn flex-1 bg-[#EF4444] text-white hover:bg-[#DC2626]">
                {deleting ? t('settings.deleting') : t('settings.delete_permanently')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
