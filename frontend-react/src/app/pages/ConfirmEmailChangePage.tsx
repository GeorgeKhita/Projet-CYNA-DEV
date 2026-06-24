import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export function ConfirmEmailChangePage() {
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Lien invalide. Les paramètres sont manquants.');
      return;
    }

    api.get<{ message: string; user: any }>(
      `/auth/confirm-email-change?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
    )
      .then((data) => {
        setStatus('success');
        setMessage(data.message);
        if (data.user) {
          updateUser({ email: data.user.email });
        }
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Lien de confirmation invalide ou déjà utilisé.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-subtle to-background flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md fade-up">
        <div className="cyna-card p-8 shadow-[var(--shadow-lg)] text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B4D8] to-[#0098B7] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(0,180,216,0.35)]">⬡</div>
            <span className="text-2xl font-bold text-ink">CYNA</span>
          </div>

          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-[#00B4D8] mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-ink mb-3">Confirmation en cours...</h1>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-ink mb-3">Adresse email mise à jour !</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Link to="/espace-client/parametres" className="btn btn-primary btn-block">
                Retour aux paramètres
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-ink mb-3">Lien invalide</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Link to="/espace-client/parametres" className="btn btn-outline btn-block">
                Retour aux paramètres
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
