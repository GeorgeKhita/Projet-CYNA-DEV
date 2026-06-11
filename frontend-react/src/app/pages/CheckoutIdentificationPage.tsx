import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Check, Mail, Lock } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export function CheckoutIdentificationPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/checkout/paiement', { replace: true });
  }, [isAuthenticated]);

  const steps = [
    { id: 1, name: 'Identification', active: true,  completed: false },
    { id: 2, name: 'Paiement',       active: false, completed: false },
    { id: 3, name: 'Confirmation',   active: false, completed: false },
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post<{ token: string; user: any }>('/auth/login', { email, password });
      login(data.token, data.user);
      navigate('/checkout/paiement');
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step.completed ? 'bg-[#10B981] text-white' : step.active ? 'bg-[#00B4D8] text-[#06222C] shadow-[var(--shadow-cyan)]' : 'bg-[#F6F8FB] border border-[#E5E9F0] text-[#9AA3AF]'
                  }`}>
                    {step.completed ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`font-semibold hidden sm:block ${step.active || step.completed ? 'text-[#0A1628]' : 'text-[#9AA3AF]'}`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step.completed ? 'bg-[#10B981]' : 'bg-[#E5E9F0]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="cyna-card p-8 shadow-[var(--shadow-md)]">
          <h1 className="text-3xl font-bold text-[#0A1628] mb-2">Identification</h1>
          <p className="text-[#69727F] mb-8">Connectez-vous pour finaliser votre commande</p>

          {error && (
            <div className="mb-6 px-4 py-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#DC2626] text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#0A1628] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="votre.email@entreprise.com" className="field field-icon" />
              </div>
            </div>
            <div>
              <label className="block text-[#0A1628] mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA3AF]" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••" className="field field-icon" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block">
              {loading ? 'Connexion...' : 'Continuer vers le paiement'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/inscription" className="text-[#0098B7] hover:underline font-semibold">Pas de compte ? S'inscrire</Link>
            <Link to="/mot-de-passe-oublie" className="text-[#69727F] hover:text-[#0098B7] transition-colors">Mot de passe oublié ?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
