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
      color: '#e5e7eb',
      fontFamily: 'inherit',
      fontSize: '16px',
      '::placeholder': { color: '#6b7280' },
    },
    invalid: { color: '#f87171' },
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
        <label className="block text-white font-medium mb-2">Informations de carte</label>
        <div className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3.5 focus-within:ring-2 focus-within:ring-[#00B4D8]">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Testez avec <span className="text-gray-400 font-mono">4242 4242 4242 4242</span> · exp. future · CVV quelconque
        </p>
      </div>

      <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-[#10B981] font-semibold mb-1 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Paiement sécurisé par Stripe
            </div>
            <div className="text-sm text-gray-300">Conforme PCI-DSS · Données cryptées SSL · Transactions sécurisées</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe || !clientSecret}
        className="block w-full py-4 bg-[#00B4D8] text-[#0A1628] font-semibold rounded-lg text-center hover:bg-[#0096B8] transition-colors disabled:opacity-60"
      >
        {loading ? 'Traitement...' : `Confirmer l'achat · ${total.toLocaleString('fr-FR')}€`}
      </button>
    </form>
  );
}

export function CheckoutPaymentPage() {
  return (
    <div className="min-h-screen bg-[#0A1628] py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step.completed ? 'bg-[#10B981] text-white' : step.active ? 'bg-[#00B4D8] text-[#0A1628]' : 'bg-white/5 border border-white/10 text-gray-400'
                  }`}>
                    {step.completed ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`font-medium hidden sm:block ${step.active || step.completed ? 'text-white' : 'text-gray-400'}`}>{step.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${step.completed ? 'bg-[#10B981]' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paiement</h1>
          <p className="text-gray-400 mb-8">Entrez vos informations de carte bancaire</p>

          <Elements stripe={stripePromise}>
            <PaymentForm />
          </Elements>
        </div>
      </div>
    </div>
  );
}
