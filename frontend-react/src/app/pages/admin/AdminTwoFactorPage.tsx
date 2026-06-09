import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import { ShieldCheck, ShieldOff, QrCode, KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';
import { AdminSidebar } from '../../components/AdminSidebar';

export function AdminTwoFactorPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [twoFaEnabled, setTwoFaEnabled]   = useState(false);
  const [step, setStep]                   = useState<'idle' | 'setup' | 'confirm' | 'disable'>('idle');
  const [qrCode, setQrCode]               = useState('');
  const [secretKey, setSecretKey]         = useState('');
  const [code, setCode]                   = useState('');
  const [message, setMessage]             = useState('');
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get<any>('/auth/me').then(data => setTwoFaEnabled(data.two_factor_enabled ?? false)).catch(() => {});
  }, [isAuthenticated]);

  async function startSetup() {
    setLoading(true); setError(''); setMessage('');
    try {
      const data = await api.post<any>('/auth/admin/setup-2fa', {});
      setQrCode(data.qr_code);
      setSecretKey(data.secret_key);
      setStep('setup');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function confirmSetup() {
    if (code.length !== 6) { setError('Entrez un code à 6 chiffres.'); return; }
    setLoading(true); setError('');
    try {
      const data = await api.post<any>('/auth/admin/confirm-2fa', { code });
      setMessage(data.message);
      setTwoFaEnabled(true);
      setStep('idle');
      setCode('');
      setQrCode('');
      setSecretKey('');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function disableTwoFactor() {
    if (code.length !== 6) { setError('Entrez un code à 6 chiffres.'); return; }
    setLoading(true); setError('');
    try {
      const data = await api.delete<any>('/auth/admin/disable-2fa', { code });
      setMessage(data.message);
      setTwoFaEnabled(false);
      setStep('idle');
      setCode('');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (authLoading) return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAuthenticated || user?.role !== 'admin') return <Navigate to="/connexion" replace />;

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0"><AdminSidebar /></div>

          <div className="flex-1 space-y-8 max-w-2xl">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Authentification à deux facteurs</h1>
              <p className="text-gray-400">Renforcez la sécurité de votre compte administrateur avec Google Authenticator.</p>
            </div>

            {/* Statut */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {twoFaEnabled
                  ? <ShieldCheck className="w-10 h-10 text-[#10B981]" />
                  : <ShieldOff className="w-10 h-10 text-gray-500" />
                }
                <div>
                  <div className="text-white font-semibold text-lg">
                    {twoFaEnabled ? '2FA activée' : '2FA désactivée'}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {twoFaEnabled
                      ? 'Votre compte est protégé par une authentification à deux facteurs.'
                      : 'Votre compte utilise uniquement un mot de passe.'
                    }
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${twoFaEnabled ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                {twoFaEnabled ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>

            {/* Messages */}
            {message && (
              <div className="flex items-center gap-2 px-4 py-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg text-[#10B981]">
                <CheckCircle className="w-5 h-5 flex-shrink-0" /> {message}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {error}
              </div>
            )}

            {/* ÉTAPE 1 : bouton d'activation / désactivation */}
            {step === 'idle' && (
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6">
                {!twoFaEnabled ? (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-3">Activer la 2FA</h2>
                    <p className="text-gray-400 text-sm mb-6">
                      Vous aurez besoin de l'application <strong className="text-white">Google Authenticator</strong> (ou Authy)
                      sur votre smartphone. Un QR code vous sera fourni pour la configuration.
                    </p>
                    <button onClick={startSetup} disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors disabled:opacity-60">
                      <QrCode className="w-5 h-5" />
                      {loading ? 'Génération...' : 'Configurer la 2FA'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-3">Désactiver la 2FA</h2>
                    <p className="text-gray-400 text-sm mb-6">
                      Pour désactiver, vous devrez entrer un code valide depuis votre application d'authentification.
                    </p>
                    <button onClick={() => { setStep('disable'); setError(''); setCode(''); }}
                      className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-colors">
                      <ShieldOff className="w-5 h-5" />
                      Désactiver la 2FA
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ÉTAPE 2 : QR code + clé manuelle */}
            {step === 'setup' && (
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">1. Scannez le QR code</h2>
                  <p className="text-gray-400 text-sm mb-4">Ouvrez Google Authenticator → + → Scanner un QR code</p>
                  {qrCode && (
                    <div className="inline-block p-4 bg-white rounded-xl">
                      <img src={qrCode} alt="QR code 2FA" className="w-48 h-48" />
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Ou entrez la clé manuellement</h2>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                    <KeyRound className="w-5 h-5 text-[#00B4D8] flex-shrink-0" />
                    <code className="text-[#00B4D8] font-mono text-sm tracking-widest break-all">{secretKey}</code>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">Émetteur : CYNA · Type : TOTP · Intervalle : 30s</p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white mb-2">2. Confirmez avec le premier code</h2>
                  <p className="text-gray-400 text-sm mb-4">Entrez le code à 6 chiffres affiché dans l'application pour terminer la configuration.</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-40 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
                    />
                    <button onClick={confirmSetup} disabled={loading || code.length !== 6}
                      className="px-6 py-3 bg-[#10B981] text-white font-semibold rounded-lg hover:bg-[#0e9f70] transition-colors disabled:opacity-60">
                      {loading ? 'Vérification...' : 'Activer'}
                    </button>
                    <button onClick={() => { setStep('idle'); setCode(''); setError(''); setQrCode(''); setSecretKey(''); }}
                      className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE : Désactivation */}
            {step === 'disable' && (
              <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-bold text-white">Désactiver la 2FA</h2>
                </div>
                <p className="text-gray-400 text-sm">
                  Entrez un code valide depuis votre application Google Authenticator pour confirmer.
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-40 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button onClick={disableTwoFactor} disabled={loading || code.length !== 6}
                    className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60">
                    {loading ? 'Désactivation...' : 'Désactiver'}
                  </button>
                  <button onClick={() => { setStep('idle'); setCode(''); setError(''); }}
                    className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Infos sécurité */}
            <div className="bg-[#00B4D8]/5 border border-[#00B4D8]/20 rounded-xl p-5 text-sm text-gray-400 space-y-1">
              <p className="font-semibold text-[#00B4D8] mb-2">Comment ça fonctionne</p>
              <p>• La 2FA ajoute une couche de sécurité : à chaque connexion admin, un code temporaire vous sera demandé.</p>
              <p>• Le code change toutes les <strong className="text-white">30 secondes</strong> et ne peut être utilisé qu'une seule fois.</p>
              <p>• Applications compatibles : <strong className="text-white">Google Authenticator</strong>, Authy, 1Password, Bitwarden.</p>
              <p>• Conservez la clé secrète dans un endroit sûr en cas de perte de votre téléphone.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
