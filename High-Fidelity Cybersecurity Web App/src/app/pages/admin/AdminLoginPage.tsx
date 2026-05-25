import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, Shield } from 'lucide-react';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('2fa');
    setError('');
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === '000000') {
      navigate('/admin/dashboard');
    } else {
      setError('Code invalide. (Démonstration : saisir 000000)');
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
              <form onSubmit={handleCredentials} className="space-y-5">
                <div>
                  <label className="block text-white font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      defaultValue="admin@cyna-it.fr"
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
                      defaultValue="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors"
                >
                  Continuer
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 rounded-full mb-3">
                  <Shield className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">Vérification 2FA</h2>
                <p className="text-gray-400 text-sm">Saisir le code de votre application authenticator</p>
              </div>
              <form onSubmit={handle2FA} className="space-y-5">
                <div>
                  <label className="block text-white font-medium mb-2">Code à 6 chiffres</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                  />
                  {error && <p className="text-[#EF4444] text-sm mt-2">{error}</p>}
                  <p className="text-gray-500 text-xs mt-2 text-center">Demo : saisir 000000</p>
                </div>
                <button
                  type="submit"
                  disabled={code.length !== 6}
                  className="w-full py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Vérifier et accéder
                </button>
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="w-full py-2 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  ← Retour
                </button>
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
