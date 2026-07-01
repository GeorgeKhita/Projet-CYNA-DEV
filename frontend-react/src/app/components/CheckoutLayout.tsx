import { Outlet, useLocation } from 'react-router';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STEPS = [
  { id: 1, segment: 'identification', key: 'checkout.step_identification' },
  { id: 2, segment: 'adresse',        key: 'checkout.step_address' },
  { id: 3, segment: 'paiement',       key: 'checkout.step_payment' },
  { id: 4, segment: 'confirmation',   key: 'checkout.step_confirmation' },
];

export function CheckoutLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const currentIndex = STEPS.findIndex(s => pathname.includes(s.segment));
  const currentStep  = currentIndex === -1 ? 1 : currentIndex + 1;

  const steps = STEPS.map((s, i) => ({
    ...s,
    name:      t(s.key),
    active:    i + 1 === currentStep,
    completed: i + 1 < currentStep,
  }));

  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Barre de progression */}
        <nav className="mb-12" aria-label="Étapes du tunnel de commande">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step.completed
                      ? 'bg-[#10B981] text-white'
                      : step.active
                        ? 'bg-[#00B4D8] text-[#06222C] shadow-[var(--shadow-cyan)]'
                        : 'bg-bg-subtle border border-border text-muted-foreground'
                  }`}>
                    {step.completed ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`font-semibold hidden sm:block ${step.active || step.completed ? 'text-ink' : 'text-muted-foreground'}`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step.completed ? 'bg-[#10B981]' : 'bg-[#1e3a5f]'}`} />
                )}
              </div>
            ))}
          </div>
        </nav>

        <Outlet />
      </div>
    </div>
  );
}
