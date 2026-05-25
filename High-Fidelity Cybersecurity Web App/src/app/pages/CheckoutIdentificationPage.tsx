import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Check, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const steps = [
  { id: 1, name: 'Identification', active: true,  completed: false },
  { id: 2, name: 'Adresse',        active: false, completed: false },
  { id: 3, name: 'Paiement',       active: false, completed: false },
  { id: 4, name: 'Confirmation',   active: false, completed: false },
];

export function CheckoutIdentificationPage() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // Si déjà connecté → passer directement à l'étape adresse
  useEffect(() => {
    if (isAuthenticated) navigate('/checkout/adresse', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Barre de progression */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step.completed ? 'bg-[#10B981] text-white' : step.active ? 'bg-[#00B4D8] text-[#0A1628]' : 'bg-white/5 border border-white/10 text-gray-400'
                  }`}>
                    {step.completed ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`font-medium hidden sm:block ${step.active || step.completed ? 'text-white' : 'text-gray-400'}`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step.completed ? 'bg-[#10B981]' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-[#00B4D8]/20 border border-[#00B4D8]/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-[#00B4D8]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Identification requise</h1>
          <p className="text-gray-400 mb-8">Connectez-vous pour finaliser votre commande</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/connexion"
              state={{ from: '/checkout/adresse' }}
              className="px-8 py-4 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg hover:bg-[#0096B8] transition-colors"
            >
              Se connecter
            </Link>
            <Link
              to="/inscription"
              state={{ from: '/checkout/adresse' }}
              className="px-8 py-4 border border-[#00B4D8] text-[#00B4D8] font-semibold rounded-lg hover:bg-[#00B4D8]/10 transition-colors"
            >
              Créer un compte
            </Link>
          </div>

          <Link to="/panier" className="block mt-6 text-sm text-gray-400 hover:text-[#00B4D8] transition-colors">
            ← Retour au panier
          </Link>
        </div>
      </div>
    </div>
  );
}
