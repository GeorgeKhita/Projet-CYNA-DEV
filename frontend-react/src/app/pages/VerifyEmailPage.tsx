import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Lien invalide. Les paramètres de vérification sont manquants.');
      return;
    }

    api.get<{ message: string; user: any; token: string }>(
      `/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
    )
      .then((data) => {
        setStatus('success');
        setMessage(data.message);
        if (data.token && data.user) {
          login(data.token, data.user);
          setTimeout(() => navigate('/espace-client'), 2000);
        }
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Lien de vérification invalide ou expiré.');
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
              <h1 className="text-2xl font-bold text-ink mb-3">Vérification en cours...</h1>
              <p className="text-muted-foreground">Validation de votre adresse email.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-ink mb-3">Email confirmé !</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <p className="text-sm text-muted-foreground mb-4">Redirection vers votre espace client...</p>
              <Link to="/espace-client" className="btn btn-primary btn-block">
                Accéder à mon espace client
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-ink mb-3">Lien invalide</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="space-y-3">
                <Link to="/inscription" className="btn btn-primary btn-block">
                  Créer un nouveau compte
                </Link>
                <Link to="/connexion" className="btn btn-outline btn-block">
                  Se connecter
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
