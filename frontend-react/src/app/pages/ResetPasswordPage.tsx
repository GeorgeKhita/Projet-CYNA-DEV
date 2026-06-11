import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Lock, CheckCircle } from 'lucide-react';
import { api } from '../../api/client';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [form, setForm] = useState({ password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, email, ...form });
      setSuccess(true);
      setTimeout(() => navigate('/connexion'), 3000);
    } catch (err: any) {
      setError(err.message || 'Lien invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F6F8FB] to-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[#DC2626] mb-4 font-semibold">Lien invalide ou expiré.</p>
          <Link to="/mot-de-passe-oublie" className="text-[#0098B7] hover:underline font-semibold">Demander un nouveau lien</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F8FB] to-white flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md fade-up">
        <div className="cyna-card p-8 shadow-[var(--shadow-lg)]">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B4D8] to-[#0098B7] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(0,180,216,0.35)]">⬡</div>
              <span className="text-2xl font-bold text-[#0A1628]">CYNA</span>
            </div>
            <h1 className="text-3xl font-bold text-[#0A1628] mb-2">Nouveau mot de passe</h1>
            <p className="text-[#69727F]">Choisissez un nouveau mot de passe sécurisé</p>
          </div>

          {success ? (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#0A1628] mb-2">Mot de passe modifié !</h2>
              <p className="text-[#69727F] mb-2">Vous allez être redirigé vers la connexion...</p>
              <Link to="/connexion" className="text-[#0098B7] hover:underline font-semibold">Se connecter maintenant</Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 px-4 py-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#DC2626] text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[#0A1628] mb-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                    <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required minLength={8} placeholder="••••••••" className="field field-icon" />
                  </div>
                </div>
                <div>
                  <label className="block text-[#0A1628] mb-2">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                    <input type="password" value={form.password_confirmation} onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))}
                      required placeholder="••••••••" className="field field-icon" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
                  {loading ? 'Modification...' : 'Réinitialiser le mot de passe'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
