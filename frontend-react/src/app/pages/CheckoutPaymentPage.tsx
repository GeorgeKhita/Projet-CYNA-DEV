import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Check, Shield, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { api } from '../../api/client';
import { getCart, clearCart } from '../../lib/cart';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#0A1628',
      fontFamily: 'inherit',
      fontSize: '16px',
      '::placeholder': { color: '#9AA3AF' },
    },
    invalid: { color: '#EF4444' },
  },
};

const steps = [
  { id: 1, name: 'Identification', active: false, completed: true },
  { id: 2, name: 'Adresse', active: false, completed: true },
  { id: 3, name: 'Paiement', active: true, completed: false },
  { id: 4, name: 'Confirmation', active: false, completed: false },
];

function PaymentForm() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (cart.length === 0) return;
    api.post<{ client_secret: string }>('/payments/intent', { amount: total })
      .then(res => setClientSecret(res.client_secret))
      .catch(() => setError("Impossible d'initialiser le paiement. Réessayez."));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    if (cart.length === 0) { setError('Votre panier est vide.'); return; }

    setLoading(true);
    setError('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Erreur de paiement.');
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        const orderData = {
          payment_intent_id: paymentIntent.id,
          subtotal: total,
          tax: 0,
          total,
          items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
            duration: item.duration,
          })),
        };
        const res = await api.post<any>('/orders', orderData);
        clearCart();
        navigate('/confirmation', { state: { order: res, cart } });
      } catch {
        setError('Paiement réussi mais erreur lors de la création de la commande. Contactez le support.');
      }
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-ink mb-2">Informations de carte</label>
        <div className="w-full bg-card border border-border rounded-xl px-4 py-3.5 focus-within:ring-4 focus-within:ring-[#00B4D8]/15 focus-within:border-[#00B4D8] transition-all">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Testez avec <span className="text-ink-soft font-mono">4242 4242 4242 4242</span> · exp. future · CVV quelconque
        </p>
      </div>

      <div className="bg-[#10B981]/8 border border-[#10B981]/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-success font-semibold mb-1 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Paiement sécurisé par Stripe
            </div>
            <div className="text-sm text-ink-soft">Conforme PCI-DSS · Données cryptées SSL · Transactions sécurisées</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>
      )}

      <button type="submit" disabled={loading || !stripe || !clientSecret} className="btn btn-primary btn-lg btn-block">
        {loading ? 'Traitement...' : `Confirmer l'achat · ${total.toLocaleString('fr-FR')}€`}
      </button>
    </form>
  );
}

export function CheckoutPaymentPage() {
  return (
    <div className="min-h-screen bg-card py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step.completed ? 'bg-[#10B981] text-white' : step.active ? 'bg-[#00B4D8] text-[#06222C] shadow-[var(--shadow-cyan)]' : 'bg-bg-subtle border border-border text-muted-foreground'
                  }`}>
                    {step.completed ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`font-semibold hidden sm:block ${step.active || step.completed ? 'text-ink' : 'text-muted-foreground'}`}>{step.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step.completed ? 'bg-[#10B981]' : 'bg-[#E5E9F0]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="cyna-card p-8 shadow-[var(--shadow-md)]">
          <h1 className="text-3xl font-bold text-ink mb-2">Paiement</h1>
          <p className="text-muted-foreground mb-8">Entrez vos informations de carte bancaire</p>

          <Elements stripe={stripePromise}>
            <PaymentForm />
          </Elements>
        </div>
      </div>
    </div>
  );
}
