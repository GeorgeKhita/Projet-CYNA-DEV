import { useState, FormEvent } from 'react';
import { Link } from 'react-router';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('forgot_password.error_default'));
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-3xl font-bold text-ink mb-2">{t('forgot_password.title')}</h1>
            <p className="text-muted-foreground">{t('forgot_password.subtitle')}</p>
          </div>

          {success ? (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-ink mb-2">{t('forgot_password.success_title')}</h2>
              <p className="text-muted-foreground mb-6">{t('forgot_password.success_desc')}</p>
              <Link to="/connexion" className="text-primary hover:underline font-semibold">{t('forgot_password.back_to_login')}</Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-ink mb-2">{t('forgot_password.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="votre.email@entreprise.com" className="field field-icon" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
                  {loading ? t('forgot_password.submitting') : t('forgot_password.submit')}
                </button>
              </form>
              <div className="mt-6 text-center">
                <Link to="/connexion" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-semibold">
                  <ArrowLeft className="w-4 h-4" /> {t('forgot_password.back_to_login')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
