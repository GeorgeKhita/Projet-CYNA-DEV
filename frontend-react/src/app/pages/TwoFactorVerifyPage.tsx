import { useState, FormEvent, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ShieldCheck } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export function TwoFactorVerifyPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!sessionStorage.getItem('2fa_pending_token')) {
      navigate('/connexion');
    }
    inputRefs.current[0]?.focus();
  }, [navigate]);

  function handleDigit(idx: number, val: string) {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = v;
    setDigits(next);
    if (v && idx < 5) inputRefs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) { setError('Entrez les 6 chiffres.'); return; }

    const pendingToken = sessionStorage.getItem('2fa_pending_token');
    if (!pendingToken) { navigate('/connexion'); return; }

    setLoading(true); setError('');
    try {
      const data = await api.post<{ token: string; user: any }>('/auth/admin/verify-2fa', {
        pending_token: pendingToken,
        code,
      });
      sessionStorage.removeItem('2fa_pending_token');
      login(data.token, data.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Code invalide.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F8FB] to-white flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md fade-up">
        <div className="cyna-card p-8 shadow-[var(--shadow-lg)]">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00B4D8]/10 border border-[#00B4D8]/30 rounded-2xl mb-4">
              <ShieldCheck className="w-8 h-8 text-[#00B4D8]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0A1628] mb-2">Vérification en 2 étapes</h1>
            <p className="text-[#69727F] text-sm">
              Ouvrez <strong className="text-[#0A1628]">Google Authenticator</strong> et entrez
              le code à 6 chiffres affiché pour CYNA.
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#DC2626] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-[#F6F8FB] border border-[#E5E9F0] rounded-xl text-[#0A1628] focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#00B4D8]/15 focus:border-[#00B4D8] transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || digits.join('').length !== 6}
              className="btn btn-primary btn-block btn-lg"
            >
              {loading ? 'Vérification...' : 'Vérifier le code'}
            </button>
          </form>

          <p className="text-center text-sm text-[#9AA3AF] mt-6">
            Le code change toutes les 30 secondes.{' '}
            <button onClick={() => navigate('/connexion')} className="text-[#0098B7] hover:underline font-semibold">
              Retour à la connexion
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
