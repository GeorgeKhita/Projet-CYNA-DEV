import { useState } from 'react';
import { Link } from 'react-router';
import { Check, CreditCard, Shield, Lock } from 'lucide-react';

export function CheckoutPaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  const steps = [
    { id: 1, name: 'Identification', active: false, completed: true },
    { id: 2, name: 'Adresse', active: false, completed: true },
    { id: 3, name: 'Paiement', active: true, completed: false },
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
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
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
                    className={`flex-1 h-0.5 mx-4 ${
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Paiement</h1>
          <p className="text-muted-foreground mb-8">Choisissez votre méthode de paiement</p>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'card'
                  ? 'border-[#00B4D8] bg-[#00B4D8]/10'
                  : 'border-border bg-muted/50 hover:border-border'
              }`}
            >
              <CreditCard className="w-6 h-6 text-foreground mx-auto mb-2" />
              <div className="text-foreground font-semibold">Carte bancaire</div>
            </button>
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'paypal'
                  ? 'border-[#00B4D8] bg-[#00B4D8]/10'
                  : 'border-border bg-muted/50 hover:border-border'
              }`}
            >
              <div className="text-2xl mb-2">PayPal</div>
            </button>
          </div>

          {/* Card Form */}
          {paymentMethod === 'card' && (
            <form className="space-y-6">
              <div>
                <label className="block text-foreground font-medium mb-2">Numéro de carte</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-foreground font-medium mb-2">Date d'expiration</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-medium mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[#10B981] font-semibold mb-1 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Paiement sécurisé
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Conforme PCI-DSS • Données cryptées SSL • Transactions sécurisées
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to="/confirmation"
                className="block w-full py-4 bg-[#00B4D8] text-primary-foreground font-semibold rounded-lg text-center hover:bg-[#0096B8] transition-colors"
              >
                Confirmer l'achat • 3 997€
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
