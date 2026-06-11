import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import { ShieldCheck, ShieldOff, QrCode, KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';

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
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAuthenticated || user?.role !== 'admin') return <Navigate to="/connexion" replace />;

  return (
    <div className="p-8">
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-[#0A1628] mb-2">Authentification à deux facteurs</h1>
          <p className="text-[#69727F]">Renforcez la sécurité de votre compte administrateur avec Google Authenticator.</p>
        </div>

        {/* Statut */}
        <div className="cyna-card p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {twoFaEnabled
              ? <ShieldCheck className="w-10 h-10 text-[#10B981]" />
              : <ShieldOff className="w-10 h-10 text-[#9AA3AF]" />
            }
            <div>
              <div className="text-[#0A1628] font-bold text-lg">
                {twoFaEnabled ? '2FA activée' : '2FA désactivée'}
              </div>
              <div className="text-[#69727F] text-sm">
                {twoFaEnabled
                  ? 'Votre compte est protégé par une authentification à deux facteurs.'
                  : 'Votre compte utilise uniquement un mot de passe.'
                }
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${twoFaEnabled ? 'bg-[#10B981]/12 text-[#059669] border border-[#10B981]/35' : 'bg-[#EDF1F7] text-[#69727F] border border-[#E5E9F0]'}`}>
            {twoFaEnabled ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        {/* Messages */}
        {message && (
          <div className="flex items-center gap-2 px-4 py-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-[#059669]">
            <CheckCircle className="w-5 h-5 flex-shrink-0" /> {message}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#DC2626]">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {error}
          </div>
        )}

        {/* ÉTAPE 1 */}
        {step === 'idle' && (
          <div className="cyna-card p-6">
            {!twoFaEnabled ? (
              <div>
                <h2 className="text-xl font-bold text-[#0A1628] mb-3">Activer la 2FA</h2>
                <p className="text-[#69727F] text-sm mb-6">
                  Vous aurez besoin de l'application <strong className="text-[#0A1628]">Google Authenticator</strong> (ou Authy)
                  sur votre smartphone. Un QR code vous sera fourni pour la configuration.
                </p>
                <button onClick={startSetup} disabled={loading} className="btn btn-primary">
                  <QrCode className="w-5 h-5" />
                  {loading ? 'Génération...' : 'Configurer la 2FA'}
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-[#0A1628] mb-3">Désactiver la 2FA</h2>
                <p className="text-[#69727F] text-sm mb-6">
                  Pour désactiver, vous devrez entrer un code valide depuis votre application d'authentification.
                </p>
                <button onClick={() => { setStep('disable'); setError(''); setCode(''); }} className="btn btn-danger">
                  <ShieldOff className="w-5 h-5" />
                  Désactiver la 2FA
                </button>
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 2 : QR code */}
        {step === 'setup' && (
          <div className="cyna-card p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#0A1628] mb-2">1. Scannez le QR code</h2>
              <p className="text-[#69727F] text-sm mb-4">Ouvrez Google Authenticator → + → Scanner un QR code</p>
              {qrCode && (
                <div className="inline-block p-4 bg-white border border-[#E5E9F0] rounded-xl">
                  <img src={qrCode} alt="QR code 2FA" className="w-48 h-48" />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0A1628] mb-2">Ou entrez la clé manuellement</h2>
              <div className="flex items-center gap-3 bg-[#F6F8FB] border border-[#E5E9F0] rounded-xl px-4 py-3">
                <KeyRound className="w-5 h-5 text-[#00B4D8] flex-shrink-0" />
                <code className="text-[#0098B7] font-mono text-sm tracking-widest break-all">{secretKey}</code>
              </div>
              <p className="text-[#9AA3AF] text-xs mt-2">Émetteur : CYNA · Type : TOTP · Intervalle : 30s</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0A1628] mb-2">2. Confirmez avec le premier code</h2>
              <p className="text-[#69727F] text-sm mb-4">Entrez le code à 6 chiffres affiché dans l'application pour terminer la configuration.</p>
              <div className="flex gap-3 flex-wrap">
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-40 bg-white border border-[#E5E9F0] rounded-xl px-4 py-3 text-[#0A1628] text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-4 focus:ring-[#00B4D8]/15 focus:border-[#00B4D8]"
                />
                <button onClick={confirmSetup} disabled={loading || code.length !== 6}
                  className="btn bg-[#10B981] text-white hover:bg-[#0e9f70]">
                  {loading ? 'Vérification...' : 'Activer'}
                </button>
                <button onClick={() => { setStep('idle'); setCode(''); setError(''); setQrCode(''); setSecretKey(''); }} className="btn btn-ghost">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE : Désactivation */}
        {step === 'disable' && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
              <h2 className="text-xl font-bold text-[#0A1628]">Désactiver la 2FA</h2>
            </div>
            <p className="text-[#69727F] text-sm">
              Entrez un code valide depuis votre application Google Authenticator pour confirmer.
            </p>
            <div className="flex gap-3 flex-wrap">
              <input
                type="text" inputMode="numeric" maxLength={6}
                value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-40 bg-white border border-[#FECACA] rounded-xl px-4 py-3 text-[#0A1628] text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-4 focus:ring-[#EF4444]/15 focus:border-[#EF4444]"
              />
              <button onClick={disableTwoFactor} disabled={loading || code.length !== 6}
                className="btn bg-[#EF4444] text-white hover:bg-[#DC2626]">
                {loading ? 'Désactivation...' : 'Désactiver'}
              </button>
              <button onClick={() => { setStep('idle'); setCode(''); setError(''); }} className="btn btn-ghost">
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Infos sécurité */}
        <div className="bg-[#00B4D8]/6 border border-[#00B4D8]/20 rounded-2xl p-5 text-sm text-[#69727F] space-y-1">
          <p className="font-semibold text-[#0098B7] mb-2">Comment ça fonctionne</p>
          <p>• La 2FA ajoute une couche de sécurité : à chaque connexion admin, un code temporaire vous sera demandé.</p>
          <p>• Le code change toutes les <strong className="text-[#0A1628]">30 secondes</strong> et ne peut être utilisé qu'une seule fois.</p>
          <p>• Applications compatibles : <strong className="text-[#0A1628]">Google Authenticator</strong>, Authy, 1Password, Bitwarden.</p>
          <p>• Conservez la clé secrète dans un endroit sûr en cas de perte de votre téléphone.</p>
        </div>
      </div>
    </div>
  );
}
