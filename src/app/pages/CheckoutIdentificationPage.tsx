import { Link } from 'react-router';
import { Check } from 'lucide-react';

export function CheckoutIdentificationPage() {
  const steps = [
    { id: 1, name: 'Identification', active: true, completed: false },
    { id: 2, name: 'Adresse', active: false, completed: false },
    { id: 3, name: 'Paiement', active: false, completed: false },
    { id: 4, name: 'Confirmation', active: false, completed: false },
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step.completed
                        ? 'bg-[#10B981] text-primary-foreground'
                        : step.active
                        ? 'bg-[#00B4D8] text-primary-foreground'
                        : 'bg-muted/50 border border-border text-muted-foreground'
                    }`}
                  >
                    {step.completed ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span
                    className={`font-medium hidden sm:block ${
                      step.active || step.completed ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 transition-all ${
                      step.completed ? 'bg-[#10B981]' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-gradient-to-br from-card to-card border border-border rounded-xl p-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Identification</h1>
          <p className="text-muted-foreground mb-8">Connectez-vous ou créez un compte pour continuer</p>

          <form className="space-y-6">
            <div>
              <label className="block text-foreground font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="votre.email@entreprise.com"
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-foreground font-medium mb-2">Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
              />
            </div>

            <Link
              to="/checkout/paiement"
              className="flex items-center justify-center gap-2 w-full py-4 bg-[#00B4D8] text-primary-foreground font-semibold rounded-lg hover:bg-[#0096B8] transition-colors"
            >
              Continuer
            </Link>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/inscription" className="text-[#00B4D8] hover:underline">
              Pas de compte ? S'inscrire
            </Link>
            <button className="text-muted-foreground hover:text-[#00B4D8] transition-colors">
              Continuer en invité
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
