import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export function CheckoutIdentificationPage() {
  const { isAuthenticated, login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/checkout/adresse', { replace: true });
  }, [isAuthenticated]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post<{ token: string; user: any }>('/auth/login', { email, password });
      login(data.token, data.user);
      navigate('/checkout/adresse');
    } catch (err: any) {
      setError(err.message || t('checkout.error_default'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cyna-card p-8 shadow-[var(--shadow-md)]">
      <h1 className="text-3xl font-bold text-ink mb-2">{t('checkout.identification_title')}</h1>
      <p className="text-muted-foreground mb-8">{t('checkout.identification_subtitle')}</p>

      {error && (
        <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-ink mb-2">{t('checkout.email')}</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="votre.email@entreprise.com" className="field field-icon" />
          </div>
        </div>
        <div>
          <label className="block text-ink mb-2">{t('checkout.password')}</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••" className="field field-icon" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block">
          {loading ? t('checkout.loading') : t('checkout.continue')}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link to="/inscription" className="text-primary hover:underline font-semibold">{t('checkout.no_account')}</Link>
        <Link to="/mot-de-passe-oublie" className="text-muted-foreground hover:text-primary transition-colors">{t('checkout.forgot_password')}</Link>
      </div>
    </div>
  );
}
