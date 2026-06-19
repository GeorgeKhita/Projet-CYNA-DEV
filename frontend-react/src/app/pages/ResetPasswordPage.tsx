import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Lock, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [form, setForm] = useState({ password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setError(t('reset_password.error_passwords'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, email, ...form });
      setSuccess(true);
      setTimeout(() => navigate('/connexion'), 3000);
    } catch (err: any) {
      setError(err.message || t('reset_password.error_default'));
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-subtle to-background flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-destructive mb-4 font-semibold">{t('reset_password.invalid_link')}</p>
          <Link to="/mot-de-passe-oublie" className="text-primary hover:underline font-semibold">{t('reset_password.request_new_link')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-subtle to-background flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md fade-up">
        <div className="cyna-card p-8 shadow-[var(--shadow-lg)]">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B4D8] to-[#0098B7] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(0,180,216,0.35)]">⬡</div>
              <span className="text-2xl font-bold text-ink">CYNA</span>
            </div>
            <h1 className="text-3xl font-bold text-ink mb-2">{t('reset_password.title')}</h1>
            <p className="text-muted-foreground">{t('reset_password.subtitle')}</p>
          </div>

          {success ? (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-ink mb-2">{t('reset_password.success_title')}</h2>
              <p className="text-muted-foreground mb-2">{t('reset_password.success_desc')}</p>
              <Link to="/connexion" className="text-primary hover:underline font-semibold">{t('reset_password.login_now')}</Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-ink mb-2">{t('reset_password.new_password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required minLength={8} placeholder="••••••••" className="field field-icon" />
                  </div>
                </div>
                <div>
                  <label className="block text-ink mb-2">{t('reset_password.confirm_password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="password" value={form.password_confirmation} onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))}
                      required placeholder="••••••••" className="field field-icon" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
                  {loading ? t('reset_password.submitting') : t('reset_password.submit')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
