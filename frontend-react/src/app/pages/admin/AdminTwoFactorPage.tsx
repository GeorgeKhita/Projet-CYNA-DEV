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
    if (code.length !== 6) { setError('Entrez un code Ã  6 chiffres.'); return; }
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
    if (code.length !== 6) { setError('Entrez un code Ã  6 chiffres.'); return; }
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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#00B4D8] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAuthenticated || user?.role !== 'admin') return <Navigate to="/connexion" replace />;

  return (
    <div className="p-8">
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-2">Authentification Ã  deux facteurs</h1>
          <p className="text-muted-foreground">Renforcez la sÃ©curitÃ© de votre compte administrateur avec Google Authenticator.</p>
        </div>

        {/* Statut */}
        <div className="cyna-card p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {twoFaEnabled
              ? <ShieldCheck className="w-10 h-10 text-[#10B981]" />
              : <ShieldOff className="w-10 h-10 text-muted-foreground" />
            }
            <div>
              <div className="text-ink font-bold text-lg">
                {twoFaEnabled ? '2FA activÃ©e' : '2FA dÃ©sactivÃ©e'}
              </div>
              <div className="text-muted-foreground text-sm">
                {twoFaEnabled
                  ? 'Votre compte est protÃ©gÃ© par une authentification Ã  deux facteurs.'
                  : 'Votre compte utilise uniquement un mot de passe.'
                }
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${twoFaEnabled ? 'bg-[#10B981]/12 text-[#059669] border border-[#10B981]/35' : 'bg-bg-muted text-muted-foreground border border-border'}`}>
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

        {/* Ã‰TAPE 1 */}
        {step === 'idle' && (
          <div className="cyna-card p-6">
            {!twoFaEnabled ? (
              <div>
                <h2 className="text-xl font-bold text-ink mb-3">Activer la 2FA</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Vous aurez besoin de l'application <strong className="text-ink">Google Authenticator</strong> (ou Authy)
                  sur votre smartphone. Un QR code vous sera fourni pour la configuration.
                </p>
                <button onClick={startSetup} disabled={loading} className="btn btn-primary">
                  <QrCode className="w-5 h-5" />
                  {loading ? 'GÃ©nÃ©ration...' : 'Configurer la 2FA'}
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-ink mb-3">DÃ©sactiver la 2FA</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Pour dÃ©sactiver, vous devrez entrer un code valide depuis votre application d'authentification.
                </p>
                <button onClick={() => { setStep('disable'); setError(''); setCode(''); }} className="btn btn-danger">
                  <ShieldOff className="w-5 h-5" />
                  DÃ©sactiver la 2FA
                </button>
              </div>
            )}
          </div>
        )}

        {/* Ã‰TAPE 2 : QR code */}
        {step === 'setup' && (
          <div className="cyna-card p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-ink mb-2">1. Scannez le QR code</h2>
              <p className="text-muted-foreground text-sm mb-4">Ouvrez Google Authenticator â†’ + â†’ Scanner un QR code</p>
              {qrCode && (
                <div className="inline-block p-4 bg-card border border-border rounded-xl">
                  <img src={qrCode} alt="QR code 2FA" className="w-48 h-48" />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-ink mb-2">Ou entrez la clÃ© manuellement</h2>
              <div className="flex items-center gap-3 bg-bg-subtle border border-border rounded-xl px-4 py-3">
                <KeyRound className="w-5 h-5 text-[#00B4D8] flex-shrink-0" />
                <code className="text-[#0098B7] font-mono text-sm tracking-widest break-all">{secretKey}</code>
              </div>
              <p className="text-muted-foreground text-xs mt-2">Ã‰metteur : CYNA Â· Type : TOTP Â· Intervalle : 30s</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-ink mb-2">2. Confirmez avec le premier code</h2>
              <p className="text-muted-foreground text-sm mb-4">Entrez le code Ã  6 chiffres affichÃ© dans l'application pour terminer la configuration.</p>
              <div className="flex gap-3 flex-wrap">
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-40 bg-card border border-border rounded-xl px-4 py-3 text-ink text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-4 focus:ring-[#00B4D8]/15 focus:border-[#00B4D8]"
                />
                <button onClick={confirmSetup} disabled={loading || code.length !== 6}
                  className="btn bg-[#10B981] text-white hover:bg-[#0e9f70]">
                  {loading ? 'VÃ©rification...' : 'Activer'}
                </button>
                <button onClick={() => { setStep('idle'); setCode(''); setError(''); setQrCode(''); setSecretKey(''); }} className="btn btn-ghost">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ã‰TAPE : DÃ©sactivation */}
        {step === 'disable' && (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
              <h2 className="text-xl font-bold text-ink">DÃ©sactiver la 2FA</h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Entrez un code valide depuis votre application Google Authenticator pour confirmer.
            </p>
            <div className="flex gap-3 flex-wrap">
              <input
                type="text" inputMode="numeric" maxLength={6}
                value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-40 bg-card border border-destructive/40 rounded-xl px-4 py-3 text-ink text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-4 focus:ring-[#EF4444]/15 focus:border-[#EF4444]"
              />
              <button onClick={disableTwoFactor} disabled={loading || code.length !== 6}
                className="btn bg-[#EF4444] text-white hover:bg-[#DC2626]">
                {loading ? 'DÃ©sactivation...' : 'DÃ©sactiver'}
              </button>
              <button onClick={() => { setStep('idle'); setCode(''); setError(''); }} className="btn btn-ghost">
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Infos sÃ©curitÃ© */}
        <div className="bg-[#00B4D8]/6 border border-[#00B4D8]/20 rounded-2xl p-5 text-sm text-muted-foreground space-y-1">
          <p className="font-semibold text-[#0098B7] mb-2">Comment Ã§a fonctionne</p>
          <p>â€¢ La 2FA ajoute une couche de sÃ©curitÃ© : Ã  chaque connexion admin, un code temporaire vous sera demandÃ©.</p>
          <p>â€¢ Le code change toutes les <strong className="text-ink">30 secondes</strong> et ne peut Ãªtre utilisÃ© qu'une seule fois.</p>
          <p>â€¢ Applications compatibles : <strong className="text-ink">Google Authenticator</strong>, Authy, 1Password, Bitwarden.</p>
          <p>â€¢ Conservez la clÃ© secrÃ¨te dans un endroit sÃ»r en cas de perte de votre tÃ©lÃ©phone.</p>
        </div>
      </div>
    </div>
  );
}
