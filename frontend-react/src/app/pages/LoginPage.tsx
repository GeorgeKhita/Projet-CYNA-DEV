import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post<any>('/auth/login', { email, password });

      if (data.requires_2fa) {
        sessionStorage.setItem('2fa_pending_token', data.pending_token);
        navigate('/verification-2fa');
        return;
      }

      login(data.token, data.user);
      navigate(data.user?.role === 'admin' ? '/admin' : '/espace-client');
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-3xl font-bold text-[#0A1628] mb-2">Connexion</h1>
            <p className="text-[#69727F]">Accédez à votre espace client</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#DC2626] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#0A1628] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre.email@entreprise.com"
                  required
                  className="field field-icon"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#0A1628] mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="field field-icon"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#69727F] cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-[#D3DAE4] text-[#00B4D8]" />
                Se souvenir de moi
              </label>
              <Link to="/mot-de-passe-oublie" className="text-[#0098B7] hover:underline font-semibold">
                Mot de passe oublié ?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E9F0]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#9AA3AF]">ou</span>
            </div>
          </div>

          <Link to="/inscription" className="btn btn-outline btn-block btn-lg">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
