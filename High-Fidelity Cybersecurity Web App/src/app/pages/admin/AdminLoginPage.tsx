import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, Shield, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { login, sendAdmin2FA, verifyAdmin2FA } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const [step, setStep]         = useState<'credentials' | '2fa'>('credentials');
  const [email, setEmail]       = useState('admin@cyna-it.fr');
  const [password, setPassword] = useState('');
  const [code, setCode]         = useState('');
  const [error, setError]       = useState('');
  const [info, setInfo]         = useState('');
  const [loading, setLoading]   = useState(false);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await login({ email, password });
      if (user.role !== 'admin') {
        setError('Accès refusé. Ce compte n\'a pas les droits administrateur.');
        return;
      }
      setUser({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        company: user.company ?? undefined,
        role: user.role,
      });

      // Envoyer le code 2FA par email
      await sendAdmin2FA();
      setInfo('Un code de vérification a été envoyé à ' + email);
      setStep('2fa');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg =
        axiosErr?.response?.data?.errors?.email?.[0] ??
        axiosErr?.response?.data?.message ??
        'Identifiants incorrects.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyAdmin2FA(code);
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? 'Code invalide.');
    } finally {
      setLoading(false);
    }
  };

  const resend2FA = async () => {
    setError('');
    setInfo('');
    try {
      await sendAdmin2FA();
      setInfo('Nouveau code envoyé à ' + email);
      setCode('');
    } catch {
      setError('Impossible de renvoyer le code. Réessayez.');
    }
  };

  return (
    <div className="min-h-screen bg-[#060E1E] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00B4D8]/10 border border-[#00B4D8]/30 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-[#00B4D8]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Administration CYNA</h1>
          <p className="text-gray-400 text-sm">Accès restreint — personnel autorisé uniquement</p>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8">
          {step === 'credentials' ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Connexion administrateur</h2>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-5">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleCredentials} className="space-y-5">
                <div>
                  <label className="block text-white font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Vérification...' : 'Continuer'}
                </button>
              </form>

              <p className="text-center text-gray-600 text-xs mt-4">
                Démo : admin@cyna-it.fr / Admin1234!
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 rounded-full mb-3">
                  <Shield className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">Vérification 2FA</h2>
                <p className="text-gray-400 text-sm">Saisir le code envoyé par email</p>
              </div>

              {info && (
                <div className="flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-3 mb-5">
                  <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                  <p className="text-[#10B981] text-sm">{info}</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-5">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handle2FA} className="space-y-5">
                <div>
                  <label className="block text-white font-medium mb-2">Code à 6 chiffres</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                  />
                  <p className="text-gray-500 text-xs mt-2 text-center">
                    Code valide 5 minutes · Vérifiez <span className="text-[#00B4D8]">storage/logs/laravel.log</span> en local
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={code.length !== 6 || loading}
                  className="w-full py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Vérification...' : 'Vérifier et accéder'}
                </button>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setCode(''); setError(''); setInfo(''); }}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    ← Retour
                  </button>
                  <button
                    type="button"
                    onClick={resend2FA}
                    className="text-[#00B4D8] hover:text-[#0096B8] text-sm transition-colors"
                  >
                    Renvoyer le code
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          CYNA Admin v1.0 — Accès soumis à journalisation complète
        </p>
      </div>
    </div>
  );
}
